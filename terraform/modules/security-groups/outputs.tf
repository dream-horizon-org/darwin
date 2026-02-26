output "eks_cluster_sg_id" {
  description = "Security group ID for EKS cluster"
  value       = aws_security_group.eks_cluster.id
}

output "rds_sg_id" {
  description = "Security group ID for RDS"
  value       = aws_security_group.rds.id
}

output "efs_sg_id" {
  description = "Security group ID for EFS"
  value       = aws_security_group.efs.id
}
