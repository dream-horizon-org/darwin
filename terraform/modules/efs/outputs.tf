output "efs_id" {
  description = "ID of the EFS file system"
  value       = aws_efs_file_system.darwin.id
}

output "efs_dns_name" {
  description = "DNS name of the EFS file system"
  value       = aws_efs_file_system.darwin.dns_name
}

output "workspace_access_point_id" {
  description = "ID of the Workspace EFS access point"
  value       = aws_efs_access_point.workspace.id
}
