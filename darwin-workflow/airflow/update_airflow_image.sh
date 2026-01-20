#!/usr/bin/env bash
set -e

# Get the absolute path to the project root (darwin-distro)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKFLOW_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$WORKFLOW_DIR/.." && pwd)"
PROJECT_ROOT_ABS="$PROJECT_ROOT"

echo "Project Root: $PROJECT_ROOT_ABS"
echo "Workflow Dir: $WORKFLOW_DIR"
echo "Airflow Dir: $SCRIPT_DIR"

# Set KUBECONFIG to the correct path
export KUBECONFIG="$PROJECT_ROOT_ABS/.setup/kindkubeconfig.yaml"

# Configuration
IMAGE_NAME="darwin-airflow"
IMAGE_TAG="latest"
NAMESPACE="darwin"

echo "=========================================="
echo "Darwin Airflow Image Update Script"
echo "=========================================="
echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "Namespace: ${NAMESPACE}"
echo ""

# Step 1: Build the Docker image
echo "Step 1: Building Docker image..."
# Build from workflow root directory (where model, core, airflow directories are)
cd "$WORKFLOW_DIR"
docker build --platform linux/amd64 -f Dockerfile.airflow -t ${IMAGE_NAME}:${IMAGE_TAG} --label "maintainer=darwin" .
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi
echo "✅ Docker image built successfully"
echo ""

# Step 2: Load image into kind cluster
echo "Step 2: Loading image into kind cluster..."
kind load docker-image ${IMAGE_NAME}:${IMAGE_TAG}
if [ $? -ne 0 ]; then
    echo "❌ Failed to load image into kind cluster"
    exit 1
fi
echo "✅ Image loaded into kind cluster"
echo ""

# Step 3: Update Airflow deployments
echo "Step 3: Updating Airflow deployments..."

# Update scheduler (has both airflow-scheduler and s3-dag-sync containers)
echo "Updating scheduler..."
kubectl set image deployment/darwin-airflow-scheduler \
    airflow-scheduler=${IMAGE_NAME}:${IMAGE_TAG} \
    s3-dag-sync=${IMAGE_NAME}:${IMAGE_TAG} \
    -n ${NAMESPACE}

# Update webserver (only has airflow-webserver container)
echo "Updating webserver..."
kubectl set image deployment/darwin-airflow-webserver \
    airflow-webserver=${IMAGE_NAME}:${IMAGE_TAG} \
    -n ${NAMESPACE}

# Update worker (only has airflow-worker container)
echo "Updating worker..."
kubectl set image deployment/darwin-airflow-worker \
    airflow-worker=${IMAGE_NAME}:${IMAGE_TAG} \
    -n ${NAMESPACE}

echo "✅ Deployments updated"
echo ""

# Step 4: Restart deployments
echo "Step 4: Restarting Airflow deployments..."
kubectl rollout restart deployment/darwin-airflow-scheduler -n ${NAMESPACE}
kubectl rollout restart deployment/darwin-airflow-webserver -n ${NAMESPACE}
kubectl rollout restart deployment/darwin-airflow-worker -n ${NAMESPACE}
echo ""

# Step 5: Wait for rollout to complete
echo "Step 5: Waiting for deployments to complete..."
echo "Waiting for scheduler..."
kubectl rollout status deployment/darwin-airflow-scheduler -n ${NAMESPACE} --timeout=300s

echo "Waiting for webserver..."
kubectl rollout status deployment/darwin-airflow-webserver -n ${NAMESPACE} --timeout=300s

echo "Waiting for worker..."
kubectl rollout status deployment/darwin-airflow-worker -n ${NAMESPACE} --timeout=300s

echo ""
echo "✅ Airflow image update complete!"
echo ""
echo "To verify airflow_core is installed:"
echo "  kubectl exec -n ${NAMESPACE} -it deployment/darwin-airflow-scheduler -c airflow-scheduler -- python -c 'import airflow_core; print(airflow_core.__file__)'"
echo ""
echo "To check DAGs:"
echo "  kubectl exec -n ${NAMESPACE} -it deployment/darwin-airflow-scheduler -c airflow-scheduler -- airflow dags list"
