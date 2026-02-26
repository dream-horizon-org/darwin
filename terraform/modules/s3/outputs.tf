output "bucket_arns" {
  description = "Map of bucket name suffix to ARN"
  value       = { for k, v in aws_s3_bucket.darwin : k => v.arn }
}

output "bucket_names" {
  description = "Map of bucket name suffix to full bucket name"
  value       = { for k, v in aws_s3_bucket.darwin : k => v.id }
}

output "mlflow_bucket_arn" {
  description = "ARN of the MLflow artifacts bucket"
  value       = aws_s3_bucket.darwin["mlflow-artifacts"].arn
}

output "mlflow_bucket_name" {
  description = "Name of the MLflow artifacts bucket"
  value       = aws_s3_bucket.darwin["mlflow-artifacts"].id
}

output "config_bucket_arn" {
  description = "ARN of the cluster-manager configs bucket"
  value       = aws_s3_bucket.darwin["cluster-manager-configs"].arn
}

output "config_bucket_name" {
  description = "Name of the cluster-manager configs bucket"
  value       = aws_s3_bucket.darwin["cluster-manager-configs"].id
}

output "serve_bucket_arn" {
  description = "ARN of the serve artifacts bucket"
  value       = aws_s3_bucket.darwin["serve-artifacts"].arn
}
