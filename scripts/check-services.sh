#!/bin/bash
# Check if required services are running based on service-dependencies.yaml
# Usage: ./scripts/check-services.sh <service-name>
# Example: ./scripts/check-services.sh ml-serve-app

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "${SCRIPT_DIR}/.." && pwd )"
KUBECONFIG="${KUBECONFIG:-${PROJECT_ROOT}/kind/config/kindkubeconfig.yaml}"
DEPENDENCY_FILE="${PROJECT_ROOT}/service-dependencies.yaml"
SERVICE_NAME="${1}"

# Prerequisites
command -v yq &> /dev/null || { echo -e "${RED}❌ yq is required${NC}"; exit 1; }
[ -f "$DEPENDENCY_FILE" ] || { echo -e "${RED}❌ Dependency file missing${NC}"; exit 1; }
[ -z "$SERVICE_NAME" ] && { echo -e "${RED}❌ Usage: $0 <service-name>${NC}"; exit 1; }

echo -e "${BLUE}🔍 Checking Dependencies for: ${SERVICE_NAME}${NC}\n"

# Verify service exists in dependencies
if ! yq eval ".services.\"${SERVICE_NAME}\"" "$DEPENDENCY_FILE" | grep -q "required_datastores"; then
    echo -e "${RED}❌ Service '${SERVICE_NAME}' not found${NC}"
    echo -e "Available services:"
    yq eval '.services | keys | .[]' "$DEPENDENCY_FILE"
    exit 1
fi

REQUIRED_DATASTORES=$(yq eval ".services.\"${SERVICE_NAME}\".required_datastores[]" "$DEPENDENCY_FILE" 2>/dev/null)
REQUIRED_SERVICES=$(yq eval ".services.\"${SERVICE_NAME}\".required_services[]" "$DEPENDENCY_FILE" 2>/dev/null)
FAILED_DEPS=()

# Helper to get deployment name
get_deployment_name() {
    case "$1" in
        "darwin-ofs-v2") echo "darwin-feature-store" ;;
        "darwin-ofs-v2-admin") echo "darwin-feature-store-admin" ;;
        "darwin-ofs-v2-consumer") echo "darwin-feature-store-consumer" ;;
        "darwin-mlflow") echo "darwin-mlflow-lib" ;;
        "darwin-mlflow-app") echo "darwin-mlflow-lib" ;;
        "chronos") echo "darwin-chronos" ;;
        "chronos-consumer") echo "darwin-chronos-consumer" ;;
        "darwin-compute") echo "darwin-compute" ;;
        "darwin-cluster-manager") echo "darwin-cluster-manager" ;;
        "darwin-workspace") echo "darwin-workspace" ;;
        "darwin-workflow") echo "darwin-workflow" ;;
        "ml-serve-app") echo "darwin-ml-serve-app" ;;
        "artifact-builder") echo "darwin-artifact-builder" ;;
        "darwin-catalog") echo "darwin-catalog" ;;
        *) [[ "$1" == darwin-* ]] && echo "$1" || echo "darwin-$1" ;;
    esac
}

check_health() {
    local type=$1 name=$2 label=$3
    echo -en "${YELLOW}⏳ Checking $type: $name...${NC}"
    
    if kubectl --kubeconfig="$KUBECONFIG" get pods -n darwin -l "$label" 2>/dev/null | grep -q "Running"; then
        echo -e "\r${GREEN}✅ $name: Running${NC}"
        return 0
    fi
    echo -e "\r${RED}❌ $name: Not running${NC}"
    FAILED_DEPS+=("$type:$name")
    return 1
}

check_service() {
    local service=$1
    echo -en "${YELLOW}⏳ Checking service: $service...${NC}"
    local deploy_name=$(get_deployment_name "$service")
    
    local replicas=$(kubectl --kubeconfig="$KUBECONFIG" get deployment "$deploy_name" -n darwin -o jsonpath='{.status.readyReplicas}/{.status.replicas}' 2>/dev/null)
    if [[ "$replicas" =~ ^[1-9][0-9]*/[1-9][0-9]*$ ]]; then
        echo -e "\r${GREEN}✅ $service: Running ($replicas replicas)${NC}"
            return 0
    fi
    echo -e "\r${RED}❌ $service: Not ready ($replicas)${NC}"
    FAILED_DEPS+=("service:$service")
            return 1
}

# Check Datastores
[ -n "$REQUIRED_DATASTORES" ] && echo -e "${BLUE}Required Datastores:${NC}"
for ds in $REQUIRED_DATASTORES; do
    [ "$ds" = "busybox" ] && continue
    check_health "datastore" "$ds" "app.kubernetes.io/component=$ds"
    done
[ -n "$REQUIRED_DATASTORES" ] && echo ""

# Check Services
[ -n "$REQUIRED_SERVICES" ] && echo -e "${BLUE}Required Services:${NC}"
for svc in $REQUIRED_SERVICES; do
    check_service "$svc"
    done
[ -n "$REQUIRED_SERVICES" ] && echo ""

# Check Target
echo -e "${BLUE}Target Service:${NC}"
check_service "$SERVICE_NAME"
echo ""

# Summary
if [ ${#FAILED_DEPS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All dependencies healthy!${NC}\n"
    exit 0
fi

echo -e "${RED}❌ Unhealthy dependencies:${NC}"
for dep in "${FAILED_DEPS[@]}"; do echo -e "  ${RED}• $dep${NC}"; done
echo -e "\n${YELLOW}💡 Fixes:${NC}"
echo "  Datastores: kubectl delete pod -n darwin -l app.kubernetes.io/component=<name>"
echo "  Services:   ./scripts/fast-redeploy.sh <service_name> OR kubectl rollout restart deployment <deploy_name> -n darwin"
exit 1
