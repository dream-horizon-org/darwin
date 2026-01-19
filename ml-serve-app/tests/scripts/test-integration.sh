#!/bin/bash
# Run integration tests for ml-serve-app

set -e

# Config
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ML_SERVE_APP_ROOT="$( cd "${SCRIPT_DIR}/../.." && pwd )"
PROJECT_ROOT="$( cd "${ML_SERVE_APP_ROOT}/.." && pwd )"
export KUBECONFIG="${KUBECONFIG:-${PROJECT_ROOT}/.setup/kindkubeconfig.yaml}"

echo -e "${GREEN}🧪 Running Integration Tests${NC}"

# Checks
! kubectl cluster-info &>/dev/null && { echo -e "${RED}❌ Cluster not running${NC}"; exit 1; }
! "${PROJECT_ROOT}/scripts/check-services.sh" ml-serve-app && { echo -e "${RED}❌ Services unhealthy${NC}"; exit 1; }

# Setup Auth & Dir
export TEST_AUTH_TOKEN="${TEST_AUTH_TOKEN:-admin-token-default-change-in-production}"
export MLFLOW_URI="${MLFLOW_URI:-http://localhost/mlflow-lib}"
cd "${ML_SERVE_APP_ROOT}"

# Setup venv
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Creating venv...${NC}"
    PYTHON_CMD=$(command -v python3.9 || command -v python3.10 || command -v python3 || { echo -e "${RED}Python 3.9+ missing${NC}"; exit 1; })
    $PYTHON_CMD -m venv .venv
    source .venv/bin/activate
    pip install -q --upgrade pip
    for dir in model core app_layer; do
        if [ "$dir" = "app_layer" ]; then
            (cd $dir && pip install -q -e .[testing])
        else
            (cd $dir && pip install -q -e .)
        fi
    done
else
    source .venv/bin/activate
fi

# Run Tests
echo -e "\n${YELLOW}🏃 Running integration tests...${NC}\n"
pytest tests/integration/ -v --tb=short --color=yes -m "integration" -s "$@"
EXIT_CODE=$?

[ $EXIT_CODE -eq 0 ] && echo -e "\n${GREEN}✅ Passed!${NC}" || echo -e "\n${RED}❌ Failed${NC}"
exit $EXIT_CODE
