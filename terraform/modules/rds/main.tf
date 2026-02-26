# -----------------------------------------------------------------------------
# DB Subnet Group
# -----------------------------------------------------------------------------

resource "aws_db_subnet_group" "darwin" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# -----------------------------------------------------------------------------
# Random Password for RDS
# -----------------------------------------------------------------------------

resource "random_password" "rds" {
  length  = 32
  special = false
}

# -----------------------------------------------------------------------------
# Secrets Manager – store RDS credentials
# -----------------------------------------------------------------------------

resource "aws_secretsmanager_secret" "rds" {
  name = "${var.project_name}/${var.environment}/rds/credentials"
}

resource "aws_secretsmanager_secret_version" "rds" {
  secret_id = aws_secretsmanager_secret.rds.id
  secret_string = jsonencode({
    username = var.rds_username
    password = random_password.rds.result
    host     = aws_db_instance.darwin.address
    port     = 3306
    dbname   = var.rds_database_name
  })
}

# -----------------------------------------------------------------------------
# RDS MySQL Instance
# -----------------------------------------------------------------------------

resource "aws_db_instance" "darwin" {
  identifier = "${var.project_name}-${var.environment}-mysql"

  engine                = "mysql"
  engine_version        = "8.0"
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.rds_database_name
  username = var.rds_username
  password = random_password.rds.result

  db_subnet_group_name   = aws_db_subnet_group.darwin.name
  vpc_security_group_ids = [var.rds_security_group_id]

  multi_az                = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention
  deletion_protection     = var.environment == "prod"
  skip_final_snapshot     = var.environment != "prod"

  # Performance Insights (free tier for 7-day retention)
  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-mysql"
  }
}
