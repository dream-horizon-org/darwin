variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "darwin"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID (used to make bucket names globally unique)"
  type        = string
}
