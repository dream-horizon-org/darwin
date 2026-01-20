#!/bin/sh
set -e

# Get the project root directory (same as setup.sh and start-cluster.sh)
# This ensures config.env is always read from the same location
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

# Source the config.env file
if [ ! -f "$CONFIG_ENV" ]; then
    echo "❌ config.env not found at $CONFIG_ENV"
    echo "   Please run ./setup.sh first to create config.env"
    exit 1
fi
set -o allexport
. "$CONFIG_ENV"
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
echo "   Deploying helm chart (with --wait for all pods)..."
echo "   This may take several minutes..."
helm upgrade --install darwin ./helm/darwin \
  --namespace darwin \
  --create-namespace \
  --wait \
  --timeout 600s \
  $HELM_OVERRIDES
HELM_EXIT_CODE=$?

if [ $HELM_EXIT_CODE -ne 0 ]; then
  echo "❌ Helm deployment failed with exit code $HELM_EXIT_CODE!"
  echo ""
  echo "Checking deployment status..."
  helm status darwin -n darwin 2>/dev/null || echo "   (helm release not found)"
  echo ""
  echo "Checking pods..."
  kubectl get pods -n darwin 2>/dev/null || echo "   (no pods found)"
  echo ""
  echo "Checking helm release history..."
  helm history darwin -n darwin 2>/dev/null || echo "   (no history found)"
  exit 1
fi

echo "✅ Helm chart deployed (all pods ready via --wait)"

# ============================================================================
# UPLOAD KUBECONFIG TO S3 (for darwin-cluster-manager)
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "               UPLOADING KUBECONFIG TO S3"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if both localstack and darwin-cluster-manager are enabled
LOCALSTACK_ENABLED=$(yq eval '.datastores.localstack // false' "$ENABLED_SERVICES_FILE")
CLUSTER_MANAGER_ENABLED=$(yq eval '.applications.darwin-cluster-manager // false' "$ENABLED_SERVICES_FILE")

if [ "$LOCALSTACK_ENABLED" = "true" ] && [ "$CLUSTER_MANAGER_ENABLED" = "true" ]; then
  
  if [ -f "$KUBECONFIG" ]; then
    echo "📦 Uploading kubeconfig to S3 for darwin-cluster-manager..."
    
    # Create a temporary file with the server address updated for in-cluster use
    KUBECONFIG_TEMP=$(mktemp)
    cp "$KUBECONFIG" "$KUBECONFIG_TEMP"
    
    # Update the server address to use in-cluster DNS name
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's|server: https://127\.0\.0\.1:[0-9]*|server: https://kubernetes.default.svc|' "$KUBECONFIG_TEMP"
    else
      sed -i 's|server: https://127\.0\.0\.1:[0-9]*|server: https://kubernetes.default.svc|' "$KUBECONFIG_TEMP"
    fi
    
    # Wait for LocalStack to be accessible via port-forward
    echo "   Setting up port-forward to LocalStack..."
    kubectl port-forward svc/darwin-localstack -n darwin 4566:4566 &
    PF_PID=$!
    sleep 3
    
    # Upload to S3 using AWS CLI
    set +e
    AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws s3 \
      --endpoint-url=http://localhost:4566 \
      cp "$KUBECONFIG_TEMP" s3://darwin/mlp/cluster_manager/configs/kind 2>&1
    UPLOAD_EXIT_CODE=$?
    set -e
    
    # Cleanup
    kill $PF_PID 2>/dev/null || true
    rm -f "$KUBECONFIG_TEMP"
    
    if [ $UPLOAD_EXIT_CODE -eq 0 ]; then
      echo "✅ Kubeconfig uploaded to S3 successfully"
    else
      echo "❌ Failed to upload kubeconfig to S3 (exit code: $UPLOAD_EXIT_CODE)"
      echo "⚠️ darwin-cluster-manager may not be able to access kubeconfig"
    fi
  else
    echo "⚠️  Kubeconfig not found at $KUBECONFIG"
    echo "   darwin-cluster-manager may not work correctly"
  fi
else
  if [ "$LOCALSTACK_ENABLED" != "true" ]; then
    echo "⏭️  Skipping kubeconfig upload (LocalStack disabled)"
  else
    echo "⏭️  Skipping kubeconfig upload (darwin-cluster-manager disabled)"
  fi
fi

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
  # Add timeout to prevent hanging in CI
  set +e
  RESPONSE=$(curl -s --max-time 30 -X POST http://localhost/compute/runtime/v2/create \
    -H "Content-Type: application/json" \
    -d '{
      "runtime": "1.0",
      "class": "CPU",
      "type": "Ray and Spark",
      "image": "localhost:5000/ray:2.37.0-darwin-sdk",
      "user": "Darwin",
      "spark_connect": false,
      "spark_auto_init": true
    }' 2>&1)
  CURL_EXIT_CODE=$?
  set -e
  
  # Check response
  if [ $CURL_EXIT_CODE -eq 0 ] && echo "$RESPONSE" | grep -q '"status":"SUCCESS"'; then
    echo "   ✅ Darwin SDK runtime '1.0' registered successfully"
  else
    echo "   ⚠️  Runtime registration failed or incomplete (curl exit: $CURL_EXIT_CODE)"
    echo "   ⚠️  Response: $RESPONSE"
    echo "   ⚠️  This is non-critical, continuing..."
  fi
elif [ "$SDK_ENABLED" != "true" ]; then
  echo "⏭️  Skipping darwin-sdk runtime registration (darwin-sdk-runtime disabled)"
else
  echo "⏭️  Skipping darwin-sdk runtime registration (darwin-compute disabled)"
fi

# Show darwin-cli activation reminder if it was installed
DARWIN_CLI_ENABLED=$(yq eval '.cli-tools.darwin-cli // false' "$ENABLED_SERVICES_FILE" 2>/dev/null || echo "false")
if [ "$DARWIN_CLI_ENABLED" = "true" ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "                       DARWIN CLI"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  darwin-cli was installed during setup.sh"
  echo ""
  echo "  To activate and use darwin-cli:"
  echo ""
  echo "    1. Activate the virtual environment:"
  echo "       source .venv/bin/activate"
  echo ""
  echo "    2. Configure the environment (first time only):"
  echo "       darwin config set --env darwin-local"
  echo ""
  echo "    3. Verify installation:"
  echo "       darwin --help"
  echo ""
  echo "  Example commands:"
  echo "    darwin compute list"
  echo "    darwin workflow list"
  echo "    darwin serve list"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
