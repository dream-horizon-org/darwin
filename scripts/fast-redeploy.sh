#!/bin/bash
# Fast redeploy script for Darwin services
# Usage: ./scripts/fast-redeploy.sh <service-name1> [service-name2 ...]

set -e

# Config
NAMESPACE="${NAMESPACE:-darwin}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "${SCRIPT_DIR}/.." && pwd )"
KUBECONFIG="${KUBECONFIG:-${PROJECT_ROOT}/kind/config/kindkubeconfig.yaml}"
SERVICES_YAML="${PROJECT_ROOT}/services.yaml"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

# Checks
[ $# -eq 0 ] && { echo -e "${RED}Usage: $0 <service-name>...${NC}"; exit 1; }
[ -f "${PROJECT_ROOT}/config.env" ] && source "${PROJECT_ROOT}/config.env"
command -v yq >/dev/null || { echo -e "${RED}Missing yq${NC}"; exit 1; }
command -v docker >/dev/null || { echo -e "${RED}Missing docker${NC}"; exit 1; }
kubectl --kubeconfig="$KUBECONFIG" cluster-info >/dev/null 2>&1 || { echo -e "${RED}Cluster unreachable${NC}"; exit 1; }
[ -f "$SERVICES_YAML" ] || { echo -e "${RED}Missing services.yaml${NC}"; exit 1; }

cd "$PROJECT_ROOT"
SERVICES=("$@")
FAILURES=()

echo -e "${GREEN}Redeploying: ${SERVICES[*]}${NC}"

# 1. Build Images
for SVC in "${SERVICES[@]}"; do
    echo -e "Processing: ${YELLOW}$SVC${NC}"
    APP_CONFIG=$(yq eval ".applications[] | select(.application == \"$SVC\")" "$SERVICES_YAML")
    
    if [ -z "$APP_CONFIG" ]; then
        echo -e "${RED}Service '$SVC' not found${NC}"; FAILURES+=("$SVC"); continue
    fi

    # Parse config
    BASE_PATH=$(echo "$APP_CONFIG" | yq eval '.base-path' -)
    PATH_DIR=$(echo "$APP_CONFIG" | yq eval '.path' -)
    BASE_IMAGE=$(echo "$APP_CONFIG" | yq eval '.base-image' -)
    
    # Parse env vars
    BUILD_ARGS=""
    ENV_VARS=$(echo "$APP_CONFIG" | yq eval '.env' -)
    if [ "$ENV_VARS" != "[]" ] && [ "$ENV_VARS" != "null" ]; then
        LEN=$(echo "$APP_CONFIG" | yq eval '.env | length' -)
        for (( i=0; i<$LEN; i++ )); do
            KEY=$(echo "$APP_CONFIG" | yq eval ".env[$i].name" -)
            VAL=$(echo "$APP_CONFIG" | yq eval ".env[$i].value" -)
            BUILD_ARGS="${BUILD_ARGS}|${KEY}=${VAL}"
        done
    fi

    echo "Building $SVC..."
    if ! sh deployer/scripts/image-builder.sh -a "$SVC" -t "$BASE_PATH" -p "$PATH_DIR" -e "$BASE_IMAGE" -r "$DOCKER_REGISTRY" -B "$BUILD_ARGS"; then
        echo -e "${RED}Build failed: $SVC${NC}"; FAILURES+=("$SVC")
    else
        echo -e "${GREEN}Built: $SVC${NC}"
    fi
done

[ ${#FAILURES[@]} -ne 0 ] && { echo -e "${RED}Failed services: ${FAILURES[*]}${NC}"; exit 1; }

# 2. Reset Pre-deploy Job
echo "Resetting health check job..."
kubectl --kubeconfig="$KUBECONFIG" delete job "darwin-datastore-health-check" -n "$NAMESPACE" --ignore-not-found=true

# 3. Build Helm Overrides from enabled-services.yaml
ENABLED_SERVICES_FILE="${PROJECT_ROOT}/.setup/enabled-services.yaml"
HELM_OVERRIDES=""

if [ -f "$ENABLED_SERVICES_FILE" ]; then
    echo "📋 Reading service configuration from $ENABLED_SERVICES_FILE..."
    
    # Function to map application name to helm path (same as start.sh)
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
    for app_name in $(yq eval '.applications | keys | .[]' "$ENABLED_SERVICES_FILE" 2>/dev/null || true); do
        enabled=$(yq eval ".applications.\"$app_name\"" "$ENABLED_SERVICES_FILE" 2>/dev/null || echo "false")
        helm_path=$(get_helm_path "$app_name")
        
        if [ -n "$helm_path" ]; then
            HELM_OVERRIDES="$HELM_OVERRIDES --set $helm_path=$enabled"
        fi
    done
    
    # Read datastores from config and build --set flags
    for ds_name in $(yq eval '.datastores | keys | .[]' "$ENABLED_SERVICES_FILE" 2>/dev/null || true); do
        enabled=$(yq eval ".datastores.\"$ds_name\"" "$ENABLED_SERVICES_FILE" 2>/dev/null || echo "false")
        
        # Skip busybox - it's not a helm-managed datastore
        if [ "$ds_name" = "busybox" ]; then
            continue
        fi
        
        helm_path="datastores.$ds_name.enabled"
        HELM_OVERRIDES="$HELM_OVERRIDES --set $helm_path=$enabled"
    done
else
    echo -e "${YELLOW}⚠️  $ENABLED_SERVICES_FILE not found, using --reuse-values${NC}"
    HELM_OVERRIDES="--reuse-values"
fi

# 4. Helm Upgrade
echo "Upgrading Helm release..."
if ! helm upgrade darwin ./helm/darwin --kubeconfig "$KUBECONFIG" --namespace "$NAMESPACE" $HELM_OVERRIDES --set global.redeployTimestamp=$(date +%s) --wait --timeout 10m; then
    echo -e "${RED}Helm upgrade failed${NC}"; exit 1
fi
    
echo -e "${GREEN}Success: Redeployed ${SERVICES[*]}${NC}"
