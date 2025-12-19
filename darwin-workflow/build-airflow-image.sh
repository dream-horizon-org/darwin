#!/bin/bash
set -e

echo "=========================================="
echo "Building Darwin Airflow Image"
echo "=========================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
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
docker build -t darwin-airflow:latest -f Dockerfile.airflow . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "✅ Darwin Airflow image built successfully"
echo ""

# Tag for local registry
echo "🏷️  Tagging image for local registry..."
docker tag darwin-airflow:latest localhost:55000/darwin-airflow:latest
echo "✅ Image tagged: localhost:55000/darwin-airflow:latest"
echo ""

# Push to registry
echo "📤 Pushing image to local registry..."
docker push localhost:55000/darwin-airflow:latest || {
    echo "❌ Failed to push image to registry"
    echo "   Make sure the local registry is running:"
    exit 1
}

echo "✅ Image pushed to registry successfully"
echo "Image: localhost:55000/darwin-airflow:latest"
echo ""
echo "To verify the image in the registry:"
echo "  curl http://localhost:55000/v2/darwin-airflow/tags/list"
echo ""
