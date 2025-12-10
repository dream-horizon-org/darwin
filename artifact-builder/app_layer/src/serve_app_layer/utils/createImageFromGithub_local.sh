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
# For local development, build for native platform
# For production, force linux/amd64
PLATFORM="${DOCKER_BUILD_PLATFORM:-}"
if [ -z "$PLATFORM" ]; then
  # Auto-detect: if running on Apple Silicon and LOCAL_REGISTRY is set, use native
  if [ -n "$LOCAL_REGISTRY" ] && [ "$(uname -m)" = "arm64" ]; then
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

# Push to local registry (kind-registry) if configured
LOCAL_REGISTRY="${LOCAL_REGISTRY:-}"
IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-serve-app}"  

if [ -n "$LOCAL_REGISTRY" ]; then
  echo "Tagging for Local Registry: $LOCAL_REGISTRY"
  # Use IMAGE_REPOSITORY (not app_name) to match what ml-serve-app expects
  docker tag "$CONTAINER_IMAGE_PREFIX":"$image_tag" "$LOCAL_REGISTRY/$IMAGE_REPOSITORY":"$image_tag" &&
  echo "IMAGE TAGGED for Local Registry as $LOCAL_REGISTRY/$IMAGE_REPOSITORY:$image_tag"

  echo "Pushing to Local Registry: $LOCAL_REGISTRY..."
  docker push "$LOCAL_REGISTRY/$IMAGE_REPOSITORY":"$image_tag" &&
  echo "Successfully pushed to Local Registry as $LOCAL_REGISTRY/$IMAGE_REPOSITORY:$image_tag"
fi

docker system prune -af


