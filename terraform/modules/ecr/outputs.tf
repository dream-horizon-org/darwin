output "repository_urls" {
  description = "Map of repository name to URL"
  value       = { for k, v in aws_ecr_repository.darwin : k => v.repository_url }
}

output "registry_id" {
  description = "ECR registry ID (AWS account ID)"
  value       = values(aws_ecr_repository.darwin)[0].registry_id
}

output "registry_url" {
  description = "ECR registry URL (without repository name)"
  value       = split("/", values(aws_ecr_repository.darwin)[0].repository_url)[0]
}
