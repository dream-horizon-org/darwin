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

# ============================================================================
# CLI TOOLS SETUP
# ============================================================================
# Check if hermes-cli is enabled and install if needed
HERMES_CLI_ENABLED=$(yq eval '.cli-tools.hermes-cli // false' "$ENABLED_SERVICES_FILE" 2>/dev/null || echo "false")

if [ "$HERMES_CLI_ENABLED" = "true" ]; then
  echo ""
  echo "📦 Setting up hermes-cli..."
  
  HERMES_CLI_PATH="hermes-cli"
  if [ ! -d "$HERMES_CLI_PATH" ]; then
    echo "   ⚠️  hermes-cli directory not found at $HERMES_CLI_PATH, skipping..."
  else
    VENV_PATH="$HERMES_CLI_PATH/.venv"
    
    # Create venv if it doesn't exist
    if [ ! -d "$VENV_PATH" ]; then
      echo "   Creating virtual environment..."
      python3.9 -m venv "$VENV_PATH"
    fi

    # Install hermes-cli
    echo "   Installing hermes-cli package..."
    (
      cd "$HERMES_CLI_PATH" && source .venv/bin/activate && pip install -e . --force-reinstall --no-cache-dir
    )

    if [ $? -eq 0 ]; then
      echo "   ✅ hermes-cli installed successfully"
      echo "   To use: source $HERMES_CLI_PATH/.venv/bin/activate"
    else
      echo "   ❌ Failed to install hermes-cli"
    fi
  fi
  echo ""
fi

# Source the config.env file
set -o allexport
. config.env
set +o allexport

echo "🔧 Setting up KUBECONFIG: $KUBECONFIG"

# Verify cluster connectivity
if kubectl version >/dev/null 2>&1; then
  echo "✅ Cluster is accessible"
  kubectl get nodes
else
  echo "❌ Cluster is not reachable. Please run setup.sh first."
  exit 1
fi

echo "⚙️  Setting up Kubernetes dependencies..."
./k8s-setup.sh

echo "🚀 Starting Darwin Platform deployment..."

# ============================================================================
# BUILD HELM OVERRIDES FROM CONFIG
# ============================================================================
echo "📋 Reading service configuration..."

HELM_OVERRIDES=""

# Function to map application name to helm path
get_helm_path() {
  local app_name="$1"
  case "$app_name" in
    "darwin-ofs-v2") echo "services.services.feature-store.enabled" ;;
    "darwin-ofs-v2-admin") echo "services.services.feature-store-admin.enabled" ;;
    "darwin-ofs-v2-consumer") echo "services.services.feature-store-consumer.enabled" ;;
    "darwin-mlflow") echo "services.services.mlflow-lib.enabled" ;;
    "darwin-mlflow-app") echo "services.services.mlflow-app.enabled" ;;
    "chronos") echo "services.services.chronos.enabled" ;;
    "chronos-consumer") echo "services.services.chronos-consumer.enabled" ;;
    "darwin-compute") echo "services.services.compute.enabled" ;;
    "darwin-cluster-manager") echo "services.services.cluster-manager.enabled" ;;
    "darwin-workspace") echo "services.services.workspace.enabled" ;;
    "darwin-workflow") echo "services.services.workflow.enabled" ;;
    "ml-serve-app") echo "services.services.ml-serve-app.enabled" ;;
    "artifact-builder") echo "services.services.artifact-builder.enabled" ;;
    "darwin-catalog") echo "services.services.catalog.enabled" ;;
    *) echo "" ;;
  esac
}

# Read applications from config and build --set flags
echo "   Processing applications..."
for app_name in $(yq eval '.applications | keys | .[]' "$ENABLED_SERVICES_FILE"); do
  enabled=$(yq eval ".applications.\"$app_name\"" "$ENABLED_SERVICES_FILE")
  helm_path=$(get_helm_path "$app_name")
  
  if [ -n "$helm_path" ]; then
    HELM_OVERRIDES="$HELM_OVERRIDES --set $helm_path=$enabled"
    echo "     $app_name -> $helm_path=$enabled"
  fi
done

# Read datastores from config and build --set flags (direct mapping)
echo "   Processing datastores..."
for ds_name in $(yq eval '.datastores | keys | .[]' "$ENABLED_SERVICES_FILE"); do
  enabled=$(yq eval ".datastores.\"$ds_name\"" "$ENABLED_SERVICES_FILE")
  
  # Skip busybox - it's not a helm-managed datastore
  if [ "$ds_name" = "busybox" ]; then
    continue
  fi
  
  helm_path="datastores.$ds_name.enabled"
  HELM_OVERRIDES="$HELM_OVERRIDES --set $helm_path=$enabled"
  echo "     $ds_name -> $helm_path=$enabled"
done

echo ""
echo "📦 Installing Darwin Platform with configuration overrides..."

# Install Darwin Platform umbrella chart with overrides
helm upgrade --install darwin ./helm/darwin \
  --namespace darwin \
  --create-namespace \
  --wait \
  --timeout 600s \
  $HELM_OVERRIDES

echo "✅ Deployment completed!"

# ============================================================================
# REGISTER DARWIN SDK RUNTIME
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "               REGISTERING DARWIN SDK RUNTIME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if BOTH darwin-sdk-runtime AND darwin-compute are enabled
SDK_ENABLED=$(yq eval '.darwin-sdk-runtime.enabled // false' "$ENABLED_SERVICES_FILE")
COMPUTE_ENABLED=$(yq eval '.applications.darwin-compute // false' "$ENABLED_SERVICES_FILE")

if [ "$SDK_ENABLED" = "true" ] && [ "$COMPUTE_ENABLED" = "true" ]; then
  echo "📦 Registering darwin-sdk runtime as '1.0'..."
  
  # Wait for darwin-compute to be ready via ingress
  echo "   Waiting for darwin-compute to be ready..."
  sleep 5
  
  # Register the runtime via ingress (localhost/compute)
  RESPONSE=$(curl -s -X POST http://localhost/compute/runtime/v2/create \
    -H "Content-Type: application/json" \
    -d '{
      "runtime": "1.0",
      "class": "CPU",
      "type": "Ray and Spark",
      "image": "localhost:5000/ray:2.37.0-darwin-sdk",
      "user": "Darwin",
      "spark_connect": false,
      "spark_auto_init": true
    }')
  
  # Check response
  if echo "$RESPONSE" | grep -q '"status":"SUCCESS"'; then
    echo "   ✅ Darwin SDK runtime '1.0' registered successfully"
  else
    echo "   ⚠️  Runtime registration response: $RESPONSE"
  fi
elif [ "$SDK_ENABLED" != "true" ]; then
  echo "⏭️  Skipping darwin-sdk runtime registration (darwin-sdk-runtime disabled)"
else
  echo "⏭️  Skipping darwin-sdk runtime registration (darwin-compute disabled)"
fi

# Show hermes-cli activation reminder if it was installed
HERMES_CLI_ENABLED=$(yq eval '.cli-tools.hermes-cli // false' "$ENABLED_SERVICES_FILE" 2>/dev/null || echo "false")
if [ "$HERMES_CLI_ENABLED" = "true" ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 To use hermes-cli, activate the virtual environment:"
  echo ""
  echo "   source hermes-cli/.venv/bin/activate"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
