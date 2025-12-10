#!/bin/sh

git_repo=$1
branch=$2
app_name=$3
file_path=$4
image_tag=$5
app_dir=$6
is_custom=$7

echo "<----- Input Parameters ----->"
echo "Git Repository: $git_repo"
echo "Branch: $branch"
echo "App Name: $app_name"
echo "File Path: $file_path"
echo "Image Tag: $image_tag"
echo "App Directory: $app_dir"
echo "Is Custom: $is_custom"

# Clone the repository if not already present
cd "$file_path" || exit

if [ "$is_custom" = "False" ]; then
  if [ -d "$app_name" ]; then
    echo "Deleting existing directory $app_name for a fresh clone..."
    rm -rf "$app_name"
  fi

  if [ ! -d "$app_name" ]; then
    retries=10
    success=false

    for i in $(seq 1 $retries); do
      if [ -n "$branch" ]; then
        echo "Attempt $i: Cloning the $branch branch of repository $git_repo to $file_path/$app_name"
        git clone "$git_repo" -b "$branch" "$app_name"
      else
        echo "Attempt $i: Cloning the master branch of repository $git_repo to $file_path/$app_name"
        git clone "$git_repo" "$app_name"
      fi

      if [ $? -eq 0 ]; then
        echo "PROJECT PULLED"
        success=true
        break
      else
        echo "Clone failed, retrying..."
      fi
    done

    if [ "$success" = true ]; then
      if [ -f Dockerfile ]; then
        if [ -n "$app_dir" ]; then
          echo "Dockerfile found in the root directory. Moving to $app_name/$app_dir"
          mv Dockerfile "$app_name/$app_dir/Dockerfile" || { echo "Failed to move Dockerfile"; exit 1; }
          cd "$app_name/$app_dir" || { echo "Failed to change directory to $app_name/$app_dir"; exit 1; }
        else
          echo "Dockerfile found in the root directory. Moving to $app_name"
          mv Dockerfile "$app_name/Dockerfile" || { echo "Failed to move Dockerfile"; exit 1; }
          cd "$app_name" || { echo "Failed to change directory to $app_name"; exit 1; }
        fi
      else
        if [ -n "$app_dir" ]; then
          echo "Dockerfile not found in the root directory. Checking in $app_name/$app_dir"
          cd "$app_name/$app_dir" || { echo "Failed to change directory to $app_name/$app_dir"; exit 1; }
        else
          echo "Dockerfile not found in the root directory. Checking in $app_name"
          cd "$app_name" || { echo "Failed to change directory to $app_name"; exit 1; }
        fi
      fi
    else
      echo "Failed to clone the repository after $retries attempts."
    fi
  fi
fi



echo "<----- Dockerfile contents ----->"
# Display the content of the Dockerfile
cat Dockerfile && echo ""

echo "<----- Logs ----->"

CONTAINER_IMAGE_PREFIX="${CONTAINER_IMAGE_PREFIX:-darwin}"
CONTAINER_IMAGE_PREFIX_GCP="${CONTAINER_IMAGE_PREFIX_GCP}"
AWS_ECR_ACCOUNT_ID="${AWS_ECR_ACCOUNT_ID}"
AWS_ECR_REGION="${AWS_ECR_REGION:-us-east-1}"

if [ -n "$AWS_ECR_ACCOUNT_ID" ]; then
  echo "Logging into AWS ECR..."
  aws ecr get-login-password --region "$AWS_ECR_REGION" | docker login --username AWS --password-stdin "$AWS_ECR_ACCOUNT_ID.dkr.ecr.$AWS_ECR_REGION.amazonaws.com" || exit
fi

# Force legacy Docker builder to avoid buildx manifest lists
# This ensures single-arch images compatible with Kubernetes clusters
export DOCKER_BUILDKIT=0

# Determine platform based on environment
# For local development with kind, build for native platform
# For production, force linux/amd64
PLATFORM="${DOCKER_BUILD_PLATFORM:-}"
if [ -z "$PLATFORM" ]; then
  # Check if kind-registry exists (indicates local kind development)
  KIND_REGISTRY_CHECK=$(docker port kind-registry 5000/tcp 2>/dev/null)
  
  # Auto-detect: if running on Apple Silicon with kind-registry, use native
  if [ -n "$KIND_REGISTRY_CHECK" ] && [ "$(uname -m)" = "arm64" ]; then
    PLATFORM="linux/arm64"
    echo "Building for native platform (kind detected): $PLATFORM"
  elif [ -n "$LOCAL_REGISTRY" ] && [ "$(uname -m)" = "arm64" ]; then
    PLATFORM="linux/arm64"
    echo "Building for native platform: $PLATFORM"
  else
    PLATFORM="linux/amd64"
    echo "Building for production platform: $PLATFORM"
  fi
fi

echo "IMAGE BUILD START with tag:$image_tag (using legacy builder, platform: $PLATFORM)" &&
docker build --platform "$PLATFORM" -t "$CONTAINER_IMAGE_PREFIX":"$image_tag" ./ &&

if [ -n "$AWS_ECR_ACCOUNT_ID" ]; then
  docker tag "$CONTAINER_IMAGE_PREFIX":"$image_tag" "$AWS_ECR_ACCOUNT_ID.dkr.ecr.$AWS_ECR_REGION.amazonaws.com/$CONTAINER_IMAGE_PREFIX":"$image_tag" &&
  echo "IMAGE TAGGED for AWS ECR"
fi

echo ""

if [ "$is_custom" = "True" ]; then
  echo "Creating Docker container with image - $image_tag..."
  docker run -dit --name "$app_name" "$CONTAINER_IMAGE_PREFIX":"$image_tag"
  echo "Checking if ray start is working..."
  docker exec -i "$app_name" ray start --head > out.txt
  docker stop "$app_name"
  docker rm "$app_name"
  if grep -q "Ray runtime started" out.txt; then
    echo "Ray start validated for image"
  else
    echo "Ray is not starting in this image"
    docker system prune -af
    exit 1
  fi
fi

# Push to AWS ECR if configured
if [ -n "$AWS_ECR_ACCOUNT_ID" ]; then
  echo "Pushing to AWS ECR..."
  docker push "$AWS_ECR_ACCOUNT_ID.dkr.ecr.$AWS_ECR_REGION.amazonaws.com/$CONTAINER_IMAGE_PREFIX":"$image_tag" &&
  echo "Successfully pushed to AWS ECR"
fi

# Push to kind-registry (auto-detect port from Docker)
# Uses localhost:PORT which Docker allows without HTTPS (unlike Docker network IPs)
IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-serve-app}"

# Try to auto-detect kind-registry's host-mapped port
# Docker allows HTTP push to localhost, but requires HTTPS for other IPs
# So we use 127.0.0.1:PORT instead of the Docker network IP
KIND_REGISTRY_PORT=$(docker port kind-registry 5000/tcp 2>/dev/null | head -1 | cut -d: -f2)

if [ -n "$KIND_REGISTRY_PORT" ]; then
  echo "Auto-detected kind-registry at port: $KIND_REGISTRY_PORT"
  KIND_REGISTRY="127.0.0.1:${KIND_REGISTRY_PORT}"
  
  echo "Tagging for kind-registry: $KIND_REGISTRY"
  docker tag "$CONTAINER_IMAGE_PREFIX":"$image_tag" "$KIND_REGISTRY/$IMAGE_REPOSITORY":"$image_tag" &&
  echo "IMAGE TAGGED for kind-registry as $KIND_REGISTRY/$IMAGE_REPOSITORY:$image_tag"

  echo "Pushing to kind-registry: $KIND_REGISTRY..."
  docker push "$KIND_REGISTRY/$IMAGE_REPOSITORY":"$image_tag" &&
  echo "Successfully pushed to kind-registry as $KIND_REGISTRY/$IMAGE_REPOSITORY:$image_tag"
else
  # Fallback to LOCAL_REGISTRY if kind-registry not found (for non-kind environments)
  LOCAL_REGISTRY="${LOCAL_REGISTRY:-}"
  if [ -n "$LOCAL_REGISTRY" ]; then
    echo "kind-registry not found, using LOCAL_REGISTRY: $LOCAL_REGISTRY"
    docker tag "$CONTAINER_IMAGE_PREFIX":"$image_tag" "$LOCAL_REGISTRY/$IMAGE_REPOSITORY":"$image_tag" &&
    echo "IMAGE TAGGED for Local Registry as $LOCAL_REGISTRY/$IMAGE_REPOSITORY:$image_tag"

    echo "Pushing to Local Registry: $LOCAL_REGISTRY..."
    docker push "$LOCAL_REGISTRY/$IMAGE_REPOSITORY":"$image_tag" &&
    echo "Successfully pushed to Local Registry as $LOCAL_REGISTRY/$IMAGE_REPOSITORY:$image_tag"
  else
    echo "No local registry configured (kind-registry not found, LOCAL_REGISTRY not set)"
  fi
fi

docker system prune -af


