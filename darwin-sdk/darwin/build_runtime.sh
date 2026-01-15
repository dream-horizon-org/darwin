#!/bin/bash
# Darwin SDK Runtime Builder
# 
# This script builds darwin-sdk as a Python wheel and creates a Ray runtime
# Docker image by extending the base runtime from darwin-compute with 
# darwin-sdk pre-installed.
#
# Usage: ./build_runtime.sh [OPTIONS]
#
# Options:
#   --push              Push the image to the registry after building
#   --registry REGISTRY Target registry (default: 127.0.0.1:55000)
#   --tag TAG           Image tag (default: 2.37.0)
#   --base-dockerfile   Path to base Dockerfile (default: darwin-compute base)
#   --platform PLATFORM Docker platform (default: linux/amd64)
#   --help              Show this help message

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Darwin monorepo root
DARWIN_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Base Dockerfile location
BASE_DOCKERFILE="${DARWIN_ROOT}/darwin-compute/runtimes/cpu/New-Lightweight/Ray2.37_Py3.10_Spark3.5.0/Dockerfile"

# Default values
PUSH=false
REGISTRY="127.0.0.1:55000"
TAG=""
PLATFORM="linux/amd64"
IMAGE_NAME="ray"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    head -18 "$0" | tail -14
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH=true
            shift
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --base-dockerfile)
            BASE_DOCKERFILE="$2"
            shift 2
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# Verify base Dockerfile exists
if [[ ! -f "$BASE_DOCKERFILE" ]]; then
    log_error "Base Dockerfile not found at: $BASE_DOCKERFILE"
    exit 1
fi

# Set default tag to match Ray version used in darwin-cluster-manager
if [[ -z "$TAG" ]]; then
    TAG="2.37.0"
fi

log_info "Darwin SDK Runtime Builder"
log_info "=========================="
log_info "Base Dockerfile: ${BASE_DOCKERFILE}"
log_info "Registry: ${REGISTRY}"
log_info "Image: ${IMAGE_NAME}:${TAG}"
log_info "Platform: ${PLATFORM}"
log_info "Push: ${PUSH}"
echo ""

# Step 1: Build darwin-sdk wheel
log_info "Step 1: Building darwin-sdk wheel..."

cd "${SCRIPT_DIR}"

# Clean previous builds
rm -rf dist/ build/ *.egg-info/

# Build wheel
python3 -m pip install --quiet wheel setuptools
python3 setup.py bdist_wheel --quiet

# Find the built wheel
WHEEL_FILE=$(ls dist/*.whl 2>/dev/null | head -1)
if [[ -z "$WHEEL_FILE" ]]; then
    log_error "Failed to build wheel. No .whl file found in dist/"
    exit 1
fi

WHEEL_NAME=$(basename "$WHEEL_FILE")
log_info "Built wheel: ${WHEEL_NAME}"

# Step 2: Prepare Docker build context
log_info "Step 2: Preparing Docker build context..."

# Create temporary build context
BUILD_CONTEXT=$(mktemp -d)
trap "rm -rf ${BUILD_CONTEXT}" EXIT

# Copy wheel to build context
cp "${WHEEL_FILE}" "${BUILD_CONTEXT}/"

# Create Dockerfile that extends the base and adds darwin-sdk
cat > "${BUILD_CONTEXT}/Dockerfile" << DOCKERFILE_EOF
# =============================================================================
# Base Runtime from darwin-compute
# =============================================================================
$(cat "${BASE_DOCKERFILE}")

# =============================================================================
# Darwin SDK Installation
# =============================================================================

# Copy and install darwin-sdk wheel
COPY ${WHEEL_NAME} /tmp/
RUN pip install --no-cache-dir /tmp/${WHEEL_NAME} && rm -f /tmp/${WHEEL_NAME} || true

# Set default environment variables for local development
ENV ENV=LOCAL
ENV DARWIN_COMPUTE_URL=http://darwin-compute.darwin.svc.cluster.local:8000
DOCKERFILE_EOF

log_info "Build context prepared at: ${BUILD_CONTEXT}"

# Step 3: Build Docker image
log_info "Step 3: Building Docker image..."

docker build \
    --platform "${PLATFORM}" \
    -t "${IMAGE_NAME}:${TAG}" \
    --label "maintainer=darwin" \
    "${BUILD_CONTEXT}"

log_info "Built image: ${IMAGE_NAME}:${TAG}"

# Step 4: Tag and optionally push
if [[ "$PUSH" == "true" ]]; then
    log_info "Step 4: Pushing image to registry..."
    
    FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${TAG}"
    
    docker tag "${IMAGE_NAME}:${TAG}" "${FULL_IMAGE}"
    log_info "Tagged as: ${FULL_IMAGE}"
    
    docker push "${FULL_IMAGE}"
    log_info "Pushed: ${FULL_IMAGE}"
else
    log_info "Step 4: Skipping push (use --push to push to registry)"
fi

# Cleanup
rm -rf dist/ build/ *.egg-info/

echo ""
log_info "=========================="
log_info "Build completed successfully!"
log_info ""
log_info "Local image: ${IMAGE_NAME}:${TAG}"
if [[ "$PUSH" == "true" ]]; then
    log_info "Registry image: ${REGISTRY}/${IMAGE_NAME}:${TAG}"
fi
log_info ""
log_info "To use with Kind:"
log_info "  kind load docker-image ${IMAGE_NAME}:${TAG} --name kind"
log_info ""
log_info "To run locally:"
log_info "  docker run -it ${IMAGE_NAME}:${TAG} python -c 'import darwin; print(darwin.__version__)'"
