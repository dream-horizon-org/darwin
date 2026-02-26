#!/usr/bin/env bash
# =============================================================================
# Upload kubeconfig to S3 for Darwin Cluster Manager (DCM)
# Usage: ./upload-kubeconfig.sh <cluster-name> <region> <s3-bucket>
# =============================================================================
set -euo pipefail

CLUSTER_NAME="${1:?Usage: $0 <cluster-name> <region> <s3-bucket>}"
REGION="${2:?Usage: $0 <cluster-name> <region> <s3-bucket>}"
S3_BUCKET="${3:?Usage: $0 <cluster-name> <region> <s3-bucket>}"

TMPFILE=$(mktemp)
trap "rm -f $TMPFILE" EXIT

echo "Generating kubeconfig for cluster: $CLUSTER_NAME ..."
aws eks update-kubeconfig \
  --name "$CLUSTER_NAME" \
  --region "$REGION" \
  --kubeconfig "$TMPFILE"

echo "Uploading to s3://$S3_BUCKET/mlp/cluster_manager/configs/$CLUSTER_NAME ..."
aws s3 cp "$TMPFILE" \
  "s3://$S3_BUCKET/mlp/cluster_manager/configs/$CLUSTER_NAME" \
  --sse aws:kms

echo "Done."
