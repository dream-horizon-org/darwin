#!/bin/bash
set -euo pipefail

# Manual smoke test for canary deployments (Flagger + Istio).
#
# Prerequisites:
#   - Darwin stack running (ml-serve-app, darwin-cluster-manager, artifact-builder, etc.)
#   - Istio installed in the target cluster
#   - Flagger installed (CRDs + controller)
#   - ml-serve-app configured with ENABLE_ISTIO=true
#
# This script is intentionally minimal and meant for interactive use.
# It does NOT assert success automatically; it prints key kubectl commands to observe rollout.

ML_SERVE_BASE_URL="${ML_SERVE_BASE_URL:-http://localhost/ml-serve}"
ENV_NAME="${ENV_NAME:-prod}"
SERVE_NAME="${SERVE_NAME:-canary-smoke-serve}"
ARTIFACT_VERSION="${ARTIFACT_VERSION:-v0.0.1}"

echo "ML_SERVE_BASE_URL=${ML_SERVE_BASE_URL}"
echo "ENV_NAME=${ENV_NAME}"
echo "SERVE_NAME=${SERVE_NAME}"
echo "ARTIFACT_VERSION=${ARTIFACT_VERSION}"
echo

echo "1) Deploy canary via ml-serve-app API"
RESP="$(curl -sS -X POST "${ML_SERVE_BASE_URL}/api/v1/serve/${SERVE_NAME}/deploy" \
  -H "Content-Type: application/json" \
  -d "{
    \"env\": \"${ENV_NAME}\",
    \"artifact_version\": \"${ARTIFACT_VERSION}\",
    \"api_serve_deployment_config\": {
      \"deployment_strategy\": \"canary\",
      \"deployment_strategy_config\": {
        \"interval\": \"1m\",
        \"threshold\": 2,
        \"max_weight\": 50,
        \"step_weight\": 10,
        \"progress_deadline_seconds\": 600,
        \"skip_analysis\": false
      }
    }
  }")"

if command -v jq >/dev/null 2>&1; then
  echo "${RESP}" | jq .
else
  echo "${RESP}"
fi

echo
echo "2) Observe Flagger canary progression"
echo "   (Adjust namespace/cluster based on your Environment configs.)"
echo
echo "kubectl get canary -A | grep \"${SERVE_NAME}\""
echo "kubectl describe canary -n <namespace> <release-fullname>"
echo "kubectl get events -n <namespace> --sort-by=.metadata.creationTimestamp | tail -n 50"
echo
echo "3) (Optional) Generate traffic and watch weights"
echo "kubectl -n <namespace> logs deploy/flagger -f | grep \"${SERVE_NAME}\""

