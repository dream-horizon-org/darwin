# -----------------------------------------------------------------------------
# ECR Repositories for Darwin Platform
# -----------------------------------------------------------------------------

locals {
  repositories = [
    "darwin-compute",
    "darwin-cluster-manager",
    "darwin-mlflow",
    "darwin-mlflow-app",
    "darwin-workspace",
    "ml-serve-app",
    "artifact-builder",
    "ray",
    "serve-runtime",
  ]
}

resource "aws_ecr_repository" "darwin" {
  for_each = toset(local.repositories)

  name                 = "${var.project_name}/${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
  }

  tags = {
    Name = "${var.project_name}-${each.key}"
  }
}

# -----------------------------------------------------------------------------
# Lifecycle Policy – limit stored images
# -----------------------------------------------------------------------------

resource "aws_ecr_lifecycle_policy" "darwin" {
  for_each = aws_ecr_repository.darwin

  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.image_retention_count} images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.image_retention_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
