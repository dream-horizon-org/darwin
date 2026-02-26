variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "darwin"
}

variable "image_retention_count" {
  description = "Number of images to retain per repository"
  type        = number
  default     = 30
}
