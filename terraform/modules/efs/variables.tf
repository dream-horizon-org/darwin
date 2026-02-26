variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "darwin"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "private_subnet_ids" {
  description = "IDs of private subnets for mount targets"
  type        = list(string)
}

variable "efs_security_group_id" {
  description = "Security group ID for EFS mount targets"
  type        = string
}
