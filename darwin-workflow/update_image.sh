#!/bin/bash
set -e

echo "🔄 Updating darwin-workflow image in kind cluster"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Set KUBECONFIG for kind
SCRIPT_DIR_ABS="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT_ABS="$(cd "$SCRIPT_DIR_ABS/.." && pwd)"
export KUBECONFIG="$PROJECT_ROOT_ABS/.setup/kindkubeconfig.yaml"

# Get script directory and project root (already set above)
SCRIPT_DIR="$SCRIPT_DIR_ABS"
PROJECT_ROOT="$PROJECT_ROOT_ABS"

# Step 1: Clean target directory
echo ""
echo "Step 1: Cleaning target directory..."
cd "$SCRIPT_DIR"
rm -rf target/darwin-workflow/.local-mocks
rm -rf target/darwin-workflow/app_layer
rm -rf target/darwin-workflow/core
rm -rf target/darwin-workflow/model
# Don't delete .odin - it's needed and will be copied by build.sh
echo "✅ Target directory cleaned"

# Step 2: Build application
echo ""
echo "Step 2: Building application..."
cd "$SCRIPT_DIR"
bash -x .odin/darwin-workflow/build.sh

# Step 3: Build Docker image
echo ""
echo "Step 3: Building Docker image..."
cd "$PROJECT_ROOT"
docker build \
  --build-arg BASE_IMAGE=darwin/python:3.9.7-pip-bookworm-slim \
  --build-arg APP_NAME=darwin-workflow \
  --build-arg APP_BASE_DIR=darwin-workflow \
  --build-arg APP_DIR=. \
  --build-arg DEPLOYMENT_TYPE=container \
  --build-arg EXTRA_ENV_VARS="ENV=local|DEV=true" \
  --no-cache \
  -t darwin-workflow:latest \
  --label "maintainer=darwin" \
  -f deployer/images/Dockerfile .

# Step 4: Load image into kind
echo ""
echo "Step 4: Loading image into kind cluster..."
kind load docker-image darwin-workflow:latest

# Step 5: Update deployment
echo ""
echo "Step 5: Updating deployment..."
# Use JSON patch to only update the image field, preserving all other container settings (env vars, etc.)
kubectl patch deployment darwin-workflow -n darwin --type='json' -p='[
  {
    "op": "replace",
    "path": "/spec/template/spec/containers/0/image",
    "value": "darwin-workflow:latest"
  },
  {
    "op": "replace",
    "path": "/spec/template/spec/containers/0/imagePullPolicy",
    "value": "IfNotPresent"
  }
]'

# Step 6: Restart deployment
echo ""
echo "Step 6: Restarting deployment..."
kubectl rollout restart deployment/darwin-workflow -n darwin

# Step 7: Wait for rollout
echo ""
echo "Step 7: Waiting for rollout to complete..."
kubectl rollout status deployment/darwin-workflow -n darwin --timeout=90s

echo ""
echo "✅ Image update complete!"
echo ""
echo "To restart port-forward:"
echo "  pkill -f 'kubectl port-forward.*darwin-workflow'"
echo "  KUBECONFIG=$KUBECONFIG kubectl port-forward -n darwin deployment/darwin-workflow 8001:8001 &"
