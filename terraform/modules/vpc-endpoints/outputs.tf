output "s3_endpoint_id" {
  description = "ID of the S3 gateway endpoint"
  value       = aws_vpc_endpoint.s3.id
}

output "ecr_api_endpoint_id" {
  description = "ID of the ECR API interface endpoint"
  value       = aws_vpc_endpoint.ecr_api.id
}

output "ecr_dkr_endpoint_id" {
  description = "ID of the ECR DKR interface endpoint"
  value       = aws_vpc_endpoint.ecr_dkr.id
}

output "secretsmanager_endpoint_id" {
  description = "ID of the Secrets Manager interface endpoint"
  value       = aws_vpc_endpoint.secretsmanager.id
}

output "vpce_security_group_id" {
  description = "Security group ID for VPC endpoints"
  value       = aws_security_group.vpc_endpoints.id
}
