variable "vpc_id" {
  description = "ID of the VPC"
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
