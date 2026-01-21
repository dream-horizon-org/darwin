#!/bin/bash
set -e

# Get the project root directory (same as start-cluster.sh does)
# This ensures config.env is always written to the same location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
CONFIG_ENV="$PROJECT_ROOT/.setup/config.env"

# Check for init configuration
ENABLED_SERVICES_FILE=".setup/enabled-services.yaml"
if [ ! -f "$ENABLED_SERVICES_FILE" ]; then
    echo "❌ No configuration found at $ENABLED_SERVICES_FILE"
    echo "   Please run ./init.sh first to configure which services to enable."
    exit 1
fi
echo "✅ Found configuration: $ENABLED_SERVICES_FILE"

# Parse command line arguments
AUTO_YES=false
FORCE_CLEAN=false
while [ $# -gt 0 ]; do
  case "$1" in
    -y|--yes)
      AUTO_YES=true
      shift
      ;;
    -c|--clean)
      FORCE_CLEAN=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -y, --yes     Auto-answer 'yes' to all prompts (non-interactive mode)"
      echo "  -c, --clean   Force clean setup (deletes existing cluster and data)"
      echo "  -h, --help    Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0              # Interactive mode"
      echo "  $0 -y           # Non-interactive, keep existing data"
      echo "  $0 -y --clean   # Non-interactive, clean install"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [-y|--yes] [-c|--clean] [-h|--help]"
      exit 1
      ;;
  esac
done

echo '' > "$CONFIG_ENV"

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

# Set default KUBECONFIG path
KUBECONFIG=./.setup/kindkubeconfig.yaml

ensure_docker_api_version

# Function to clean up existing Kind cluster and shared storage
clean_kind_setup() {
    echo "🧹 Cleaning up existing Kind setup..."
    
    # Delete Kind cluster if it exists
    if kind get clusters 2>/dev/null | grep -q "^kind$"; then
        echo "🛑 Deleting existing kind cluster..."
        kind delete cluster --name kind
        echo "✅ Kind cluster deleted"
    fi
    
    # Delete shared-storage folder
    if [ -d "kind/shared-storage" ]; then
        echo "🧹 Deleting kind/shared-storage/..."
        rm -rf kind/shared-storage
        echo "✅ Shared storage deleted"
    fi
    
    # Delete kubeconfig
    if [ -f ".setup/kindkubeconfig.yaml" ]; then
        rm -f .setup/kindkubeconfig.yaml
        echo "✅ Kubeconfig deleted"
    fi
    
    echo "✅ Clean up complete"
}

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
        # Ask if user wants a clean setup (or force clean if --clean flag passed)
        if [ "$FORCE_CLEAN" = "true" ]; then
            CLEAN_REPLY="y"
            echo "🧹 Clean setup requested via --clean flag"
        elif [ "$AUTO_YES" = "true" ]; then
            CLEAN_REPLY="n"
            echo "Auto-answering 'no' to clean setup (use --clean flag to force clean)"
        else
            echo ""
            read -p "Do you want a clean setup? (deletes existing cluster and data) (y/n) " -n 1 -r CLEAN_REPLY
        fi
        if [[ $CLEAN_REPLY =~ ^[Yy]$ ]]; then
            echo ""
            clean_kind_setup
        fi
        
        echo -e "\n🚀 Starting kind cluster..."

        envsubst < ./kind/kind-config.yaml > ./kind/kind-config-tmp.yaml
        
        export CLUSTER_NAME=kind
        export KIND_CONFIG=./kind/kind-config-tmp.yaml
        export KUBECONFIG=./.setup/kindkubeconfig.yaml
        
        sh ./kind/start-cluster.sh
        ENV_CREATION=true
        
        rm ./kind/kind-config-tmp.yaml
    else
        echo -e "\n🔄 Skipping kind cluster setup"
        echo "DOCKER_REGISTRY=docker.io" >> "$CONFIG_ENV"
    fi
else
    echo "ENV is not set to 'local' (current value: '$ENV'), skipping local k8s cluster setup"
fi

# check if kube config file exists and is reachable
if [ ! -f "$KUBECONFIG" ]; then
    echo "❌ KUBECONFIG file does not exist at $KUBECONFIG"
    echo "   Cluster may not have been created. Please ensure cluster setup completed successfully."
    exit 1
else
    echo "KUBECONFIG=$KUBECONFIG" >> "$CONFIG_ENV"
    source "$CONFIG_ENV"
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
    echo -e "\n🔄 Skipping build. Exiting."
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
# BUILD DARWIN SDK RUNTIME IMAGE
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                 BUILDING DARWIN SDK RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if darwin-sdk-runtime is enabled
sdk_enabled=$(yq eval '.darwin-sdk-runtime.enabled' "$ENABLED_FILE")
if [ "$sdk_enabled" = "true" ]; then
  sdk_image=$(yq eval '.darwin-sdk-runtime.image-name' "$YAML_FILE")
  sdk_spark_version=$(yq eval '.darwin-sdk-runtime.spark-version' "$YAML_FILE")
  sdk_registry=$(yq eval '.darwin-sdk-runtime.registry' "$YAML_FILE")
  
  # Use local registry if configured
  if [ -n "$DOCKER_REGISTRY" ]; then
    sdk_registry="$DOCKER_REGISTRY"
  fi
  
  # Extract tag from image name (e.g., ray:2.37.0-darwin-sdk -> 2.37.0-darwin-sdk)
  sdk_tag="${sdk_image#*:}"
  
  echo ">>> Building Darwin SDK runtime image: $sdk_image"
  echo "    Spark version: $sdk_spark_version"
  echo "    Registry: $sdk_registry"
  
  # Check if runtime_builder.sh exists
  if [ -f "darwin-sdk/runtime_builder.sh" ]; then
    bash darwin-sdk/runtime_builder.sh \
      --spark-version "$sdk_spark_version" \
      --tag "$sdk_tag" \
      --registry "$sdk_registry" \
      --push
    echo "✅ Darwin SDK runtime built and pushed: ${sdk_registry}/ray:${sdk_tag}"
  else
    echo "❌ darwin-sdk/runtime_builder.sh not found"
    echo "   Skipping Darwin SDK runtime build"
  fi
else
  echo "⏭️  Skipping Darwin SDK runtime (disabled)"
fi

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
# BUILD AIRFLOW IMAGE (if airflow datastore is enabled)
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    BUILDING AIRFLOW IMAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if airflow is enabled
airflow_enabled=$(yq eval '.datastores.airflow' "$ENABLED_FILE")
if [ "$airflow_enabled" = "true" ]; then
  echo ">>> Building darwin-airflow image..."
  
  # Build airflow image using existing script
  if [ -f "darwin-workflow/build-airflow-image.sh" ]; then
    cd darwin-workflow
    bash build-airflow-image.sh || {
      echo "❌ Failed to build darwin-airflow image"
      exit 1
    }
    cd ..
    
    # Load into Kind cluster (required for imagePullPolicy: Never)
    echo ">>> Loading darwin-airflow image into Kind cluster..."
    kind load docker-image darwin-airflow:latest || {
      echo "❌ Failed to load darwin-airflow image into Kind"
      exit 1
    }
    echo "✅ darwin-airflow image built and loaded into Kind"
  else
    echo "❌ darwin-workflow/build-airflow-image.sh not found"
    exit 1
  fi
else
  echo "⏭️  Skipping darwin-airflow image (airflow datastore disabled)"
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

# ============================================================================
# SETUP DARWIN CLI
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    SETTING UP DARWIN CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if darwin-cli is enabled
DARWIN_CLI_ENABLED=$(yq eval '.cli-tools.darwin-cli // false' "$ENABLED_FILE" 2>/dev/null || echo "false")

if [ "$DARWIN_CLI_ENABLED" = "true" ]; then
  DARWIN_CLI_PATH="darwin-cli"
  if [ ! -d "$DARWIN_CLI_PATH" ]; then
    echo "   ⚠️  darwin-cli directory not found at $DARWIN_CLI_PATH, skipping..."
  else
    VENV_PATH=".venv"
    
    # Check if python3.9 exists and is version 3.9.7+
    if command -v python3.9 &> /dev/null; then
      if python3.9 -c "import sys; exit(0 if sys.version_info >= (3, 9, 7) else 1)" 2>/dev/null; then
        PYTHON_CMD="python3.9"
        echo "   ✅ Found Python 3.9.7+"
      else
        echo "   ❌ python3.9 found but version < 3.9.7"
        echo "   Install: sudo apt-get install python3.9  # Ubuntu/Debian"
        echo "            brew install python@3.9         # macOS"
        DARWIN_CLI_ENABLED="false"
      fi
    else
      echo "   ❌ python3.9 not found (darwin-cli requires Python 3.9.7+)"
      echo "   Install: sudo apt-get install python3.9  # Ubuntu/Debian"
      echo "            brew install python@3.9         # macOS"
      DARWIN_CLI_ENABLED="false"
    fi
  fi
  
  if [ "$DARWIN_CLI_ENABLED" = "true" ]; then
  
    # Create venv if it doesn't exist
    if [ ! -d "$VENV_PATH" ]; then
      echo "   Creating virtual environment with $PYTHON_CMD..."
      $PYTHON_CMD -m venv "$VENV_PATH"
      if [ $? -ne 0 ]; then
        echo "   ❌ Failed to create virtual environment"
        exit 1
      fi
    fi

    # Install darwin-cli
    echo "   Installing darwin-cli package..."
    (
      set -e
      source "$VENV_PATH/bin/activate" && \
      pip install --upgrade pip --quiet && \
      cd "$DARWIN_CLI_PATH" && \
      rm -rf dist/ build/ *.egg-info && \
      python setup.py sdist && \
      TARBALL=$(ls dist/*.tar.gz 2>/dev/null | head -1) && \
      if [ -z "$TARBALL" ]; then
        echo "   ❌ No tarball found in dist/"
        exit 1
      fi && \
      pip install "$TARBALL" --force-reinstall --quiet
    )

    if [ $? -eq 0 ]; then
      echo "   ✅ darwin-cli installed successfully"
    else
      echo "   ❌ Failed to install darwin-cli"
      echo "   Check the error above for details"
      exit 1
    fi
  fi
else
  echo "⏭️  Skipping darwin-cli setup (disabled in configuration)"
fi

echo ""
echo "✅ Setup completed!"
