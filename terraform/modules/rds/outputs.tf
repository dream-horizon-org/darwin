output "rds_endpoint" {
  description = "RDS instance endpoint (host:port)"
  value       = aws_db_instance.darwin.endpoint
}

output "rds_address" {
  description = "RDS instance hostname"
  value       = aws_db_instance.darwin.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.darwin.port
}

output "rds_secret_arn" {
  description = "ARN of the Secrets Manager secret containing RDS credentials"
  value       = aws_secretsmanager_secret.rds.arn
}

output "rds_database_name" {
  description = "Name of the default database"
  value       = aws_db_instance.darwin.db_name
}
