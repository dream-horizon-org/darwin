# Local backend for initial bootstrapping.
# Migrate to S3 backend once the bucket is created:
#
# terraform {
#   backend "s3" {
#     bucket         = "darwin-dev-terraform-state-<ACCOUNT_ID>"
#     key            = "darwin/dev/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "darwin-dev-terraform-lock"
#   }
# }

terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
