#!/bin/bash
# Darwin SDK Spark Job Submission Script
#
# This script submits a Spark job to a Ray cluster deployed by darwin-cluster-manager.
# It uses the Ray Jobs API to submit the job.
#
# Usage: ./submit_spark_job.sh [OPTIONS]
#
# Options:
#   --cluster-name NAME   Ray cluster name (required)
#   --namespace NS        Kubernetes namespace (default: ray)
#   --job-file FILE       Python job file to submit (default: examples/darwin_spark_job.py)
#   --kubeconfig PATH     Path to kubeconfig (default: uses KUBECONFIG env var)
#   --wait                Wait for job to complete
#   --help                Show this help message
#
# Example:
#   ./submit_spark_job.sh --cluster-name my-cluster --namespace ray --wait

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Darwin monorepo root
DARWIN_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Default values
CLUSTER_NAME=""
NAMESPACE="ray"
JOB_FILE="${DARWIN_ROOT}/examples/darwin_spark_job.py"
KUBECONFIG_PATH="${KUBECONFIG:-}"
WAIT_FOR_COMPLETION=false
PORT_FORWARD_PID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

show_help() {
    head -20 "$0" | tail -16
    exit 0
}

cleanup() {
    if [[ -n "$PORT_FORWARD_PID" ]]; then
        log_info "Cleaning up port-forward (PID: $PORT_FORWARD_PID)..."
        kill "$PORT_FORWARD_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --cluster-name)
            CLUSTER_NAME="$2"
            shift 2
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --job-file)
            JOB_FILE="$2"
            shift 2
            ;;
        --kubeconfig)
            KUBECONFIG_PATH="$2"
            shift 2
            ;;
        --wait)
            WAIT_FOR_COMPLETION=true
            shift
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# Validate required arguments
if [[ -z "$CLUSTER_NAME" ]]; then
    log_error "Missing required argument: --cluster-name"
    show_help
fi

if [[ ! -f "$JOB_FILE" ]]; then
    log_error "Job file not found: $JOB_FILE"
    exit 1
fi

# Set kubectl context
KUBECTL_CMD="kubectl"
if [[ -n "$KUBECONFIG_PATH" ]]; then
    KUBECTL_CMD="kubectl --kubeconfig=$KUBECONFIG_PATH"
fi

log_info "Darwin SDK Spark Job Submission"
log_info "================================"
log_info "Cluster Name: ${CLUSTER_NAME}"
log_info "Namespace: ${NAMESPACE}"
log_info "Job File: ${JOB_FILE}"
log_info "Wait for completion: ${WAIT_FOR_COMPLETION}"
echo ""

# Step 1: Check if cluster exists and is ready
log_step "Step 1: Checking Ray cluster status..."

# The Ray cluster service follows the pattern: {cluster-name}-kuberay-head-svc
HEAD_SVC="${CLUSTER_NAME}-kuberay-head-svc"

# Check if the service exists
if ! $KUBECTL_CMD get svc "$HEAD_SVC" -n "$NAMESPACE" &>/dev/null; then
    log_error "Ray cluster head service not found: $HEAD_SVC in namespace $NAMESPACE"
    log_error "Make sure the cluster is created and running."
    log_error ""
    log_error "To create a cluster, use the Darwin Compute API:"
    log_error "  curl -X POST http://localhost/compute/cluster -H 'Content-Type: application/json' \\"
    log_error "    -d '{\"cluster_name\": \"$CLUSTER_NAME\", \"runtime\": \"Ray2.37.0-Py310-CPU\", ...}'"
    exit 1
fi

log_info "Found Ray cluster head service: $HEAD_SVC"

# Step 2: Wait for head pod to be ready
log_step "Step 2: Waiting for Ray head pod to be ready..."

HEAD_POD_SELECTOR="ray.io/cluster=${CLUSTER_NAME}-kuberay,ray.io/node-type=head"
TIMEOUT=300
ELAPSED=0

while [[ $ELAPSED -lt $TIMEOUT ]]; do
    POD_STATUS=$($KUBECTL_CMD get pods -n "$NAMESPACE" -l "$HEAD_POD_SELECTOR" -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "NotFound")
    
    if [[ "$POD_STATUS" == "Running" ]]; then
        log_info "Ray head pod is running"
        break
    fi
    
    log_info "Waiting for head pod... (status: $POD_STATUS, elapsed: ${ELAPSED}s)"
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

if [[ $ELAPSED -ge $TIMEOUT ]]; then
    log_error "Timeout waiting for Ray head pod to be ready"
    exit 1
fi

# Step 3: Set up port-forward to Ray dashboard
log_step "Step 3: Setting up port-forward to Ray dashboard..."

LOCAL_PORT=8265
$KUBECTL_CMD port-forward "svc/$HEAD_SVC" "$LOCAL_PORT:8265" -n "$NAMESPACE" &>/dev/null &
PORT_FORWARD_PID=$!

# Wait for port-forward to be ready
sleep 3

# Verify port-forward is working
if ! kill -0 "$PORT_FORWARD_PID" 2>/dev/null; then
    log_error "Failed to set up port-forward"
    exit 1
fi

log_info "Port-forward established (localhost:$LOCAL_PORT -> $HEAD_SVC:8265)"

# Step 4: Wait for Ray dashboard to be ready
log_step "Step 4: Waiting for Ray dashboard to be ready..."

RAY_DASHBOARD_URL="http://localhost:$LOCAL_PORT"
TIMEOUT=60
ELAPSED=0

while [[ $ELAPSED -lt $TIMEOUT ]]; do
    if curl -s "${RAY_DASHBOARD_URL}/api/version" &>/dev/null; then
        RAY_VERSION=$(curl -s "${RAY_DASHBOARD_URL}/api/version" | python3 -c "import sys, json; print(json.load(sys.stdin).get('ray_version', 'unknown'))" 2>/dev/null || echo "unknown")
        log_info "Ray dashboard is ready (Ray version: $RAY_VERSION)"
        break
    fi
    
    log_info "Waiting for Ray dashboard... (elapsed: ${ELAPSED}s)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [[ $ELAPSED -ge $TIMEOUT ]]; then
    log_error "Timeout waiting for Ray dashboard to be ready"
    exit 1
fi

# Step 5: Submit the job
log_step "Step 5: Submitting Spark job..."

JOB_NAME=$(basename "$JOB_FILE" .py)
JOB_CONTENT=$(cat "$JOB_FILE")

# Create the job submission payload
# Using Ray Jobs API: POST /api/jobs/
SUBMIT_PAYLOAD=$(python3 -c "
import json
import sys

job_content = '''$JOB_CONTENT'''

payload = {
    'entrypoint': 'python job_script.py',
    'runtime_env': {
        'working_dir': '.',
        'py_modules': [],
        'env_vars': {
            'CLUSTER_ID': '$CLUSTER_NAME',
            'ENV': 'LOCAL'
        }
    },
    'metadata': {
        'name': '$JOB_NAME',
        'owner': 'darwin-sdk',
        'cluster': '$CLUSTER_NAME'
    }
}

print(json.dumps(payload))
")

# First, we need to upload the job file as a working directory
# For simplicity, we'll use the entrypoint directly with the script content
log_info "Preparing job submission..."

# Create a temporary directory for the job
JOB_TEMP_DIR=$(mktemp -d)
cp "$JOB_FILE" "$JOB_TEMP_DIR/job_script.py"

# Create the runtime_env with the working directory
SUBMIT_RESPONSE=$(curl -s -X POST "${RAY_DASHBOARD_URL}/api/jobs/" \
    -H "Content-Type: application/json" \
    -d "{
        \"entrypoint\": \"python job_script.py\",
        \"runtime_env\": {
            \"working_dir\": \"file://${JOB_TEMP_DIR}\",
            \"env_vars\": {
                \"CLUSTER_ID\": \"${CLUSTER_NAME}\",
                \"ENV\": \"LOCAL\"
            }
        },
        \"metadata\": {
            \"name\": \"${JOB_NAME}\",
            \"owner\": \"darwin-sdk\",
            \"cluster\": \"${CLUSTER_NAME}\"
        }
    }")

# Extract submission ID
SUBMISSION_ID=$(echo "$SUBMIT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('submission_id', ''))" 2>/dev/null || echo "")

if [[ -z "$SUBMISSION_ID" ]]; then
    log_error "Failed to submit job. Response: $SUBMIT_RESPONSE"
    rm -rf "$JOB_TEMP_DIR"
    exit 1
fi

log_info "Job submitted successfully!"
log_info "Submission ID: $SUBMISSION_ID"

# Cleanup temp directory
rm -rf "$JOB_TEMP_DIR"

# Step 6: Monitor job (if --wait is specified)
if [[ "$WAIT_FOR_COMPLETION" == "true" ]]; then
    log_step "Step 6: Monitoring job status..."
    
    while true; do
        STATUS_RESPONSE=$(curl -s "${RAY_DASHBOARD_URL}/api/jobs/${SUBMISSION_ID}")
        JOB_STATUS=$(echo "$STATUS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'UNKNOWN'))" 2>/dev/null || echo "UNKNOWN")
        
        case "$JOB_STATUS" in
            "SUCCEEDED")
                log_info "Job completed successfully!"
                echo ""
                log_info "Job logs:"
                echo "=========================================="
                curl -s "${RAY_DASHBOARD_URL}/api/jobs/${SUBMISSION_ID}/logs" | python3 -c "import sys, json; print(json.load(sys.stdin).get('logs', 'No logs available'))" 2>/dev/null || echo "Could not retrieve logs"
                echo "=========================================="
                break
                ;;
            "FAILED")
                log_error "Job failed!"
                echo ""
                log_error "Job logs:"
                echo "=========================================="
                curl -s "${RAY_DASHBOARD_URL}/api/jobs/${SUBMISSION_ID}/logs" | python3 -c "import sys, json; print(json.load(sys.stdin).get('logs', 'No logs available'))" 2>/dev/null || echo "Could not retrieve logs"
                echo "=========================================="
                exit 1
                ;;
            "STOPPED")
                log_warn "Job was stopped"
                break
                ;;
            *)
                log_info "Job status: $JOB_STATUS"
                sleep 5
                ;;
        esac
    done
else
    log_step "Step 6: Skipping wait (use --wait to monitor job)"
fi

echo ""
log_info "================================"
log_info "Job submission completed!"
log_info ""
log_info "Submission ID: $SUBMISSION_ID"
log_info ""
log_info "To check job status:"
log_info "  curl ${RAY_DASHBOARD_URL}/api/jobs/${SUBMISSION_ID}"
log_info ""
log_info "To view job logs:"
log_info "  curl ${RAY_DASHBOARD_URL}/api/jobs/${SUBMISSION_ID}/logs"
log_info ""
log_info "To access Ray dashboard:"
log_info "  kubectl port-forward svc/$HEAD_SVC 8265:8265 -n $NAMESPACE"
log_info "  Then open: http://localhost:8265"

