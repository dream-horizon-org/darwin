# AWS Permission Test

Minimal Terraform to verify AWS credentials and permissions before full Darwin infra.

**Creates:** 1 S3 bucket + 1 VPC (10.66.0.0/16). **Always run destroy after a successful apply.**

## Usage

```bash
cd terraform/environments/dev-aws-test
terraform init
terraform plan
terraform apply -auto-approve
# Verify resources in AWS console if desired
terraform destroy -auto-approve
```

Use `tofu` instead of `terraform` if using OpenTofu.

## Optional: override region

```bash
terraform apply -var="aws_region=us-west-2"
```
