#!/bin/bash
set -e

echo "=========================================="
echo "Building Darwin Airflow Image"
echo "=========================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_ENV="$PROJECT_ROOT/.setup/config.env"
WORKFLOW_DIR="${SCRIPT_DIR}"
AIRFLOW_DIR="${WORKFLOW_DIR}/airflow"

if [ ! -d "$AIRFLOW_DIR" ]; then
    echo "❌ Error: Airflow directory not found at $AIRFLOW_DIR"
    exit 1
fi

if [ ! -d "${WORKFLOW_DIR}/core" ]; then
    echo "❌ Error: Core directory not found at ${WORKFLOW_DIR}/core"
    exit 1
fi

# Build from workflow directory (parent) so we can access both airflow/ and core/
cd "$WORKFLOW_DIR"

echo "📦 Building darwin-airflow image..."
echo "   Context: $(pwd)"
echo "   Dockerfile: Dockerfile.airflow"
echo ""

# Build the image - use Dockerfile.airflow which handles all dependencies correctly
docker build -t darwin-airflow:latest -f Dockerfile.airflow --label "maintainer=darwin" . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "✅ Darwin Airflow image built successfully"
echo ""

# Read DOCKER_REGISTRY from config.env (set by start-cluster.sh)
# The registry port is dynamically assigned, so we need to read it from config.env
if [ ! -f "$CONFIG_ENV" ]; then
    echo "⚠️  Warning: config.env not found at $CONFIG_ENV"
    echo "   Using default DOCKER_REGISTRY=localhost:55000"
else
    set -o allexport
    . "$CONFIG_ENV"
    set +o allexport
fi

# Use DOCKER_REGISTRY from config.env if available, otherwise default to localhost:55000
DOCKER_REGISTRY="${DOCKER_REGISTRY:-localhost:55000}"

echo "🏷️  Tagging image for local registry ($DOCKER_REGISTRY)..."
docker tag darwin-airflow:latest "$DOCKER_REGISTRY/darwin-airflow:latest"
echo "✅ Image tagged: $DOCKER_REGISTRY/darwin-airflow:latest"
echo ""

# Push to registry
echo "📤 Pushing image to local registry ($DOCKER_REGISTRY)..."
docker push "$DOCKER_REGISTRY/darwin-airflow:latest" || {
    echo "❌ Failed to push image to registry"
    echo "   Registry: $DOCKER_REGISTRY"
    echo "   Make sure the local registry is running:"
    echo "     docker ps | grep kind-registry"
    echo "   Or check config.env for DOCKER_REGISTRY value"
    exit 1
}

echo "✅ Image pushed to registry successfully"
echo "Image: $DOCKER_REGISTRY/darwin-airflow:latest"
echo ""
echo "To verify the image in the registry:"
echo "  curl http://$DOCKER_REGISTRY/v2/darwin-airflow/tags/list"
echo ""