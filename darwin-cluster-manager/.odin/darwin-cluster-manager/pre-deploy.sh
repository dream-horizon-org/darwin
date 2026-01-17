#!/usr/bin/env bash
set -e

echo "----- Pre-deploy -----"

echo "AWS_ENDPOINT_OVERRIDE: $AWS_ENDPOINT_OVERRIDE"
echo "AWS_ENDPOINT_URL_S3: $AWS_ENDPOINT_URL_S3"
echo "BUCKET_NAME: $COMPUTE_BUCKET_NAME"
echo "AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY"
echo "AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION"

# Create the S3 bucket for cluster manager artifacts
aws s3 --endpoint-url=$AWS_ENDPOINT_OVERRIDE mb s3://$COMPUTE_BUCKET_NAME
aws s3 --endpoint-url=$AWS_ENDPOINT_OVERRIDE ls

echo "----- Pre-deploy completed -----"
