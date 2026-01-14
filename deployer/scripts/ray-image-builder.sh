#!/bin/sh
set -e

# Auto-detect platform based on architecture
# Detects CI environment vs local development
ARCH=$(uname -m)
case "$ARCH" in
  x86_64|amd64) DEFAULT_PLATFORM="linux/amd64" ;;
  arm64|aarch64) DEFAULT_PLATFORM="linux/arm64" ;;
  *) DEFAULT_PLATFORM="linux/arm64" ;;  # Default to arm64 for unknown
esac
PLATFORM="${PLATFORM:-$DEFAULT_PLATFORM}"

# Parse command line arguments
while getopts n:p:P:r:h flag
do
    case "${flag}" in
        n) IMAGE_NAME=${OPTARG};;
        p) DOCKERFILE_PATH=${OPTARG};;
        P) PLATFORM=${OPTARG};;
        r) REGISTRY=${OPTARG};;
        h) 
            echo "Usage: $0 -n <image_name> -p <dockerfile_path> -r <registry> [-P <platform>]"
            echo "  -n: Image name (required)"
            echo "  -p: Path to directory containing Dockerfile (required)"
            echo "  -r: Docker registry URL (required)"
            echo "  -P: Platform (default: auto-detected, currently $DEFAULT_PLATFORM)"
            echo "  -h: Show this help message"
            exit 0
            ;;
    esac
done

# Validate required arguments
if [ -z "$IMAGE_NAME" ]; then
    echo "Error: Missing required option -n (image name)" >&2
    echo "Usage: $0 -n <image_name> -p <dockerfile_path> -r <registry> [-P <platform>]" >&2
    exit 1
fi

if [ -z "$DOCKERFILE_PATH" ]; then
    echo "Error: Missing required option -p (dockerfile path)" >&2
    echo "Usage: $0 -n <image_name> -p <dockerfile_path> -r <registry> [-P <platform>]" >&2
    exit 1
fi

if [ -z "$REGISTRY" ]; then
    echo "Error: Missing required option -r (registry)" >&2
    echo "Usage: $0 -n <image_name> -p <dockerfile_path> -r <registry> [-P <platform>]" >&2
    exit 1
fi

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE_PATH/Dockerfile" ]; then
    echo "Error: Dockerfile not found at $DOCKERFILE_PATH/Dockerfile" >&2
    exit 1
fi

echo "Building Ray image..."
echo "  Image name: $IMAGE_NAME"
echo "  Dockerfile path: $DOCKERFILE_PATH"
echo "  Platform: $PLATFORM (detected arch: $ARCH)"
echo "  Registry: $REGISTRY"

# Build the Docker image
docker build \
    --platform=$PLATFORM \
    -t "$IMAGE_NAME" \
    -f "$DOCKERFILE_PATH/Dockerfile" \
    "$DOCKERFILE_PATH"

# Tag and push to registry
echo "Tagging and pushing image to registry..."
docker tag "$IMAGE_NAME" "$REGISTRY/$IMAGE_NAME"
docker push "$REGISTRY/$IMAGE_NAME"
echo "Successfully pushed image to registry: $REGISTRY/$IMAGE_NAME"
echo "Successfully built image: $IMAGE_NAME"
