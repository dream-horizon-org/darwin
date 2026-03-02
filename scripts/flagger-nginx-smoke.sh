#!/usr/bin/env bash
set -euo pipefail

#
# Smoke test for Flagger + NGINX progressive delivery with the
# `darwin-fastapi-serve` Helm chart.
#
# This script is intended for local clusters (e.g., Kind) and is safe to re-run.
#

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd kubectl
require_cmd helm

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHART_DIR="${ROOT_DIR}/darwin-cluster-manager/charts/darwin-fastapi-serve"

INGRESS_NS="ingress-nginx"
TEST_NS="serve-canary-smoke"
RELEASE="smoke"
HOST="app.example.com"

echo "==> Installing ingress-nginx (namespace: ${INGRESS_NS})"
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx >/dev/null 2>&1 || true
kubectl create ns "${INGRESS_NS}" >/dev/null 2>&1 || true
helm upgrade -i ingress-nginx ingress-nginx/ingress-nginx \
  --namespace "${INGRESS_NS}" \
  --set controller.metrics.enabled=true \
  --set controller.podAnnotations."prometheus\\.io/scrape"=true \
  --set controller.podAnnotations."prometheus\\.io/port"=10254

echo "==> Installing Flagger (NGINX provider) into ${INGRESS_NS}"
helm repo add flagger https://flagger.app >/dev/null 2>&1 || true
helm upgrade -i flagger flagger/flagger \
  --namespace "${INGRESS_NS}" \
  --set prometheus.install=true \
  --set meshProvider=nginx

echo "==> Creating test namespace ${TEST_NS}"
kubectl create ns "${TEST_NS}" >/dev/null 2>&1 || true

echo "==> Installing Flagger loadtester into ${TEST_NS}"
helm upgrade -i flagger-loadtester flagger/loadtester --namespace "${TEST_NS}"

VALUES_FILE="$(mktemp)"
cleanup() {
  rm -f "${VALUES_FILE}"
}
trap cleanup EXIT

cat <<'EOF' > "${VALUES_FILE}"
name: podinfo
replicaCount: 1

# Use podinfo as a known-good HTTP app for smoke testing.
image:
  repository: ghcr.io/stefanprodan/podinfo
  tag: "6.0.0"
  pullPolicy: IfNotPresent

service:
  enabled: true
  type: ClusterIP
  httpPort: 9898
  externalPort: 80

livenessProbe:
  httpGet:
    path: /healthz
    port: 9898
readinessProbe:
  httpGet:
    path: /healthz
    port: 9898

hpa:
  enabled: false

ingressInt:
  enabled: true
  ingressClass: nginx
  hosts:
    - app.example.com
  path: /
  pathType: Prefix

flagger:
  enabled: true
  provider: nginx
  type: canary
  interval: 10s
  threshold: 5
  maxWeight: 50
  stepWeight: 10
  metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
      interval: 30s
  webhooks:
    - name: load-test
      url: http://flagger-loadtester.serve-canary-smoke/
      timeout: 5s
      metadata:
        cmd: "hey -z 30s -q 10 -c 2 -H 'Host: app.example.com' http://ingress-nginx-controller.ingress-nginx/"
EOF

echo "==> Installing smoke release (${RELEASE}) into ${TEST_NS}"
helm upgrade -i "${RELEASE}" "${CHART_DIR}" \
  --namespace "${TEST_NS}" \
  --create-namespace \
  -f "${VALUES_FILE}"

echo "==> Waiting for canary to be created"
CANARY_NAME="${RELEASE}-podinfo"
for _ in $(seq 1 60); do
  if kubectl -n "${TEST_NS}" get canary "${CANARY_NAME}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
kubectl -n "${TEST_NS}" get canaries || true

echo "==> Triggering a rollout by updating the image tag"
helm upgrade "${RELEASE}" "${CHART_DIR}" \
  --namespace "${TEST_NS}" \
  -f "${VALUES_FILE}" \
  --set image.tag="6.0.1"

echo "==> Watching canary status (Ctrl+C to stop)"
kubectl -n "${TEST_NS}" describe canary "${CANARY_NAME}" || true
kubectl -n "${TEST_NS}" get canaries -w

