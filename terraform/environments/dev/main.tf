# =============================================================================
# Darwin ML Platform – Dev Environment
# =============================================================================

# ----- Variables -----

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_account_id" {
  description = "AWS account ID (used for globally-unique S3 bucket names)"
  type        = string
}

variable "domain" {
  description = "Base domain for ingress hosts (leave empty to disable ingress)"
  type        = string
  default     = ""
}

# ----- Organization-mandated tags -----

variable "org_name" {
  description = "Organization name (required by SCP)"
  type        = string
}

variable "environment_name" {
  description = "Environment name for org tagging (required by SCP)"
  type        = string
}

variable "provisioned_by_user" {
  description = "Email of the user provisioning resources (required by SCP)"
  type        = string
}

variable "service_name" {
  description = "Service name tag (required by SCP)"
  type        = string
  default     = "darwin"
}

variable "component_name" {
  description = "Component name tag (required by SCP)"
  type        = string
  default     = "darwin-platform"
}

variable "component_type" {
  description = "Component type tag (required by SCP)"
  type        = string
  default     = "infrastructure"
}

variable "resource_type" {
  description = "Resource type tag (required by SCP)"
  type        = string
  default     = "shared"
}

# ----- Locals -----

locals {
  project_name = "darwin"
  cluster_name = "${local.project_name}-${var.environment}"

  vpc_cidr = "10.66.0.0/16"

  availability_zones = [
    "${var.aws_region}a",
    "${var.aws_region}b",
    "${var.aws_region}c",
  ]

  # Public subnets – /24 each (256 IPs per AZ)
  public_subnet_cidrs = [
    "10.66.0.0/24",
    "10.66.1.0/24",
    "10.66.2.0/24",
  ]

  # Private subnets – /22 each (1024 IPs per AZ, enough for EKS pod IPs)
  private_subnet_cidrs = [
    "10.66.16.0/22",
    "10.66.20.0/22",
    "10.66.24.0/22",
  ]
}

# =============================================================================
# Data Sources
# =============================================================================

data "aws_caller_identity" "current" {}

# =============================================================================
# Module: VPC
# =============================================================================

module "vpc" {
  source = "../../modules/vpc"

  vpc_cidr             = local.vpc_cidr
  project_name         = local.project_name
  environment          = var.environment
  cluster_name         = local.cluster_name
  availability_zones   = local.availability_zones
  public_subnet_cidrs  = local.public_subnet_cidrs
  private_subnet_cidrs = local.private_subnet_cidrs
  single_nat_gateway   = true # Single NAT for dev (saves ~$64/mo)
}

# =============================================================================
# Module: Security Groups
# =============================================================================

module "security_groups" {
  source = "../../modules/security-groups"

  vpc_id       = module.vpc.vpc_id
  project_name = local.project_name
  environment  = var.environment
}

# =============================================================================
# Module: VPC Endpoints
# =============================================================================

module "vpc_endpoints" {
  source = "../../modules/vpc-endpoints"

  vpc_id                  = module.vpc.vpc_id
  vpc_cidr                = local.vpc_cidr
  region                  = var.aws_region
  private_subnet_ids      = module.vpc.private_subnet_ids
  private_route_table_ids = module.vpc.private_route_table_ids
  project_name            = local.project_name
  environment             = var.environment
}

# =============================================================================
# Module: RDS (MySQL)
# =============================================================================

module "rds" {
  source = "../../modules/rds"

  project_name          = local.project_name
  environment           = var.environment
  private_subnet_ids    = module.vpc.private_subnet_ids
  rds_security_group_id = module.security_groups.rds_sg_id
  rds_instance_class    = "db.t3.medium"
  rds_multi_az          = false # Single-AZ for dev
}

# =============================================================================
# Module: EFS
# =============================================================================

module "efs" {
  source = "../../modules/efs"

  project_name          = local.project_name
  environment           = var.environment
  private_subnet_ids    = module.vpc.private_subnet_ids
  efs_security_group_id = module.security_groups.efs_sg_id
}

# =============================================================================
# Module: S3 Buckets
# =============================================================================

module "s3" {
  source = "../../modules/s3"

  project_name   = local.project_name
  environment    = var.environment
  aws_account_id = var.aws_account_id
}

# =============================================================================
# Module: ECR Repositories
# =============================================================================

module "ecr" {
  source = "../../modules/ecr"

  project_name          = local.project_name
  image_retention_count = 30
}

# =============================================================================
# Module: EKS Cluster + Node Pools + IAM
# =============================================================================

module "eks" {
  source = "../../modules/eks"

  cluster_name          = local.cluster_name
  cluster_version       = "1.29"
  region                = var.aws_region
  private_subnet_ids    = module.vpc.private_subnet_ids
  eks_security_group_id = module.security_groups.eks_cluster_sg_id
  project_name          = local.project_name
  environment           = var.environment

  # Node pool sizing (dev-friendly defaults)
  default_instance_types = ["t3.large"]
  default_desired_size   = 2
  default_min_size       = 2
  default_max_size       = 5

  ray_instance_types = ["m5.xlarge", "m5.2xlarge"]
  ray_capacity_type  = "SPOT"
  ray_max_size       = 10

  serve_instance_types = ["m5.large", "m5.xlarge"]
  serve_max_size       = 5

  # IRSA bucket references
  config_bucket_arn  = module.s3.config_bucket_arn
  config_bucket_name = module.s3.config_bucket_name
  mlflow_bucket_arn  = module.s3.mlflow_bucket_arn
}

# =============================================================================
# Module: Helm Releases (Operators + Darwin)
# =============================================================================

module "helm_releases" {
  source = "../../modules/helm-releases"

  cluster_name = local.cluster_name
  domain       = var.domain

  # IRSA role ARNs
  dcm_role_arn    = module.eks.dcm_role_arn
  mlflow_role_arn = module.eks.mlflow_role_arn

  # Darwin chart
  ecr_registry   = module.ecr.registry_url
  rds_endpoint   = module.rds.rds_address
  rds_username   = "darwin"
  darwin_chart_path = "${path.module}/../../../helm/darwin"

  # EFS for Workspace
  efs_id                    = module.efs.efs_id
  workspace_access_point_id = module.efs.workspace_access_point_id
}

# =============================================================================
# Outputs
# =============================================================================

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value     = module.rds.rds_endpoint
  sensitive = true
}

output "rds_secret_arn" {
  value = module.rds.rds_secret_arn
}

output "ecr_registry_url" {
  value = module.ecr.registry_url
}

output "s3_bucket_names" {
  value = module.s3.bucket_names
}

output "kubeconfig_command" {
  value = "aws eks update-kubeconfig --name ${local.cluster_name} --region ${var.aws_region}"
}
