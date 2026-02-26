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
  description = "IDs of private subnets for DB subnet group"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "Security group ID for RDS instance"
  type        = string
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "Maximum auto-scaling storage in GB"
  type        = number
  default     = 100
}

variable "rds_database_name" {
  description = "Default database name"
  type        = string
  default     = "darwin"
}

variable "rds_username" {
  description = "Master username for RDS"
  type        = string
  default     = "darwin"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "rds_backup_retention" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}
