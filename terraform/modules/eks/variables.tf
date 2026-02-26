variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.29"
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs of private subnets for EKS"
  type        = list(string)
}

variable "eks_security_group_id" {
  description = "Additional security group ID for EKS cluster"
  type        = string
}

variable "service_cidr" {
  description = "CIDR for Kubernetes service IPs"
  type        = string
  default     = "172.20.0.0/16"
}

variable "public_access_cidrs" {
  description = "CIDR blocks allowed to access the EKS API publicly"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# --- Default node pool ---
variable "default_instance_types" {
  description = "Instance types for the default node pool"
  type        = list(string)
  default     = ["t3.large", "t3.xlarge"]
}

variable "default_desired_size" {
  description = "Desired number of nodes in default pool"
  type        = number
  default     = 2
}

variable "default_min_size" {
  description = "Minimum number of nodes in default pool"
  type        = number
  default     = 2
}

variable "default_max_size" {
  description = "Maximum number of nodes in default pool"
  type        = number
  default     = 5
}

# --- Ray node pool ---
variable "ray_instance_types" {
  description = "Instance types for the ray node pool"
  type        = list(string)
  default     = ["m5.xlarge", "m5.2xlarge", "m6i.xlarge"]
}

variable "ray_capacity_type" {
  description = "Capacity type for ray nodes (ON_DEMAND or SPOT)"
  type        = string
  default     = "SPOT"
}

variable "ray_max_size" {
  description = "Maximum number of nodes in ray pool"
  type        = number
  default     = 10
}

# --- Serve node pool ---
variable "serve_instance_types" {
  description = "Instance types for the serve node pool"
  type        = list(string)
  default     = ["m5.large", "m5.xlarge"]
}

variable "serve_max_size" {
  description = "Maximum number of nodes in serve pool"
  type        = number
  default     = 5
}

# --- IRSA bucket ARNs ---
variable "config_bucket_arn" {
  description = "ARN of the cluster-manager-configs S3 bucket"
  type        = string
}

variable "config_bucket_name" {
  description = "Name of the cluster-manager-configs S3 bucket"
  type        = string
}

variable "mlflow_bucket_arn" {
  description = "ARN of the mlflow-artifacts S3 bucket"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "darwin"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}
