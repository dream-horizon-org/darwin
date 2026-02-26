# Darwin ML Platform - AWS Cloud Infrastructure Refinement

**Version:** 1.0  
**Date:** January 2026  
**Scope:** Phase 1 - Compute, Workspace, MLFlow, Serve  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Infrastructure Tasks Breakdown](#3-infrastructure-tasks-breakdown)
4. [OpenTofu Module Structure](#4-opentofu-module-structure)
5. [Detailed Implementation Steps](#5-detailed-implementation-steps)
6. [Code Changes Required](#6-code-changes-required)
7. [Deployment Sequence](#7-deployment-sequence)
8. [Validation Checklist](#8-validation-checklist)
9. [Estimated Costs](#9-estimated-costs)

---

## 1. Architecture Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AWS (us-east-1)                                          │
│                                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                              VPC (10.0.0.0/16)                                      │    │
│  │                                                                                     │    │
│  │  PUBLIC SUBNETS (10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24)                             │    │
│  │  ┌────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │  • NAT Gateway (single for cost, multi for HA)                                 │ │    │
│  │  │  • Application Load Balancer                                                   │ │    │
│  │  │  • Internet Gateway                                                            │ │    │
│  │  └────────────────────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                                     │    │
│  │  PRIVATE SUBNETS (10.0.11.0/24, 10.0.12.0/24, 10.0.13.0/24)                         │    │
│  │  ┌────────────────────────────────────────────────────────────────────────────────┐ │    │
│  │  │                                                                                │ │    │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────┐  │ │    │
│  │  │  │                    EKS AUTO MODE CLUSTER                                 │  │ │    │
│  │  │  │                                                                          │  │ │    │
│  │  │  │  NODE POOLS:                                                             │  │ │    │
│  │  │  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                │  │ │    │
│  │  │  │  │ default        │ │ ray            │ │ serve          │                │  │ │    │
│  │  │  │  │ (operators,    │ │ (ray clusters, │ │ (model pods,   │                │  │ │    │
│  │  │  │  │  services)     │ │  training)     │ │  jupyter,      │                │  │ │    │
│  │  │  │  │ t3.large       │ │ m5/m6i/g5      │ │  spark-hs)     │                │  │ │    │
│  │  │  │  │ 2-5 nodes      │ │ auto-scale     │ │ auto-scale     │                │  │ │    │
│  │  │  │  └────────────────┘ └────────────────┘ └────────────────┘                │  │ │    │
│  │  │  │                                                                          │  │ │    │
│  │  │  │  NAMESPACES:                                                             │  │ │    │
│  │  │  │  • darwin (services)     • ray (clusters)     • serve (inference)        │  │ │    │
│  │  │  │                                                                          │  │ │    │
│  │  │  │  OPERATORS:                                                              │  │ │    │
│  │  │  │  • Karpenter • VPC CNI • CoreDNS • ALB Controller • KubeRay              │  │ │    │
│  │  │  │  • Nginx Ingress • Kube-Prometheus • Cert-Manager • ArgoCD               │  │ │    │
│  │  │  └──────────────────────────────────────────────────────────────────────────┘  │ │    │
│  │  │                                                                                │ │    │
│  │  │  ┌─────────────────┐  ┌─────────────────┐                                      │ │    │
│  │  │  │   RDS MySQL     │  │   EFS           │                                      │ │    │
│  │  │  │   (Multi-AZ)    │  │   (Workspace)   │                                      │ │    │
│  │  │  │   10.0.11.100   │  │   Mount targets │                                      │ │    │
│  │  │  └─────────────────┘  └─────────────────┘                                      │ │    │
│  │  │                                                                                │ │    │
│  │  │  VPC ENDPOINTS:                                                                │ │    │
│  │  │  • S3 (Gateway) • ECR (Interface) • Secrets Manager (Interface)                │ │    │
│  │  │                                                                                │ │    │
│  │  └────────────────────────────────────────────────────────────────────────────────┘ │    │
│  │                                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                             │
│  REGIONAL SERVICES (Outside VPC):                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │      S3         │  │      ECR        │  │ Secrets Manager │  │   Route 53      │         │
│  │  • mlflow-arts  │  │  • darwin imgs  │  │  • db creds     │  │  • DNS          │         │
│  │  • kubeconfigs  │  │  • ray imgs     │  │  • api keys     │  │                 │         │
│  │  • model arts   │  │                 │  │                 │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Phase 1 Service Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PHASE 1 SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │    COMPUTE      │    │    WORKSPACE    │    │     MLFLOW      │          │
│  │                 │    │                 │    │                 │          │
│  │ darwin-compute  │    │darwin-workspace │    │ darwin-mlflow   │          │
│  │ cluster-manager │    │                 │    │ darwin-mlflow-  │          │
│  │                 │    │                 │    │ app             │          │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘          │
│           │                      │                      │                   │
│           │    ┌─────────────────┐                      │                   │
│           │    │     SERVE       │                      │                   │
│           │    │                 │                      │                   │
│           │    │ ml-serve-app    │──────────────────────┘                   │
│           │    │ artifact-builder│                                          │
│           │    └────────┬────────┘                                          │
│           │             │                                                   │
├───────────┴─────────────┴───────────────────────────────────────────────────┤
│                          REQUIRED DATASTORES                                │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    MySQL     │  │     S3       │  │     EFS      │  │  OpenSearch  │     │
│  │   (RDS)      │  │              │  │              │  │  (Optional)  │     │
│  │              │  │              │  │              │  │              │     │
│  │ All services │  │ MLFlow arts  │  │ Workspace    │  │ Compute      │     │
│  │ use this     │  │ DCM configs  │  │ files        │  │ metadata     │     │
│  │              │  │ Model arts   │  │              │  │ search       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Architecture Diagram Notes

| Component | Status | Notes |
|-----------|--------|-------|
| OpenSearch | Optional for Phase 1 | Can defer to Phase 2 or use CloudWatch Logs |
| ECR | Optional | Can use Docker Hub (`darwinhq/*`) instead, but ECR is better for production |
| Lambda/SQS | Not needed | Only required for Chronos (Phase 2) |
| Kafka/Zookeeper | Not needed | Only required for Feature Store & Chronos (Phase 2) |
| EFS | Required | Workspace uses `/var/www/fsx/workspace` |

---

## 2. Prerequisites

### 2.1 AWS Account Requirements

| Requirement | Details |
|-------------|---------|
| **AWS Account** | Production account with appropriate limits |
| **IAM User/Role** | Admin access for OpenTofu, or specific permissions (see below) |
| **Service Quotas** | EKS clusters: 100, VPCs: 5, NAT Gateways: 5 per AZ |
| **Region** | us-east-1 (or your preferred region with all services available) |

### 2.2 Required IAM Permissions for OpenTofu

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "eks:*",
        "rds:*",
        "s3:*",
        "ecr:*",
        "elasticfilesystem:*",
        "iam:*",
        "secretsmanager:*",
        "kms:*",
        "logs:*",
        "route53:*",
        "elasticloadbalancing:*",
        "autoscaling:*",
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2.3 Subnet CIDR Planning

**Recommended:** `/22` for private subnets (EKS pods need many IPs)

```
VPC:           10.0.0.0/16     (65,536 IPs)
├── Public:    10.0.0.0/22     (1,024 IPs) - Split across 3 AZs
│   ├── AZ-a:  10.0.0.0/24
│   ├── AZ-b:  10.0.1.0/24
│   └── AZ-c:  10.0.2.0/24
└── Private:   10.0.16.0/20    (4,096 IPs) - Split across 3 AZs
    ├── AZ-a:  10.0.16.0/22
    ├── AZ-b:  10.0.20.0/22
    └── AZ-c:  10.0.24.0/22
```

---

## 3. Infrastructure Tasks Breakdown

### Task Matrix

| # | Task | OpenTofu? | Complexity | Dependencies | Est. Effort |
|---|------|-----------|------------|--------------|-------------|
| 1 | VPC Setup | ✅ Yes | Low | None | 4h |
| 2 | Public/Private Subnets | ✅ Yes | Low | VPC | 4h |
| 3 | Internet Gateway | ✅ Yes | Low | VPC | 2h |
| 4 | NAT Gateway | ✅ Yes | Low | Public Subnet, EIP | 2h |
| 5 | Route Tables & Routes | ✅ Yes | Low | VPC, Subnets, IGW, NAT | 4h |
| 6 | VPC Endpoints (S3, ECR) | ✅ Yes | Medium | VPC, Subnets, Route Tables | 6h |
| 7 | Security Groups | ✅ Yes | Medium | VPC | 6h |
| 8 | RDS MySQL | ✅ Yes | Medium | VPC, Subnets, SGs | 8h |
| 9 | EFS | ✅ Yes | Medium | VPC, Subnets, SGs | 6h |
| 10 | S3 Buckets | ✅ Yes | Low | None | 4h |
| 11 | ECR Repositories | ✅ Yes | Low | None | 4h |
| 12 | EKS Cluster (Auto Mode) | ✅ Yes | High | VPC, Subnets, IAM | 16h |
| 13 | EKS Node Pools | ✅ Yes | High | EKS Cluster | 12h |
| 14 | IAM Roles (IRSA) | ✅ Yes | Medium | EKS Cluster | 8h |
| 15 | Kubeconfig to S3 | ✅ Yes (null_resource) | Low | EKS, S3 | 4h |
| 16 | ArgoCD Installation | ⚠️ Partial (Helm provider) | Medium | EKS Cluster | 8h |
| 17 | K8s Operators | ⚠️ Partial (Helm provider) | Medium | EKS Cluster | 12h |
| 18 | Darwin Helm Deploy | ⚠️ Partial (Helm provider) | High | All above | 16h |
| 19 | Code Config Changes | ❌ Manual | Medium | N/A | 8h |
| 20 | Code Changes (nodepools) | ❌ Manual | Medium | N/A | 12h |

**Legend:**
- ✅ Yes = Fully automatable with OpenTofu
- ⚠️ Partial = Can use Helm/Kubernetes provider, may need manual validation
- ❌ Manual = Code changes, not infrastructure

**Total Estimated Effort:** ~73 hours (excluding testing and iteration)

---

## 4. OpenTofu Module Structure

### 4.1 Recommended Directory Structure

```
terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── subnets.tf
│   │   ├── nat.tf
│   │   ├── routes.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── eks/
│   │   ├── main.tf
│   │   ├── node-pools.tf
│   │   ├── iam.tf
│   │   ├── addons.tf
│   │   ├── kubeconfig.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── rds/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── efs/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── s3/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── ecr/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── vpc-endpoints/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── security-groups/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── helm-releases/
│       ├── argocd.tf
│       ├── operators.tf
│       ├── darwin.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   ├── backend.tf
│   │   └── providers.tf
│   ├── staging/
│   │   └── ...
│   └── prod/
│       └── ...
└── scripts/
    ├── upload-kubeconfig.sh
    └── bootstrap-argocd.sh
```

### 4.2 Provider Configuration

```hcl
# environments/dev/providers.tf

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "darwin"
      Environment = var.environment
      ManagedBy   = "opentofu"
    }
  }
}

# Kubernetes provider configured after EKS is created
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)
  
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)
    
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}
```

---

## 5. Detailed Implementation Steps

### Task 1: VPC Setup

**What OpenTofu Does:**
- Creates VPC with specified CIDR block
- Enables DNS hostnames and DNS support
- Tags for Kubernetes integration

```hcl
# modules/vpc/main.tf

resource "aws_vpc" "darwin" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "darwin" {
  vpc_id = aws_vpc.darwin.id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}
```

**Variables needed:**
```hcl
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "project_name" {
  default = "darwin"
}

variable "environment" {
  default = "dev"
}

variable "cluster_name" {
  description = "EKS cluster name for tagging"
}
```

---

### Task 2-3: Public and Private Subnets

**What OpenTofu Does:**
- Creates subnets across multiple AZs
- Tags subnets for EKS auto-discovery (ALB, internal LB)

```hcl
# modules/vpc/subnets.tf

data "aws_availability_zones" "available" {
  state = "available"
}

# Public Subnets
resource "aws_subnet" "public" {
  count = length(var.availability_zones)
  
  vpc_id                  = aws_vpc.darwin.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-public-${var.availability_zones[count.index]}"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"  # For public ALB
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.darwin.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.project_name}-${var.environment}-private-${var.availability_zones[count.index]}"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"  # For internal ALB
    "karpenter.sh/discovery"                    = var.cluster_name  # For Karpenter
  }
}
```

---

### Task 4: NAT Gateway

**What OpenTofu Does:**
- Allocates Elastic IP
- Creates NAT Gateway in public subnet
- (Optional) Multi-NAT for high availability

```hcl
# modules/vpc/nat.tf

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  count  = var.single_nat_gateway ? 1 : length(var.availability_zones)
  domain = "vpc"
  
  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip-${count.index}"
  }
  
  depends_on = [aws_internet_gateway.darwin]
}

# NAT Gateway
resource "aws_nat_gateway" "darwin" {
  count = var.single_nat_gateway ? 1 : length(var.availability_zones)
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-nat-${count.index}"
  }
  
  depends_on = [aws_internet_gateway.darwin]
}
```

**Cost Consideration:**
| Configuration | Monthly Cost |
|---------------|--------------|
| Single NAT | ~$32 + data processing |
| Multi-NAT (3 AZs) | ~$96 + data processing |

**Recommendation:** Single for dev, Multi for prod

---

### Task 5: Route Tables and Networking

**What OpenTofu Does:**
- Creates route tables for public and private subnets
- Routes internet traffic appropriately

```hcl
# modules/vpc/routes.tf

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.darwin.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.darwin.id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

# Associate public subnets
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Tables (one per AZ if multi-NAT)
resource "aws_route_table" "private" {
  count  = var.single_nat_gateway ? 1 : length(var.availability_zones)
  vpc_id = aws_vpc.darwin.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.darwin[var.single_nat_gateway ? 0 : count.index].id
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-private-rt-${count.index}"
  }
}

# Associate private subnets
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[var.single_nat_gateway ? 0 : count.index].id
}
```

---

### Task 6: VPC Endpoints

**What OpenTofu Does:**
- Creates Gateway endpoint for S3 (free)
- Creates Interface endpoints for ECR, Secrets Manager (has hourly cost)

```hcl
# modules/vpc-endpoints/main.tf

# S3 Gateway Endpoint (FREE)
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = var.private_route_table_ids
  
  tags = {
    Name = "${var.project_name}-${var.environment}-s3-endpoint"
  }
}

# ECR API Endpoint (for docker login)
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.private_subnet_ids
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-ecr-api-endpoint"
  }
}

# ECR DKR Endpoint (for docker pull/push)
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.private_subnet_ids
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-ecr-dkr-endpoint"
  }
}

# Secrets Manager Endpoint
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.private_subnet_ids
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}-secretsmanager-endpoint"
  }
}

# Security Group for VPC Endpoints
resource "aws_security_group" "vpc_endpoints" {
  name_prefix = "${var.project_name}-${var.environment}-vpce-"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-vpce-sg"
  }
}
```

**Cost:**
| Endpoint | Monthly Cost |
|----------|--------------|
| S3 Gateway | FREE |
| Interface endpoints | ~$7.20/endpoint/AZ + data |
| 3 endpoints × 3 AZs | ~$65/month |

---

### Task 7: Security Groups

**What OpenTofu Does:**
- Creates security groups for EKS, RDS, EFS
- Defines ingress/egress rules

```hcl
# modules/security-groups/main.tf

# EKS Cluster Security Group (additional rules)
resource "aws_security_group" "eks_cluster" {
  name_prefix = "${var.project_name}-${var.environment}-eks-cluster-"
  vpc_id      = var.vpc_id
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-eks-cluster-sg"
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
    description     = "MySQL from EKS"
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }
}

# EFS Security Group
resource "aws_security_group" "efs" {
  name_prefix = "${var.project_name}-${var.environment}-efs-"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
    description     = "NFS from EKS"
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-efs-sg"
  }
}
```

---

### Task 8: RDS MySQL

**What OpenTofu Does:**
- Creates DB subnet group
- Creates RDS MySQL instance
- Stores credentials in Secrets Manager

```hcl
# modules/rds/main.tf

resource "aws_db_subnet_group" "darwin" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids
  
  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

resource "random_password" "rds" {
  length  = 32
  special = false  # Avoid special chars that might cause issues
}

resource "aws_secretsmanager_secret" "rds" {
  name = "${var.project_name}/${var.environment}/rds/credentials"
}

resource "aws_secretsmanager_secret_version" "rds" {
  secret_id = aws_secretsmanager_secret.rds.id
  secret_string = jsonencode({
    username = var.rds_username
    password = random_password.rds.result
    host     = aws_db_instance.darwin.address
    port     = 3306
    dbname   = var.rds_database_name
  })
}

resource "aws_db_instance" "darwin" {
  identifier = "${var.project_name}-${var.environment}-mysql"
  
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = var.rds_instance_class
  allocated_storage    = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = var.rds_database_name
  username = var.rds_username
  password = random_password.rds.result
  
  db_subnet_group_name   = aws_db_subnet_group.darwin.name
  vpc_security_group_ids = [var.rds_security_group_id]
  
  multi_az               = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention
  deletion_protection    = var.environment == "prod"
  skip_final_snapshot    = var.environment != "prod"
  
  # Performance Insights (free tier for 7 days retention)
  performance_insights_enabled = true
  performance_insights_retention_period = 7
  
  tags = {
    Name = "${var.project_name}-${var.environment}-mysql"
  }
}
```

**Database Schemas Required:**
Darwin services expect these databases (create after RDS is up):
- `darwin_compute`
- `darwin_mlflow`
- `darwin_workspace`
- `darwin_serve`

---

### Task 9: EFS

**What OpenTofu Does:**
- Creates EFS file system
- Creates mount targets in each private subnet
- Creates access point for Workspace

```hcl
# modules/efs/main.tf

resource "aws_efs_file_system" "darwin" {
  creation_token = "${var.project_name}-${var.environment}-efs"
  encrypted      = true
  
  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"
  
  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-efs"
  }
}

# Mount targets in each private subnet
resource "aws_efs_mount_target" "darwin" {
  count = length(var.private_subnet_ids)
  
  file_system_id  = aws_efs_file_system.darwin.id
  subnet_id       = var.private_subnet_ids[count.index]
  security_groups = [var.efs_security_group_id]
}

# Access point for Workspace service
resource "aws_efs_access_point" "workspace" {
  file_system_id = aws_efs_file_system.darwin.id
  
  posix_user {
    gid = 1000
    uid = 1000
  }
  
  root_directory {
    path = "/workspace"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "755"
    }
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-workspace-ap"
  }
}
```

---

### Task 10: S3 Buckets

**What OpenTofu Does:**
- Creates buckets for MLflow artifacts, kubeconfigs, model artifacts

```hcl
# modules/s3/main.tf

locals {
  bucket_names = [
    "mlflow-artifacts",        # MLflow model artifacts
    "cluster-manager-configs", # Kubeconfigs for DCM
    "serve-artifacts",         # Serve model files
  ]
}

resource "aws_s3_bucket" "darwin" {
  for_each = toset(local.bucket_names)
  
  bucket = "${var.project_name}-${var.environment}-${each.key}-${var.aws_account_id}"
  
  tags = {
    Name = "${var.project_name}-${var.environment}-${each.key}"
  }
}

resource "aws_s3_bucket_versioning" "darwin" {
  for_each = aws_s3_bucket.darwin
  
  bucket = each.value.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "darwin" {
  for_each = aws_s3_bucket.darwin
  
  bucket = each.value.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "darwin" {
  for_each = aws_s3_bucket.darwin
  
  bucket = each.value.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

---

### Task 11: ECR Repositories

**What OpenTofu Does:**
- Creates ECR repositories for all Darwin services

```hcl
# modules/ecr/main.tf

locals {
  repositories = [
    "darwin-compute",
    "darwin-cluster-manager",
    "darwin-mlflow",
    "darwin-mlflow-app",
    "darwin-workspace",
    "ml-serve-app",
    "artifact-builder",
    "ray",
    "serve-runtime",
  ]
}

resource "aws_ecr_repository" "darwin" {
  for_each = toset(local.repositories)
  
  name                 = "${var.project_name}/${each.key}"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  encryption_configuration {
    encryption_type = "KMS"
  }
  
  tags = {
    Name = "${var.project_name}-${each.key}"
  }
}

# Lifecycle policy to limit image count
resource "aws_ecr_lifecycle_policy" "darwin" {
  for_each = aws_ecr_repository.darwin
  
  repository = each.value.name
  
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.image_retention_count} images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.image_retention_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
```

**Alternative: Use Docker Hub (`darwinhq/*`)**
- ✅ No ECR setup needed
- ✅ Public images, no VPC endpoint required
- ❌ Slower pulls from outside VPC
- ❌ Docker Hub rate limits

---

### Task 12: EKS Cluster (Auto Mode)

**What OpenTofu Does:**
- Creates EKS cluster with Auto Mode enabled
- Configures cluster addons (VPC CNI, CoreDNS, kube-proxy)
- Sets up OIDC provider for IRSA

```hcl
# modules/eks/main.tf

resource "aws_eks_cluster" "darwin" {
  name     = var.cluster_name
  version  = var.cluster_version
  role_arn = aws_iam_role.eks_cluster.arn
  
  vpc_config {
    subnet_ids              = var.private_subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true  # Set to false for production
    public_access_cidrs     = var.public_access_cidrs
    security_group_ids      = [var.eks_security_group_id]
  }
  
  # EKS Auto Mode configuration
  compute_config {
    enabled       = true
    node_pools    = ["general-purpose", "system"]
    node_role_arn = aws_iam_role.eks_node.arn
  }
  
  kubernetes_network_config {
    service_ipv4_cidr = var.service_cidr
    ip_family         = "ipv4"
  }
  
  # Enable control plane logging
  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]
  
  access_config {
    authentication_mode                         = "API_AND_CONFIG_MAP"
    bootstrap_cluster_creator_admin_permissions = true
  }
  
  tags = {
    Name = var.cluster_name
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]
}

# OIDC Provider for IRSA
data "tls_certificate" "eks" {
  url = aws_eks_cluster.darwin.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.darwin.identity[0].oidc[0].issuer
  
  tags = {
    Name = "${var.cluster_name}-oidc"
  }
}

# EKS Addons
resource "aws_eks_addon" "vpc_cni" {
  cluster_name = aws_eks_cluster.darwin.name
  addon_name   = "vpc-cni"
  
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
}

resource "aws_eks_addon" "coredns" {
  cluster_name = aws_eks_cluster.darwin.name
  addon_name   = "coredns"
  
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
  
  depends_on = [aws_eks_node_group.default]
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name = aws_eks_cluster.darwin.name
  addon_name   = "kube-proxy"
  
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
}
```

---

### Task 13: EKS Node Pools

**What OpenTofu Does:**
- Creates 3 managed node groups with specific taints and labels

```hcl
# modules/eks/node-pools.tf

# Default Node Pool - For operators and services
resource "aws_eks_node_group" "default" {
  cluster_name    = aws_eks_cluster.darwin.name
  node_group_name = "default"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids
  
  instance_types = var.default_instance_types  # ["t3.large", "t3.xlarge"]
  capacity_type  = "ON_DEMAND"
  
  scaling_config {
    desired_size = var.default_desired_size
    min_size     = var.default_min_size
    max_size     = var.default_max_size
  }
  
  labels = {
    "darwin.io/nodepool" = "default"
    "darwin.io/workload" = "platform"
  }
  
  tags = {
    Name = "${var.cluster_name}-default"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_read_only,
  ]
}

# Ray Node Pool - For Ray clusters (training/compute)
resource "aws_eks_node_group" "ray" {
  cluster_name    = aws_eks_cluster.darwin.name
  node_group_name = "ray"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids
  
  instance_types = var.ray_instance_types  # ["m5.xlarge", "m5.2xlarge", "m6i.xlarge"]
  capacity_type  = var.ray_capacity_type   # "SPOT" or "ON_DEMAND"
  
  scaling_config {
    desired_size = 0  # Scale from 0
    min_size     = 0
    max_size     = var.ray_max_size
  }
  
  labels = {
    "darwin.io/nodepool"              = "ray"
    "darwin.io/workload"              = "compute"
    "darwin.dream11.com/resource"     = "ray-cluster"  # Existing label from code
  }
  
  taint {
    key    = "darwin.io/workload"
    value  = "compute"
    effect = "NO_SCHEDULE"
  }
  
  tags = {
    Name = "${var.cluster_name}-ray"
    "k8s.io/cluster-autoscaler/enabled"             = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
  ]
}

# Serve Node Pool - For model inference, Jupyter, Spark History Server
resource "aws_eks_node_group" "serve" {
  cluster_name    = aws_eks_cluster.darwin.name
  node_group_name = "serve"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids
  
  instance_types = var.serve_instance_types  # ["m5.large", "m5.xlarge"]
  capacity_type  = "ON_DEMAND"  # Inference should be stable
  
  scaling_config {
    desired_size = 0  # Scale from 0
    min_size     = 0
    max_size     = var.serve_max_size
  }
  
  labels = {
    "darwin.io/nodepool" = "serve"
    "darwin.io/workload" = "inference"
  }
  
  taint {
    key    = "darwin.io/workload"
    value  = "inference"
    effect = "NO_SCHEDULE"
  }
  
  tags = {
    Name = "${var.cluster_name}-serve"
    "k8s.io/cluster-autoscaler/enabled"             = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
  ]
}
```

---

### Task 14: IAM Roles for Service Accounts (IRSA)

**What OpenTofu Does:**
- Creates IAM roles that can be assumed by Kubernetes service accounts
- Grants S3, ECR, Secrets Manager access

```hcl
# modules/eks/iam.tf

# DCM (Cluster Manager) Role - needs S3 for kubeconfig
resource "aws_iam_role" "dcm" {
  name = "${var.cluster_name}-dcm-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:darwin:darwin-cluster-manager"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "dcm_s3" {
  name = "dcm-s3-access"
  role = aws_iam_role.dcm.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "${var.config_bucket_arn}",
          "${var.config_bucket_arn}/*"
        ]
      }
    ]
  })
}

# MLflow Role - needs S3 for artifacts
resource "aws_iam_role" "mlflow" {
  name = "${var.cluster_name}-mlflow-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:darwin:darwin-mlflow"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "mlflow_s3" {
  name = "mlflow-s3-access"
  role = aws_iam_role.mlflow.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "${var.mlflow_bucket_arn}",
          "${var.mlflow_bucket_arn}/*"
        ]
      }
    ]
  })
}
```

---

### Task 15: Upload Kubeconfig to S3

**What OpenTofu Does:**
- Generates kubeconfig for the cluster
- Uploads to S3 for DCM to download

```hcl
# modules/eks/kubeconfig.tf

locals {
  kubeconfig = <<-KUBECONFIG
    apiVersion: v1
    kind: Config
    clusters:
    - cluster:
        server: ${aws_eks_cluster.darwin.endpoint}
        certificate-authority-data: ${aws_eks_cluster.darwin.certificate_authority[0].data}
      name: ${aws_eks_cluster.darwin.name}
    contexts:
    - context:
        cluster: ${aws_eks_cluster.darwin.name}
        user: ${aws_eks_cluster.darwin.name}
      name: ${aws_eks_cluster.darwin.name}
    current-context: ${aws_eks_cluster.darwin.name}
    users:
    - name: ${aws_eks_cluster.darwin.name}
      user:
        exec:
          apiVersion: client.authentication.k8s.io/v1beta1
          command: aws
          args:
            - eks
            - get-token
            - --cluster-name
            - ${aws_eks_cluster.darwin.name}
            - --region
            - ${var.region}
  KUBECONFIG
}

resource "aws_s3_object" "kubeconfig" {
  bucket  = var.config_bucket_name
  key     = "mlp/cluster_manager/configs/${var.cluster_name}"  # DCM expects this path
  content = local.kubeconfig
  
  server_side_encryption = "aws:kms"
}
```

**Note:** DCM downloads kubeconfig from S3 path: `mlp/cluster_manager/configs/<cluster_name>`

---

### Task 16: ArgoCD Installation

**What OpenTofu Does:**
- Deploys ArgoCD via Helm
- Configures initial settings

```hcl
# modules/helm-releases/argocd.tf

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd_version  # "5.51.0"
  namespace        = "argocd"
  create_namespace = true
  
  values = [
    <<-VALUES
    server:
      ingress:
        enabled: true
        ingressClassName: nginx
        hosts:
          - argocd.${var.domain}
    
    controller:
      nodeSelector:
        darwin.io/nodepool: default
    
    server:
      nodeSelector:
        darwin.io/nodepool: default
    
    repoServer:
      nodeSelector:
        darwin.io/nodepool: default
    VALUES
  ]
  
  depends_on = [
    helm_release.nginx_ingress,
  ]
}
```

---

### Task 17: Kubernetes Operators

**What OpenTofu Does:**
- Deploys all required operators via Helm

```hcl
# modules/helm-releases/operators.tf

# 1. AWS Load Balancer Controller
resource "helm_release" "aws_lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = var.alb_controller_version
  namespace  = "kube-system"
  
  values = [
    <<-VALUES
    clusterName: ${var.cluster_name}
    serviceAccount:
      create: true
      name: aws-load-balancer-controller
      annotations:
        eks.amazonaws.com/role-arn: ${var.alb_controller_role_arn}
    VALUES
  ]
}

# 2. Nginx Ingress Controller
resource "helm_release" "nginx_ingress" {
  name             = "nginx-ingress"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  version          = var.nginx_version
  namespace        = "ingress-nginx"
  create_namespace = true
  
  values = [
    <<-VALUES
    controller:
      service:
        type: LoadBalancer
        annotations:
          service.beta.kubernetes.io/aws-load-balancer-type: "external"
          service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "ip"
          service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
      
      nodeSelector:
        darwin.io/nodepool: default
    VALUES
  ]
}

# 3. KubeRay Operator
resource "helm_release" "kuberay" {
  name             = "kuberay-operator"
  repository       = "https://ray-project.github.io/kuberay-helm"
  chart            = "kuberay-operator"
  version          = var.kuberay_version  # "1.1.0"
  namespace        = "ray-system"
  create_namespace = true
  
  values = [
    <<-VALUES
    nodeSelector:
      darwin.io/nodepool: default
    VALUES
  ]
}

# 4. Kube Prometheus Stack
resource "helm_release" "prometheus" {
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  version          = var.prometheus_version
  namespace        = "monitoring"
  create_namespace = true
  
  values = [
    <<-VALUES
    prometheus:
      prometheusSpec:
        nodeSelector:
          darwin.io/nodepool: default
        storageSpec:
          volumeClaimTemplate:
            spec:
              storageClassName: gp3
              resources:
                requests:
                  storage: 50Gi
    
    grafana:
      nodeSelector:
        darwin.io/nodepool: default
      persistence:
        enabled: true
        storageClassName: gp3
        size: 10Gi
      
      ingress:
        enabled: true
        ingressClassName: nginx
        hosts:
          - grafana.${var.domain}
    
    alertmanager:
      alertmanagerSpec:
        nodeSelector:
          darwin.io/nodepool: default
    VALUES
  ]
}

# 5. Cert Manager
resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  version          = var.cert_manager_version
  namespace        = "cert-manager"
  create_namespace = true
  
  set {
    name  = "installCRDs"
    value = "true"
  }
  
  values = [
    <<-VALUES
    nodeSelector:
      darwin.io/nodepool: default
    
    webhook:
      nodeSelector:
        darwin.io/nodepool: default
    
    cainjector:
      nodeSelector:
        darwin.io/nodepool: default
    VALUES
  ]
}
```

---

### Task 18: Darwin Helm Deployment

**What OpenTofu Does:**
- Deploys Darwin platform via Helm
- Points to external RDS instead of in-cluster MySQL
- Configures EFS for Workspace

```hcl
# modules/helm-releases/darwin.tf

resource "helm_release" "darwin" {
  name             = "darwin"
  chart            = var.darwin_chart_path  # "./helm/darwin" or OCI registry
  namespace        = "darwin"
  create_namespace = true
  
  values = [
    <<-VALUES
    global:
      imageRegistry: ${var.ecr_registry}
      namespace: darwin
      local-k8s: false
      
      database:
        mysql:
          host: ${var.rds_endpoint}
          port: 3306
          username: ${var.rds_username}
    
    # Disable in-cluster datastores (use AWS managed)
    datastores:
      enabled: false
      mysql:
        enabled: false
      cassandra:
        enabled: false
      kafka:
        enabled: false
      zookeeper:
        enabled: false
      localstack:
        enabled: false
      opensearch:
        enabled: false
    
    services:
      enabled: true
      
      darwin-compute:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
      
      darwin-cluster-manager:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: ${var.dcm_role_arn}
      
      darwin-mlflow:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: ${var.mlflow_role_arn}
      
      darwin-mlflow-app:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
      
      ml-serve-app:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
      
      artifact-builder:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
      
      darwin-workspace:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
      
      # Disabled for Phase 1
      darwin-catalog:
        enabled: false
      chronos:
        enabled: false
      chronos-consumer:
        enabled: false
      darwin-workflow:
        enabled: false
      darwin-ofs-v2:
        enabled: false
      darwin-ofs-v2-admin:
        enabled: false
      darwin-ofs-v2-consumer:
        enabled: false
    VALUES
  ]
  
  depends_on = [
    helm_release.kuberay,
    helm_release.nginx_ingress,
    helm_release.cert_manager,
    kubernetes_persistent_volume_claim.efs_workspace,
  ]
}
```

---

## 6. Code Changes Required

### 6.1 Configuration Changes (Non-Breaking)

| Service | File | Change Required |
|---------|------|-----------------|
| All services | Helm values | Point `CONFIG_SERVICE_MYSQL_HOST` to RDS endpoint |
| MLflow | `services.yaml` | Update `CONFIG_SERVICE_S3_PATH` to real S3 bucket |
| DCM | `constants/constants.go` | Verify `KubeConfigS3Prefix` matches S3 key |
| Workspace | `constants/constants.py` | Verify `BASE_EFS_PATH` matches mount path |

### 6.2 Code Changes for Node Pool Selection

**File:** `darwin-compute/core/src/compute_core/util/utils.py`

Current code uses node selectors like:
- `group["nodeSelector"]["darwin.dream11.com/resource"] = "ray-cluster"`
- `group["nodeSelector"]["karpenter.k8s.aws/instance-family"] = "p4d"`

**Changes needed:**

```python
def add_ray_node_selectors(group: dict, cluster_type: str):
    """Add node selectors for Ray workloads."""
    group["nodeSelector"] = group.get("nodeSelector", {})
    group["nodeSelector"]["darwin.io/nodepool"] = "ray"
    group["nodeSelector"]["darwin.io/workload"] = "compute"

def add_ray_tolerations(group: dict):
    """Add tolerations for Ray node pool taints."""
    if "tolerations" not in group:
        group["tolerations"] = []
    
    group["tolerations"].append({
        "key": "darwin.io/workload",
        "operator": "Equal",
        "value": "compute",
        "effect": "NoSchedule"
    })
```

### 6.3 Serve Node Pool Configuration

For Jupyter kernels, Spark History Server, and model inference pods:

```python
def get_serve_node_config():
    return {
        "nodeSelector": {
            "darwin.io/nodepool": "serve",
            "darwin.io/workload": "inference"
        },
        "tolerations": [{
            "key": "darwin.io/workload",
            "operator": "Equal",
            "value": "inference",
            "effect": "NoSchedule"
        }]
    }
```

### 6.4 Files to Modify

| File | Changes |
|------|---------|
| `darwin-compute/core/src/compute_core/util/utils.py` | Update `add_eks_tolerations()`, add new node selectors |
| `darwin-compute/core/src/compute_core/util/yaml_generator_v2/head_node_handler.py` | Use new node selector functions |
| `darwin-compute/core/src/compute_core/util/yaml_generator_v2/worker_node_handler.py` | Use new node selector functions |
| `darwin-cluster-manager/services/jupyterClient/utils.go` | Add serve node pool config |
| `darwin-cluster-manager/services/spark_history_server/utils.go` | Add serve node pool config |

---

## 7. Deployment Sequence

### Phase 1: Foundation (OpenTofu)

```bash
# 1. Initialize and apply VPC module
cd terraform/environments/dev
tofu init
tofu apply -target=module.vpc

# 2. Apply VPC endpoints
tofu apply -target=module.vpc_endpoints

# 3. Apply security groups
tofu apply -target=module.security_groups

# 4. Apply datastores (RDS, EFS)
tofu apply -target=module.rds -target=module.efs

# 5. Apply S3 and ECR
tofu apply -target=module.s3 -target=module.ecr
```

### Phase 2: EKS Cluster (OpenTofu)

```bash
# 6. Create EKS cluster
tofu apply -target=module.eks

# 7. Configure kubectl locally
aws eks update-kubeconfig --name darwin-dev --region us-east-1

# 8. Verify cluster
kubectl get nodes
```

### Phase 3: Operators (OpenTofu/Helm)

```bash
# 9. Apply all helm releases
tofu apply -target=module.helm_releases
```

### Phase 4: Darwin Deployment (OpenTofu/Helm)

```bash
# 10. Deploy Darwin
tofu apply -target=helm_release.darwin

# 11. Verify deployments
kubectl get pods -n darwin
kubectl get pods -n ray-system
kubectl get pods -n monitoring
```

### Phase 5: Validation

```bash
# 12. Check service endpoints
kubectl get ingress -A

# 13. Test connectivity
curl -k https://darwin.yourdomain.com/compute/health
curl -k https://darwin.yourdomain.com/mlflow/health
```

---

## 8. Validation Checklist

### Infrastructure Validation

| Check | Command | Expected |
|-------|---------|----------|
| VPC created | `aws ec2 describe-vpcs --filters "Name=tag:Name,Values=darwin-*"` | 1 VPC |
| Subnets | `aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID"` | 6 subnets |
| NAT Gateway | `aws ec2 describe-nat-gateways` | 1+ NAT gateways |
| RDS | `aws rds describe-db-instances` | 1 MySQL instance |
| EFS | `aws efs describe-file-systems` | 1 file system |
| EKS | `aws eks describe-cluster --name darwin-dev` | ACTIVE status |

### Kubernetes Validation

| Check | Command | Expected |
|-------|---------|----------|
| Nodes | `kubectl get nodes` | 2+ nodes ready |
| System pods | `kubectl get pods -n kube-system` | All running |
| Operators | `kubectl get pods -n ray-system` | KubeRay running |
| Monitoring | `kubectl get pods -n monitoring` | Prometheus/Grafana running |
| Darwin | `kubectl get pods -n darwin` | All services running |

### Connectivity Validation

| Check | Command | Expected |
|-------|---------|----------|
| RDS from pod | `kubectl exec -it <pod> -- nc -zv $RDS_HOST 3306` | Connection succeeded |
| S3 from pod | `kubectl exec -it <pod> -- aws s3 ls $BUCKET` | Bucket contents |
| EFS mount | `kubectl exec -it <pod> -- ls /var/www/fsx/workspace` | Directory listing |

---

## 9. Estimated Costs

### Monthly Cost Breakdown (Dev Environment)

| Resource | Spec | Estimated Cost |
|----------|------|----------------|
| EKS Cluster | Control plane | $73 |
| EC2 (Default nodes) | 2x t3.large | $120 |
| EC2 (Ray nodes) | 0-5x m5.xlarge (spot) | $50-200 |
| EC2 (Serve nodes) | 0-3x m5.large | $30-90 |
| RDS MySQL | db.t3.medium, single-AZ | $50 |
| EFS | 50GB with IA | $15 |
| S3 | 100GB + requests | $5-10 |
| NAT Gateway | Single | $32 |
| VPC Endpoints | 3 interface endpoints | $65 |
| Data Transfer | Varies | $20-50 |
| **Total (Dev)** | | **$460-700/month** |

### Production Multipliers

| Change | Impact |
|--------|--------|
| Multi-AZ RDS | +$50/month |
| Multi-NAT | +$64/month |
| Larger instances | +100-200% |
| Reserved capacity | -30-50% |

---

## Appendix A: Environment Variables Reference

### Darwin Services Environment Variables

```yaml
# Common to all services
CONFIG_SERVICE_MYSQL_HOST: "<rds-endpoint>"
CONFIG_SERVICE_MYSQL_PORT: "3306"
CONFIG_SERVICE_MYSQL_USERNAME: "darwin"
VAULT_SERVICE_MYSQL_PASSWORD: "<from-secrets-manager>"

# MLflow specific
CONFIG_SERVICE_S3_PATH: "s3://darwin-dev-mlflow-artifacts-<account-id>"
AWS_REGION: "us-east-1"

# DCM specific
S3_BUCKET: "darwin-dev-cluster-manager-configs-<account-id>"
KUBE_CONFIG_S3_PREFIX: "mlp/cluster_manager/configs/"

# Workspace specific
BASE_EFS_PATH: "/var/www/fsx/workspace"
```

---

## Appendix B: Troubleshooting Guide

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Pods stuck in Pending | No nodes with matching selector | Check node pool labels and taints |
| Cannot pull images | ECR endpoint not configured | Verify VPC endpoints |
| RDS connection timeout | Security group rules | Check SG allows EKS CIDR |
| EFS mount fails | Mount target not ready | Wait for mount targets in all AZs |
| DCM cannot get kubeconfig | S3 permissions | Verify IRSA role policy |

### Debug Commands

```bash
# Check node labels
kubectl get nodes --show-labels

# Check pod events
kubectl describe pod <pod-name> -n darwin

# Check service account
kubectl get sa -n darwin -o yaml

# Test S3 access from pod
kubectl exec -it <pod> -- aws s3 ls s3://<bucket>

# Check VPC endpoints
aws ec2 describe-vpc-endpoints --filters "Name=vpc-id,Values=$VPC_ID"
```

---

*Document generated: January 2026*  
*Author: Darwin Platform Team*  
*Version: 1.0*
