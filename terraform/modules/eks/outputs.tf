output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.darwin.name
}

output "cluster_endpoint" {
  description = "Endpoint for the EKS cluster API server"
  value       = aws_eks_cluster.darwin.endpoint
}

output "cluster_ca_certificate" {
  description = "Base64-encoded CA certificate for the cluster"
  value       = aws_eks_cluster.darwin.certificate_authority[0].data
}

output "cluster_oidc_issuer_url" {
  description = "OIDC issuer URL for IRSA"
  value       = aws_eks_cluster.darwin.identity[0].oidc[0].issuer
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC provider"
  value       = aws_iam_openid_connect_provider.eks.arn
}

output "dcm_role_arn" {
  description = "IAM role ARN for DCM (cluster manager) IRSA"
  value       = aws_iam_role.dcm.arn
}

output "mlflow_role_arn" {
  description = "IAM role ARN for MLflow IRSA"
  value       = aws_iam_role.mlflow.arn
}

output "node_role_arn" {
  description = "IAM role ARN for EKS worker nodes"
  value       = aws_iam_role.eks_node.arn
}
