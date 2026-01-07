#!/bin/sh
set -e

# Build serve runtime images with proper context handling
# 
#
# Usage: 
#   ./serve-image-builder.sh -n <image_name> -p <dockerfile_path> -c <context_path> -r <registry>

# Default platform for Apple Silicon Macs
PLATFORM="${PLATFORM:-linux/arm64}"

# Parse command line arguments
while getopts n:p:c:P:r:h flag
do
    case "${flag}" in
        n) IMAGE_NAME=${OPTARG};;
        p) DOCKERFILE_PATH=${OPTARG};;
        c) CONTEXT_PATH=${OPTARG};;
        P) PLATFORM=${OPTARG};;
        r) REGISTRY=${OPTARG};;
        h) 
            echo "Usage: $0 -n <image_name> -p <dockerfile_path> -c <context_path> -r <registry> [-P <platform>]"
            echo "  -n: Image name (required)"
            echo "  -p: Path to directory containing Dockerfile (required)"
            echo "  -c: Build context path (required) - parent directory containing src/"
            echo "  -r: Docker registry URL (required)"
            echo "  -P: Platform (default: linux/arm64)"
            echo "  -h: Show this help message"
            exit 0
            ;;
    esac
done

# Validate required arguments
if [[ -z "$IMAGE_NAME" ]]; then
    echo "Error: Missing required option -n (image name)" >&2
    exit 1
fi

if [[ -z "$DOCKERFILE_PATH" ]]; then
    echo "Error: Missing required option -p (dockerfile path)" >&2
    exit 1
fi

if [[ -z "$CONTEXT_PATH" ]]; then
    echo "Error: Missing required option -c (context path)" >&2
    exit 1
fi

if [[ -z "$REGISTRY" ]]; then
    echo "Error: Missing required option -r (registry)" >&2
    exit 1
fi

# Check if Dockerfile exists
if [[ ! -f "$DOCKERFILE_PATH/Dockerfile" ]]; then
    echo "Error: Dockerfile not found at $DOCKERFILE_PATH/Dockerfile" >&2
    exit 1
fi

# Check if context path exists
if [[ ! -d "$CONTEXT_PATH" ]]; then
    echo "Error: Context path not found: $CONTEXT_PATH" >&2
    exit 1
fi

echo "Building serve runtime image..."
echo "  Image name: $IMAGE_NAME"
echo "  Dockerfile: $DOCKERFILE_PATH/Dockerfile"
echo "  Context: $CONTEXT_PATH"
echo "  Platform: $PLATFORM"
echo "  Registry: $REGISTRY"

# Build the Docker image with separate dockerfile and context paths
docker build \
    --platform=$PLATFORM \
    -t "$IMAGE_NAME" \
    -f "$DOCKERFILE_PATH/Dockerfile" \
    "$CONTEXT_PATH"

# Tag and push to registry
echo "Tagging and pushing image to registry..."
docker tag "$IMAGE_NAME" "$REGISTRY/$IMAGE_NAME"
docker push "$REGISTRY/$IMAGE_NAME"
echo "Successfully pushed image to registry: $REGISTRY/$IMAGE_NAME"
echo "Successfully built image: $IMAGE_NAME"