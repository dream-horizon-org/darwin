# -----------------------------------------------------------------------------
# S3 Buckets for Darwin Platform
# -----------------------------------------------------------------------------

locals {
  bucket_names = [
    "mlflow-artifacts",        # MLflow model artifacts
    "cluster-manager-configs", # Kubeconfigs for DCM
    "serve-artifacts",         # Serve model files
  ]
}

resource "aws_s3_bucket" "darwin" {
  for_each = toset(local.bucket_names)

  bucket = "${var.project_name}-${var.environment}-${each.key}-${var.aws_account_id}"

  tags = {
    Name = "${var.project_name}-${var.environment}-${each.key}"
  }
}

# -----------------------------------------------------------------------------
# Versioning
# -----------------------------------------------------------------------------

resource "aws_s3_bucket_versioning" "darwin" {
  for_each = aws_s3_bucket.darwin

  bucket = each.value.id

  versioning_configuration {
    status = "Enabled"
  }
}

# -----------------------------------------------------------------------------
# Server-Side Encryption (KMS)
# -----------------------------------------------------------------------------

resource "aws_s3_bucket_server_side_encryption_configuration" "darwin" {
  for_each = aws_s3_bucket.darwin

  bucket = each.value.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# -----------------------------------------------------------------------------
# Block All Public Access
# NOTE: Removed - enforced at the AWS account/organization level.
# The org policy denies s3:PutBucketPublicAccessBlock at bucket level.
# -----------------------------------------------------------------------------
