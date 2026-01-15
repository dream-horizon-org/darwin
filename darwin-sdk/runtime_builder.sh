#!/bin/bash
# Darwin SDK Runtime Builder
# 
# This script builds Darwin SDK runtime images. It can either:
# 1. Use the built-in Dockerfile (default) which has darwin-sdk pre-installed
# 2. Take any base runtime Dockerfile and add darwin-sdk to it
#
# Usage: ./runtime_builder.sh [OPTIONS]
#
# Options:
#   --runtime-path PATH   Path to source runtime directory (optional, uses built-in if not specified)
#   --push                Push the image to the registry after building
#   --registry REGISTRY   Target registry (default: 127.0.0.1:55000)
#   --tag TAG             Image tag (default: 2.37.0-darwin-sdk)
#   --platform PLATFORM   Docker platform (default: linux/amd64)
#   --spark-version VER   Spark version for built-in Dockerfile (default: 3.5.0)
#   --help                Show this help message

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Darwin monorepo root
DARWIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# Darwin SDK source directory
DARWIN_SDK_DIR="${SCRIPT_DIR}/darwin"
# Runtimes output directory
RUNTIMES_DIR="${DARWIN_ROOT}/darwin-compute/runtimes"
# Built-in Dockerfiles directory
BUILTIN_DOCKERFILES_DIR="${DARWIN_SDK_DIR}/build_runtime"

# Default values
RUNTIME_PATH=""
PUSH=false
REGISTRY="127.0.0.1:55000"
TAG="2.37.0-darwin-sdk"
# Auto-detect platform based on architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64|amd64) DEFAULT_PLATFORM="linux/amd64" ;;
  arm64|aarch64) DEFAULT_PLATFORM="linux/arm64" ;;
  *) DEFAULT_PLATFORM="linux/arm64" ;;  # Default to arm64 for unknown
esac
PLATFORM="${PLATFORM:-$DEFAULT_PLATFORM}"
IMAGE_NAME="ray"
SPARK_VERSION="3.5.0"
USE_BUILTIN=true

# Runtime registration options
REGISTER=false
RUNTIME_NAME=""
COMPUTE_URL="http://localhost:30080"
RUNTIME_CLASS="CPU"
RUNTIME_TYPE="Ray and Spark"
RUNTIME_USER="Darwin"
SPARK_AUTO_INIT=true
REGISTER_REGISTRY=""  # Optional: different registry path for registration (e.g., localhost:5000 for Kind)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

show_help() {
    echo "Darwin SDK Runtime Builder"
    echo ""
    echo "This script builds Darwin SDK runtime images. It can either:"
    echo "1. Use the built-in Dockerfile (default) which has darwin-sdk pre-installed"
    echo "2. Take any base runtime Dockerfile and add darwin-sdk to it"
    echo ""
    echo "Usage: ./runtime_builder.sh [OPTIONS]"
    echo ""
    echo "Build Options:"
    echo "  --runtime-path PATH   Path to source runtime directory (optional)"
    echo "                        If not specified, uses built-in Dockerfile"
    echo "  --push                Push the image to the registry after building"
    echo "  --registry REGISTRY   Target registry (default: 127.0.0.1:55000)"
    echo "  --tag TAG             Image tag (default: 2.37.0-darwin-sdk)"
    echo "  --platform PLATFORM   Docker platform (default: linux/amd64)"
    echo "  --spark-version VER   Spark version for built-in Dockerfile (default: 3.5.0)"
    echo ""
    echo "Registration Options (register runtime with darwin-compute):"
    echo "  --register            Register the runtime with darwin-compute API"
    echo "  --runtime-name NAME   User-friendly runtime name (required if --register)"
    echo "  --compute-url URL     Darwin-compute API URL (default: http://localhost:30080)"
    echo "  --register-registry   Registry path for registration (default: same as --registry)"
    echo "                        Use this when push registry differs from cluster-internal registry"
    echo "                        e.g., push to 127.0.0.1:55000 but register as localhost:5000"
    echo "  --runtime-class CLASS Runtime class: CPU, GPU, or CUSTOM (default: CPU)"
    echo "  --runtime-type TYPE   Runtime type: 'Ray Only', 'Ray and Spark', 'Others' (default: Ray and Spark)"
    echo "  --user USER           User registering the runtime (default: Darwin)"
    echo ""
    echo "  --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  # Build using built-in Dockerfile (recommended)"
    echo "  ./runtime_builder.sh --push"
    echo ""
    echo "  # Build and register with darwin-compute"
    echo "  ./runtime_builder.sh --push --register --runtime-name 'Ray 2.37 + Spark 3.5 + Darwin SDK'"
    echo ""
    echo "  # Build with custom tag and register"
    echo "  ./runtime_builder.sh --tag 2.37.0-custom --push --register --runtime-name 'My Custom Runtime'"
    echo ""
    echo "  # Build from external runtime path"
    echo "  ./runtime_builder.sh --runtime-path ../darwin-compute/runtimes/cpu/New-Lightweight/Ray2.37_Py3.10_Spark3.5.0 --push"
    echo ""
    echo "  # Register with custom compute URL"
    echo "  ./runtime_builder.sh --push --register --runtime-name 'Production Runtime' --compute-url http://darwin-compute:8000"
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --runtime-path)
            RUNTIME_PATH="$2"
            USE_BUILTIN=false
            shift 2
            ;;
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
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --spark-version)
            SPARK_VERSION="$2"
            shift 2
            ;;
        --register)
            REGISTER=true
            shift
            ;;
        --runtime-name)
            RUNTIME_NAME="$2"
            shift 2
            ;;
        --compute-url)
            COMPUTE_URL="$2"
            shift 2
            ;;
        --runtime-class)
            RUNTIME_CLASS="$2"
            shift 2
            ;;
        --runtime-type)
            RUNTIME_TYPE="$2"
            shift 2
            ;;
        --user)
            RUNTIME_USER="$2"
            shift 2
            ;;
        --register-registry)
            REGISTER_REGISTRY="$2"
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

# Validate registration options
if [[ "$REGISTER" == "true" ]]; then
    if [[ -z "$RUNTIME_NAME" ]]; then
        log_error "Runtime name is required when using --register. Use --runtime-name <name>"
        exit 1
    fi
    
    # Validate runtime class
    if [[ ! "$RUNTIME_CLASS" =~ ^(CPU|GPU|CUSTOM)$ ]]; then
        log_error "Invalid runtime class: $RUNTIME_CLASS. Must be CPU, GPU, or CUSTOM"
        exit 1
    fi
    
    # Validate runtime type for non-CUSTOM class
    if [[ "$RUNTIME_CLASS" != "CUSTOM" ]]; then
        if [[ ! "$RUNTIME_TYPE" =~ ^(Ray\ Only|Ray\ and\ Spark|Others)$ ]]; then
            log_error "Invalid runtime type: $RUNTIME_TYPE. Must be 'Ray Only', 'Ray and Spark', or 'Others'"
            exit 1
        fi
    fi
fi

# Use built-in Dockerfile if no runtime path specified
if [[ "$USE_BUILTIN" == "true" ]]; then
    # Map spark version to directory name
    SPARK_DIR_NAME="spark_${SPARK_VERSION//./_}"
    BUILTIN_DOCKERFILE="${BUILTIN_DOCKERFILES_DIR}/${SPARK_DIR_NAME}/Dockerfile"
    
    if [[ ! -f "$BUILTIN_DOCKERFILE" ]]; then
        log_error "Built-in Dockerfile not found for Spark ${SPARK_VERSION}"
        log_error "Expected path: ${BUILTIN_DOCKERFILE}"
        log_error "Available versions:"
        ls -d "${BUILTIN_DOCKERFILES_DIR}"/spark_* 2>/dev/null | xargs -n1 basename | sed 's/spark_/  /g; s/_/./g'
        exit 1
    fi
    
    RUNTIME_PATH="${BUILTIN_DOCKERFILES_DIR}/${SPARK_DIR_NAME}"
    log_info "Using built-in Dockerfile: ${BUILTIN_DOCKERFILE}"
fi

# Resolve runtime path to absolute path
if [[ ! "$RUNTIME_PATH" = /* ]]; then
    RUNTIME_PATH="$(cd "$(pwd)" && cd "$(dirname "$RUNTIME_PATH")" && pwd)/$(basename "$RUNTIME_PATH")"
fi

# Handle if path points to Dockerfile directly or directory
if [[ -f "$RUNTIME_PATH" && "$(basename "$RUNTIME_PATH")" == "Dockerfile" ]]; then
    SOURCE_DOCKERFILE="$RUNTIME_PATH"
    RUNTIME_DIR="$(dirname "$RUNTIME_PATH")"
elif [[ -d "$RUNTIME_PATH" ]]; then
    SOURCE_DOCKERFILE="${RUNTIME_PATH}/Dockerfile"
    RUNTIME_DIR="$RUNTIME_PATH"
else
    log_error "Invalid runtime path: $RUNTIME_PATH"
    log_error "Path should be a directory containing a Dockerfile or a Dockerfile itself"
    exit 1
fi

# Verify source Dockerfile exists
if [[ ! -f "$SOURCE_DOCKERFILE" ]]; then
    log_error "Dockerfile not found at: $SOURCE_DOCKERFILE"
    exit 1
fi

# Extract runtime folder name for output naming
RUNTIME_FOLDER_NAME="$(basename "$RUNTIME_DIR")"

# Determine output folder path (with _DarwinSDK suffix)
# Find the relative path from runtimes directory
RUNTIME_PARENT_DIR="$(dirname "$RUNTIME_DIR")"
OUTPUT_FOLDER_NAME="${RUNTIME_FOLDER_NAME}_DarwinSDK"

# Determine output path - try to maintain directory structure relative to runtimes
if [[ "$USE_BUILTIN" == "true" ]]; then
    # Using built-in Dockerfile - output to cpu/New-Lightweight
    OUTPUT_DIR="${RUNTIMES_DIR}/cpu/New-Lightweight/Ray2.37_Py3.10_Spark${SPARK_VERSION}_DarwinSDK"
elif [[ "$RUNTIME_DIR" == *"/darwin-compute/runtimes/"* ]]; then
    # Runtime is within darwin-compute/runtimes - maintain structure
    RELATIVE_PATH="${RUNTIME_DIR#*darwin-compute/runtimes/}"
    RELATIVE_PARENT="$(dirname "$RELATIVE_PATH")"
    OUTPUT_DIR="${RUNTIMES_DIR}/${RELATIVE_PARENT}/${OUTPUT_FOLDER_NAME}"
else
    # Runtime is outside - put in cpu/custom folder
    OUTPUT_DIR="${RUNTIMES_DIR}/cpu/custom/${OUTPUT_FOLDER_NAME}"
fi

# Print configuration
echo ""
log_info "=============================================="
log_info "Darwin SDK Runtime Builder"
log_info "=============================================="
log_info "Source Dockerfile: ${SOURCE_DOCKERFILE}"
log_info "Output Directory:  ${OUTPUT_DIR}"
log_info "Registry:          ${REGISTRY}"
log_info "Image:             ${IMAGE_NAME}:${TAG}"
log_info "Platform:          ${PLATFORM}"
log_info "Push:              ${PUSH}"
if [[ "$REGISTER" == "true" ]]; then
    log_info "Register:          ${REGISTER}"
    log_info "Runtime Name:      ${RUNTIME_NAME}"
    log_info "Compute URL:       ${COMPUTE_URL}"
    if [[ -n "$REGISTER_REGISTRY" ]]; then
        log_info "Register Registry: ${REGISTER_REGISTRY}"
    fi
    log_info "Runtime Class:     ${RUNTIME_CLASS}"
    log_info "Runtime Type:      ${RUNTIME_TYPE}"
fi
echo ""

# Create temporary build context
BUILD_CONTEXT=$(mktemp -d)
trap "rm -rf ${BUILD_CONTEXT}" EXIT

if [[ "$USE_BUILTIN" == "true" ]]; then
    # Using built-in Dockerfile - installs darwin-sdk from local source
    log_step "Step 1/3: Preparing build context with darwin-sdk..."
    
    # Copy the Dockerfile
    cp "${SOURCE_DOCKERFILE}" "${BUILD_CONTEXT}/Dockerfile"
    
    # Copy darwin-sdk source for installation
    mkdir -p "${BUILD_CONTEXT}/darwin-sdk"
    cp -r "${DARWIN_SDK_DIR}/darwin" "${BUILD_CONTEXT}/darwin-sdk/"
    cp "${DARWIN_SDK_DIR}/setup.py" "${BUILD_CONTEXT}/darwin-sdk/"
    cp "${DARWIN_SDK_DIR}/requirements.txt" "${BUILD_CONTEXT}/darwin-sdk/"
    cp "${DARWIN_SDK_DIR}/README.md" "${BUILD_CONTEXT}/darwin-sdk/" 2>/dev/null || echo "# Darwin SDK" > "${BUILD_CONTEXT}/darwin-sdk/README.md"
    cp "${DARWIN_SDK_DIR}/MANIFEST.in" "${BUILD_CONTEXT}/darwin-sdk/" 2>/dev/null || true
    cp "${DARWIN_SDK_DIR}/version.txt" "${BUILD_CONTEXT}/darwin-sdk/" 2>/dev/null || true
    
    log_info "Build context prepared with darwin-sdk source"
else
    # External runtime - need to build and add darwin-sdk
    log_step "Step 1/5: Building darwin-sdk..."
    
    cd "${DARWIN_SDK_DIR}"
    
    # Clean previous builds
    rm -rf dist/ build/ *.egg-info/ darwin.egg-info/ 2>/dev/null || true
    
    # Build wheel
    python3 -m pip install --quiet wheel setuptools 2>/dev/null || true
    python3 setup.py bdist_wheel --quiet 2>/dev/null || python3 setup.py bdist_wheel
    
    # Find the built wheel
    WHEEL_FILE=$(ls dist/*.whl 2>/dev/null | head -1)
    if [[ -z "$WHEEL_FILE" ]]; then
        log_error "Failed to build darwin-sdk wheel. No .whl file found in dist/"
        exit 1
    fi
    
    WHEEL_NAME=$(basename "$WHEEL_FILE")
    log_info "Built wheel: ${WHEEL_NAME}"
    
    # Step 2: Prepare Docker build context
    log_step "Step 2/5: Preparing Docker build context..."
    
    # Copy wheel to build context
    cp "${WHEEL_FILE}" "${BUILD_CONTEXT}/"
    
    # Copy darwin-sdk source for installation (alternative method)
    mkdir -p "${BUILD_CONTEXT}/darwin-sdk"
    cp -r "${DARWIN_SDK_DIR}/darwin" "${BUILD_CONTEXT}/darwin-sdk/"
    cp "${DARWIN_SDK_DIR}/setup.py" "${BUILD_CONTEXT}/darwin-sdk/"
    cp "${DARWIN_SDK_DIR}/requirements.txt" "${BUILD_CONTEXT}/darwin-sdk/"
    cp "${DARWIN_SDK_DIR}/README.md" "${BUILD_CONTEXT}/darwin-sdk/" 2>/dev/null || echo "# Darwin SDK" > "${BUILD_CONTEXT}/darwin-sdk/README.md"
    cp "${DARWIN_SDK_DIR}/MANIFEST.in" "${BUILD_CONTEXT}/darwin-sdk/" 2>/dev/null || true
    cp "${DARWIN_SDK_DIR}/version.txt" "${BUILD_CONTEXT}/darwin-sdk/" 2>/dev/null || true
    
    # Step 3: Generate new Dockerfile
    log_step "Step 3/5: Generating Dockerfile with darwin-sdk..."
    
    # Create the new Dockerfile that extends the base
    cat > "${BUILD_CONTEXT}/Dockerfile" << DOCKERFILE_EOF
# =============================================================================
# Darwin SDK Runtime
# Generated by: darwin-sdk/runtime_builder.sh
# Source: ${SOURCE_DOCKERFILE}
# =============================================================================

$(cat "${SOURCE_DOCKERFILE}")

# =============================================================================
# Darwin SDK Installation
# =============================================================================

# Install darwin-sdk dependencies
RUN pip install \\
    boto3==1.35.91 \\
    pyarrow==14.0.2 \\
    "botocore>=1.35.91,<1.36" \\
    "requests>=2.28.1,<=2.32.3" \\
    "dataclasses-json>=0.5.7,<=0.6.7" \\
    raydp==1.6.2

# Copy and install darwin-sdk
COPY --chown=ray:users darwin-sdk /tmp/darwin-sdk
RUN cd /tmp/darwin-sdk && pip install . && cd / && rm -rf /tmp/darwin-sdk

# Set default environment variables for Darwin SDK
ENV ENV=LOCAL
ENV DARWIN_COMPUTE_URL=http://darwin-compute.darwin.svc.cluster.local:8000
DOCKERFILE_EOF

    log_info "Dockerfile generated at: ${BUILD_CONTEXT}/Dockerfile"
fi

# Build Docker image
if [[ "$USE_BUILTIN" == "true" ]]; then
    log_step "Step 2/3: Building Docker image..."
else
    log_step "Step 4/5: Building Docker image..."
fi

docker build \
    --platform "${PLATFORM}" \
    -t "${IMAGE_NAME}:${TAG}" \
    --label "maintainer=darwin" \
    "${BUILD_CONTEXT}"

log_info "Built image: ${IMAGE_NAME}:${TAG}"

# Tag, push, and save Dockerfile
if [[ "$USE_BUILTIN" == "true" ]]; then
    log_step "Step 3/3: Finalizing..."
else
    log_step "Step 5/5: Finalizing..."
fi

# Push if requested
if [[ "$PUSH" == "true" ]]; then
    FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${TAG}"
    
    docker tag "${IMAGE_NAME}:${TAG}" "${FULL_IMAGE}"
    log_info "Tagged as: ${FULL_IMAGE}"
    
    docker push "${FULL_IMAGE}"
    log_info "Pushed: ${FULL_IMAGE}"
fi

# Create output directory and copy Dockerfile
mkdir -p "${OUTPUT_DIR}"
cp "${BUILD_CONTEXT}/Dockerfile" "${OUTPUT_DIR}/Dockerfile"
log_info "Dockerfile saved to: ${OUTPUT_DIR}/Dockerfile"

# Cleanup darwin-sdk build artifacts (only if we built it)
if [[ "$USE_BUILTIN" != "true" ]]; then
    cd "${DARWIN_SDK_DIR}"
    rm -rf dist/ build/ *.egg-info/ darwin.egg-info/ 2>/dev/null || true
fi

# Register runtime with darwin-compute if requested
REGISTRATION_SUCCESS=false
if [[ "$REGISTER" == "true" ]]; then
    log_step "Registering runtime with darwin-compute..."
    
    # Construct the full image path
    # Use REGISTER_REGISTRY if set, otherwise use REGISTRY
    REG_REGISTRY="${REGISTER_REGISTRY:-$REGISTRY}"
    FULL_IMAGE="${REG_REGISTRY}/${IMAGE_NAME}:${TAG}"
    
    # Build the JSON payload
    if [[ "$RUNTIME_CLASS" == "CUSTOM" ]]; then
        # CUSTOM class doesn't have a type
        JSON_PAYLOAD=$(cat <<EOF
{
    "runtime": "${RUNTIME_NAME}",
    "class": "${RUNTIME_CLASS}",
    "image": "${FULL_IMAGE}",
    "user": "${RUNTIME_USER}",
    "spark_auto_init": ${SPARK_AUTO_INIT}
}
EOF
)
    else
        JSON_PAYLOAD=$(cat <<EOF
{
    "runtime": "${RUNTIME_NAME}",
    "class": "${RUNTIME_CLASS}",
    "type": "${RUNTIME_TYPE}",
    "image": "${FULL_IMAGE}",
    "user": "${RUNTIME_USER}",
    "spark_auto_init": ${SPARK_AUTO_INIT},
    "components": [
        {"name": "Ray", "version": "2.37.0"},
        {"name": "Spark", "version": "${SPARK_VERSION}"},
        {"name": "Python", "version": "3.10"}
    ]
}
EOF
)
    fi
    
    log_info "Registering runtime: ${RUNTIME_NAME}"
    log_info "API Endpoint: ${COMPUTE_URL}/runtime/v2/create"
    
    # Make the API call (don't fail on curl errors)
    set +e
    RESPONSE=$(curl -s -w "\n%{http_code}" --connect-timeout 10 -X POST \
        "${COMPUTE_URL}/runtime/v2/create" \
        -H "Content-Type: application/json" \
        -d "${JSON_PAYLOAD}" 2>&1)
    CURL_EXIT_CODE=$?
    set -e
    
    if [[ $CURL_EXIT_CODE -ne 0 ]]; then
        log_warn "Failed to connect to darwin-compute API (exit code: $CURL_EXIT_CODE)"
        log_warn "Make sure darwin-compute is running at: ${COMPUTE_URL}"
        log_warn "You can manually register using the darwin-compute API"
    else
        # Extract HTTP status code (last line) and response body
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
        
        if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "201" ]]; then
            log_info "Runtime registered successfully!"
            REGISTRATION_SUCCESS=true
        else
            log_warn "Failed to register runtime (HTTP $HTTP_CODE)"
            log_warn "Response: $RESPONSE_BODY"
            log_warn "You can manually register using the darwin-compute API"
        fi
    fi
fi

# Summary
echo ""
log_info "=============================================="
log_info "Build completed successfully!"
log_info "=============================================="
log_info ""
log_info "Local image:    ${IMAGE_NAME}:${TAG}"
if [[ "$PUSH" == "true" ]]; then
    log_info "Registry image: ${REGISTRY}/${IMAGE_NAME}:${TAG}"
fi
log_info "Dockerfile:     ${OUTPUT_DIR}/Dockerfile"
if [[ "$REGISTER" == "true" ]]; then
    REG_REGISTRY="${REGISTER_REGISTRY:-$REGISTRY}"
    if [[ "$REGISTRATION_SUCCESS" == "true" ]]; then
        log_info "Runtime Name:   ${RUNTIME_NAME} (registered)"
        log_info "Runtime Image:  ${REG_REGISTRY}/${IMAGE_NAME}:${TAG}"
    else
        log_warn "Runtime Name:   ${RUNTIME_NAME} (registration failed)"
    fi
fi
log_info ""
log_info "To use with Kind:"
log_info "  kind load docker-image ${IMAGE_NAME}:${TAG} --name kind"
log_info ""
log_info "To run locally:"
log_info "  docker run -it ${IMAGE_NAME}:${TAG} python -c 'import darwin; print(darwin.__version__)'"

if [[ "$REGISTER" != "true" ]]; then
    echo ""
    log_info "To register this runtime with darwin-compute:"
    log_info "  ./runtime_builder.sh --register --runtime-name 'My Runtime' --compute-url http://darwin-compute:8000"
fi

