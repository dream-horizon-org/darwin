# ---------------------------------------------------------------------------
# Minimal AWS permission test: creates 1 S3 bucket + 1 VPC, then you destroy.
# Uses your subnet range 10.66.0.0/16 for the VPC (no subnets created).
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for the test resources"
  type        = string
  default     = "us-east-1"
}

# --- S3 (tests s3:*)
resource "aws_s3_bucket" "test" {
  bucket = "darwin-permission-test-${substr(md5(var.aws_region), 0, 8)}"
}

resource "aws_s3_bucket_versioning" "test" {
  bucket = aws_s3_bucket.test.id

  versioning_configuration {
    status = "Disabled"
  }
}

# --- VPC (tests ec2:*)
resource "aws_vpc" "test" {
  cidr_block           = "10.66.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "darwin-permission-test-vpc"
  }
}

# --- Outputs
output "test_s3_bucket" {
  value       = aws_s3_bucket.test.id
  description = "Created S3 bucket (will be deleted on destroy)"
}

output "test_vpc_id" {
  value       = aws_vpc.test.id
  description = "Created VPC ID (will be deleted on destroy)"
}
