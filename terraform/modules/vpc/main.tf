# -----------------------------------------------------------------------------
# VPC + Internet Gateway
# -----------------------------------------------------------------------------

resource "aws_vpc" "darwin" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name                                            = "${var.project_name}-${var.environment}-vpc"
    "kubernetes.io/cluster/${var.cluster_name}"      = "shared"
  }
}

resource "aws_internet_gateway" "darwin" {
  vpc_id = aws_vpc.darwin.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}
