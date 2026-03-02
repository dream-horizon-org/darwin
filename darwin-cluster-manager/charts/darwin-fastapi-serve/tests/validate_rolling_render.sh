#!/usr/bin/env bash
# Lightweight render test for rolling block, deployment strategy, and flagger manual mode.
# Run from chart root: ./tests/validate_rolling_render.sh

set -e
CHART_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$CHART_DIR"

echo "=== Validate rolling block defaults ==="
out=$(helm template test . 2>&1)
echo "$out" | grep -q "maxSurge: 25%" || { echo "FAIL: expected maxSurge 25%"; exit 1; }
echo "$out" | grep -q "maxUnavailable: 0" || { echo "FAIL: expected maxUnavailable 0"; exit 1; }
echo "OK: defaults"

echo "=== Validate fallback to flagger when rolling absent ==="
out=$(helm template test . --set 'rolling=null' 2>&1)
echo "$out" | grep -q "maxSurge: 10%" || { echo "FAIL: expected maxSurge 10% (flagger)"; exit 1; }
echo "$out" | grep -q "maxUnavailable: 1" || { echo "FAIL: expected maxUnavailable 1 (flagger)"; exit 1; }
echo "OK: fallback"

echo "=== Validate rolling overrides ==="
out=$(helm template test . --set 'rolling.maxSurge=50%' --set 'rolling.maxUnavailable=2' 2>&1)
echo "$out" | grep -q "maxSurge: 50%" || { echo "FAIL: expected maxSurge 50%"; exit 1; }
echo "$out" | grep -q "maxUnavailable: 2" || { echo "FAIL: expected maxUnavailable 2"; exit 1; }
echo "OK: overrides"

echo "=== Validate flagger manual mode (skipAnalysis, webhooks, empty metrics) ==="
out=$(helm template test . -f tests/values-manual-canary.yaml 2>&1)
echo "$out" | grep -q "skipAnalysis: true" || { echo "FAIL: expected skipAnalysis: true"; exit 1; }
echo "$out" | grep -q "type: \"confirm-promotion\"" || { echo "FAIL: expected webhook type confirm-promotion"; exit 1; }
echo "$out" | grep -q "flagger-loadtester" || { echo "FAIL: expected loadtester URL in webhook"; exit 1; }
# MetricTemplate must NOT be rendered when metrics is empty
if echo "$out" | grep -q "kind: MetricTemplate"; then
  echo "FAIL: MetricTemplate must be omitted when metrics is empty"; exit 1
fi
echo "OK: manual canary mode"

echo "=== Validate flagger with metrics (MetricTemplate rendered) ==="
out=$(helm template test . --set 'flagger.enabled=true' 2>&1)
echo "$out" | grep -q "kind: MetricTemplate" || { echo "FAIL: expected MetricTemplate when metrics present"; exit 1; }
echo "$out" | grep -q "skipAnalysis: false" || { echo "FAIL: expected skipAnalysis: false by default"; exit 1; }
echo "OK: flagger with metrics"

echo "=== All rolling and flagger render tests passed ==="
