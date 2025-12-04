#!/bin/sh
set -e

# Check for init configuration
ENABLED_SERVICES_FILE=".setup/enabled-services.yaml"
if [ ! -f "$ENABLED_SERVICES_FILE" ]; then
    echo "❌ No configuration found at $ENABLED_SERVICES_FILE"
    echo "   Please run ./init.sh first to configure which services to enable."
    exit 1
fi
echo "✅ Found configuration: $ENABLED_SERVICES_FILE"

# Mark local config files as assume-unchanged to prevent accidental commits
git update-index --assume-unchanged config.env 2>/dev/null || true
git update-index --assume-unchanged kind/config/kindkubeconfig.yaml 2>/dev/null || true

# Parse command line arguments
AUTO_YES=false
while [ $# -gt 0 ]; do
  case "$1" in
    -y|--yes)
      AUTO_YES=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [-y|--yes]"
      exit 1
      ;;
  esac
done

echo '' > config.env

extract_max_supported_api_version() {
    printf "%s\n" "$1" | sed -n 's/.*Maximum supported API version is \([0-9.]*\).*/\1/p' | head -n 1
}

ensure_docker_api_version() {
    if ! command -v docker >/dev/null 2>&1; then
        echo "❌ Docker is not installed or not found in PATH"
        exit 1
    fi

    if docker version >/dev/null 2>&1; then
        return
    fi

    error_output="$(docker version 2>&1 || true)"
    max_version="$(extract_max_supported_api_version "$error_output")"

    if [ -z "$max_version" ]; then
        ps_error="$(docker ps 2>&1 || true)"
        error_output="${error_output}\n${ps_error}"
        max_version="$(extract_max_supported_api_version "$ps_error")"
    fi

    if [ -n "$max_version" ]; then
        echo "⚠️  Docker client API version is newer than daemon. Setting DOCKER_API_VERSION=$max_version"
        export DOCKER_API_VERSION="$max_version"
        if docker version >/dev/null 2>&1; then
            echo "✅ Docker API version pinned to $DOCKER_API_VERSION"
            return
        fi
    fi

    printf "%s\n" "$error_output"
    echo "❌ Failed to communicate with Docker daemon. Please ensure Docker is running."
    exit 1
}

ENV=local
ENV_CREATION=false

ensure_docker_api_version

# Check if ENV environment variable equals "local"
if [ "$ENV" = "local" ]; then
    echo "ENV is set to 'local'"
    # Start the kind cluster using the existing script
    if [ "$AUTO_YES" = "true" ]; then
        REPLY="y"
        echo "Auto-answering 'yes' to setup local k8s cluster"
    else
        read -p "Do you want to setup local k8s cluster? (y/n) " -n 1 -r
    fi
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "\nStarting kind cluster..."

        envsubst < ./kind/kind-config.yaml > ./kind/kind-config-tmp.yaml
        export CLUSTER_NAME=kind
        export KIND_CONFIG=./kind/kind-config-tmp.yaml
        export KUBECONFIG=./kind/config/kindkubeconfig.yaml
        
        sh ./kind/start-cluster.sh
        ENV_CREATION=true
        
        rm ./kind/kind-config-tmp.yaml
    else
        echo "\nSkipping kind cluster setup"
        echo "DOCKER_REGISTRY=docker.io" >> config.env
    fi
else
    echo "ENV is not set to 'local' (current value: '$ENV'), skipping local k8s cluster setup"
fi

# check if kube config file exists and is reachable
if [ ! -f "$KUBECONFIG" ]; then
    echo "KUBECONFIG file does not exist"
    exit 1
else
    echo "KUBECONFIG=$KUBECONFIG" >> config.env
    source config.env
fi

if kubectl version >/dev/null 2>&1; then
  echo "✅ Cluster is up"
else
  echo "❌ Cluster is not reachable"
fi

# Ask if user wants a clean build
if [ "$AUTO_YES" = "true" ]; then
    REPLY="y"
    echo "Auto-answering 'yes' to clean build"
else
    read -p "Do you want a clean build? (y/n) " -n 1 -r
fi
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "\nSkipping build. Exiting."
    exit 0
fi
echo

# Install yq if not available
if ! command -v yq >/dev/null 2>&1; then
  echo "Installing yq..."
  
  # Detect OS
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  case "$OS" in
    darwin) OS="darwin" ;;
    linux) OS="linux" ;;
    *) echo "Unsupported OS: $OS. Please install yq manually."; exit 1 ;;
  esac
  
  # Detect architecture
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) ARCH="amd64" ;;
    amd64) ARCH="amd64" ;;
    arm64) ARCH="arm64" ;;
    aarch64) ARCH="arm64" ;;
    *) echo "Unsupported architecture: $ARCH. Please install yq manually."; exit 1 ;;
  esac
  
  # Download yq binary
  YQ_URL="https://github.com/mikefarah/yq/releases/latest/download/yq_${OS}_${ARCH}"
  echo "Downloading yq from: $YQ_URL"
  
  # Create directory if it doesn't exist
  mkdir -p /usr/local/bin
  
  # Download and install
  if curl -fsSL "$YQ_URL" -o /usr/local/bin/yq; then
    chmod +x /usr/local/bin/yq
    echo "✅ yq installed successfully"
  else
    echo "❌ Failed to download yq. Please install manually."
    exit 1
  fi
else
  echo "✅ yq is already available"
fi

pushd deployer/images/java-11
sh build.sh
popd

pushd deployer/images/python-3.9.7
sh build.sh
popd

pushd deployer/images/golang-1.18
sh build.sh
popd

pushd deployer/images/nodejs-20.16.0
sh build.sh
popd

# Path to your YAML files
YAML_FILE="services.yaml"
ENABLED_FILE=".setup/enabled-services.yaml"

dynamic_build_args=""

# ============================================================================
# BUILD APPLICATIONS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    BUILDING APPLICATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Loop through YAML using array approach - check enabled status from .setup/enabled-services.yaml
app_count=$(yq eval '.applications | length' "$YAML_FILE")
i=0
while [ $i -lt $app_count ]; do
  application=$(yq eval ".applications[$i].application" "$YAML_FILE")

  # Check enabled status from .setup/enabled-services.yaml
  is_enabled=$(yq eval ".applications.\"$application\"" "$ENABLED_FILE")
  if [ "$is_enabled" != "true" ]; then
    echo "⏭️  Skipping $application (disabled)"
    i=$((i + 1))
    continue
  fi

  base_path=$(yq eval ".applications[$i].base-path" "$YAML_FILE")
  path=$(yq eval ".applications[$i].path" "$YAML_FILE")
  base_image=$(yq eval ".applications[$i].base-image" "$YAML_FILE")
  # create key value pair of envs name and value
  extra_env_vars=$(yq eval ".applications[$i].env" "$YAML_FILE")
  # Parse the YAML env array into key=value pairs using yq
  env_count=$(yq eval ".applications[$i].env | length" "$YAML_FILE")
  j=0
  while [ $j -lt $env_count ]; do
    key=$(yq eval ".applications[$i].env[$j].name" "$YAML_FILE")
    value=$(yq eval ".applications[$i].env[$j].value" "$YAML_FILE")
    dynamic_build_args="$dynamic_build_args|$key=$value"
    j=$((j + 1))
  done

  echo ">>> Building image for $application..."
  sh deployer/scripts/image-builder.sh -a "$application" -t "$base_path" -p "$path" -e "$base_image" -r "$DOCKER_REGISTRY" -B "$dynamic_build_args"
  
  echo ">>> Completed processing $application"
  i=$((i + 1))
done

# ============================================================================
# BUILD RAY IMAGES
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    BUILDING RAY IMAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ray_image_count=$(yq eval '.ray-images | length' "$YAML_FILE")
i=0
while [ $i -lt $ray_image_count ]; do
  image_name=$(yq eval ".ray-images[$i].image-name" "$YAML_FILE")

  # Check enabled status from .setup/enabled-services.yaml
  is_enabled=$(yq eval ".ray-images.\"$image_name\"" "$ENABLED_FILE")
  if [ "$is_enabled" != "true" ]; then
    echo "⏭️  Skipping ray image $image_name (disabled)"
    i=$((i + 1))
    continue
  fi

  dockerfile_path=$(yq eval ".ray-images[$i].dockerfile-path" "$YAML_FILE")
  echo ">>> Building ray image $image_name..."
  sh deployer/scripts/ray-image-builder.sh -n "$image_name" -p "$dockerfile_path" -r "$DOCKER_REGISTRY"
  i=$((i + 1))
done

# ============================================================================
# BUILD SERVE RUNTIME IMAGES
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                  BUILDING SERVE RUNTIME IMAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

serve_image_count=$(yq eval '.serve-images | length' "$YAML_FILE")
i=0
while [ $i -lt $serve_image_count ]; do
  image_name=$(yq eval ".serve-images[$i].image-name" "$YAML_FILE")

  # Check enabled status from .setup/enabled-services.yaml
  is_enabled=$(yq eval ".serve-images.\"$image_name\"" "$ENABLED_FILE")
  if [ "$is_enabled" != "true" ]; then
    echo "⏭️  Skipping serve image $image_name (disabled)"
    i=$((i + 1))
    continue
  fi

  dockerfile_path=$(yq eval ".serve-images[$i].dockerfile-path" "$YAML_FILE")
  echo ">>> Building serve runtime image: $image_name"
  sh deployer/scripts/ray-image-builder.sh -n "$image_name" -p "$dockerfile_path" -r "$DOCKER_REGISTRY"
  i=$((i + 1))
done

# ============================================================================
# PULL/PUSH DATASTORE IMAGES TO LOCAL REGISTRY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "              PULLING DATASTORE IMAGES TO LOCAL REGISTRY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to pull, tag, and push datastore image to local registry
push_datastore_image() {
  local name=$1
  local image=$2
  local tag=$3
  local full_image="${image}:${tag}"
  local local_image="${DOCKER_REGISTRY}/${image}:${tag}"

  echo ">>> Processing datastore: $name ($full_image)"

  # Pull from public registry
  echo "    Pulling $full_image..."
  if docker pull "$full_image"; then
    echo "    ✅ Pulled $full_image"
  else
    echo "    ❌ Failed to pull $full_image"
    return 1
  fi

  # Tag for local registry
  echo "    Tagging as $local_image..."
  docker tag "$full_image" "$local_image"

  # Push to local registry
  echo "    Pushing to local registry..."
  if docker push "$local_image"; then
    echo "    ✅ Pushed $local_image"
  else
    echo "    ❌ Failed to push $local_image"
    return 1
  fi

  echo ">>> Completed $name"
  echo ""
}

# Loop through datastores defined in services.yaml
datastore_count=$(yq eval '.datastores | length' "$YAML_FILE")
if [ "$datastore_count" != "0" ] && [ "$datastore_count" != "null" ]; then
  i=0
  while [ $i -lt $datastore_count ]; do
    ds_name=$(yq eval ".datastores[$i].name" "$YAML_FILE")
    ds_image=$(yq eval ".datastores[$i].image" "$YAML_FILE")
    ds_tag=$(yq eval ".datastores[$i].tag" "$YAML_FILE")

    # Check enabled status from .setup/enabled-services.yaml
    is_enabled=$(yq eval ".datastores.\"$ds_name\"" "$ENABLED_FILE")
    if [ "$is_enabled" != "true" ]; then
      echo "⏭️  Skipping datastore $ds_name (disabled)"
      i=$((i + 1))
      continue
    fi

    push_datastore_image "$ds_name" "$ds_image" "$ds_tag"

    i=$((i + 1))
  done
else
  echo "⚠️  No datastores defined in services.yaml"
fi

# ============================================================================
# PULL/PUSH OPERATOR IMAGES TO LOCAL REGISTRY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "              PULLING OPERATOR IMAGES TO LOCAL REGISTRY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to pull, tag, and push operator image to local registry
push_operator_image() {
  local name=$1
  local image=$2
  local tag=$3
  local full_image="${image}:${tag}"
  local local_image="${DOCKER_REGISTRY}/${image}:${tag}"

  echo ">>> Processing operator: $name ($full_image)"

  # Pull from public registry
  echo "    Pulling $full_image..."
  if docker pull "$full_image"; then
    echo "    ✅ Pulled $full_image"
  else
    echo "    ❌ Failed to pull $full_image"
    return 1
  fi

  # Tag for local registry
  echo "    Tagging as $local_image..."
  docker tag "$full_image" "$local_image"

  # Push to local registry
  echo "    Pushing to local registry..."
  if docker push "$local_image"; then
    echo "    ✅ Pushed $local_image"
  else
    echo "    ❌ Failed to push $local_image"
    return 1
  fi

  echo ">>> Completed $name"
  echo ""
}

# Loop through operators defined in services.yaml (always enabled - no config check)
operator_count=$(yq eval '.operators | length' "$YAML_FILE")
if [ "$operator_count" != "0" ] && [ "$operator_count" != "null" ]; then
  i=0
  while [ $i -lt $operator_count ]; do
    op_name=$(yq eval ".operators[$i].name" "$YAML_FILE")
    op_image=$(yq eval ".operators[$i].image" "$YAML_FILE")
    op_tag=$(yq eval ".operators[$i].tag" "$YAML_FILE")
    op_enabled=$(yq eval ".operators[$i].enabled" "$YAML_FILE")

    # Operators are always pulled if enabled in services.yaml (no user config check)
    if [ "$op_enabled" != "true" ]; then
      echo "⏭️  Skipping operator $op_name (disabled in services.yaml)"
      i=$((i + 1))
      continue
    fi

    push_operator_image "$op_name" "$op_image" "$op_tag"

    i=$((i + 1))
  done
else
  echo "⚠️  No operators defined in services.yaml"
fi

echo ""
echo "✅ Setup completed!"
