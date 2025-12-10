#!/bin/bash
# Ray Cluster Diagnostic Script
# Run this on the HEAD pod via k9s shell to capture logs

echo "========================================"
echo "RAY CLUSTER DIAGNOSTICS"
echo "========================================"
echo ""

echo "1. System Memory Status"
echo "----------------------------------------"
free -h
echo ""

echo "2. grpcio Version"
echo "----------------------------------------"
pip freeze | grep grpcio
echo ""

echo "3. Ray Version"
echo "----------------------------------------"
pip freeze | grep "^ray=="
echo ""

echo "4. Runtime Env Agent Log (last 100 lines)"
echo "----------------------------------------"
if [ -f /tmp/ray/session_latest/logs/runtime_env_agent.log ]; then
    cat /tmp/ray/session_latest/logs/runtime_env_agent.log | tail -100
else
    echo "Log file not found - Ray may not have started yet"
fi
echo ""

echo "5. Dashboard Agent Log (last 50 lines)"
echo "----------------------------------------"
if [ -f /tmp/ray/session_latest/logs/dashboard_agent.log ]; then
    cat /tmp/ray/session_latest/logs/dashboard_agent.log | tail -50
else
    echo "Log file not found"
fi
echo ""

echo "6. Raylet Output (last 50 lines)"
echo "----------------------------------------"
if [ -f /tmp/ray/session_latest/logs/raylet.out ]; then
    cat /tmp/ray/session_latest/logs/raylet.out | tail -50
else
    echo "Log file not found"
fi
echo ""

echo "7. Error Files"
echo "----------------------------------------"
for f in /tmp/ray/session_latest/logs/*.err; do
    if [ -f "$f" ] && [ -s "$f" ]; then
        echo "--- $f ---"
        cat "$f"
    fi
done 2>/dev/null || echo "No error files found"
echo ""

echo "8. System OOM/Kill Messages"
echo "----------------------------------------"
dmesg 2>/dev/null | grep -i "oom\|killed\|segfault" | tail -10 || echo "Cannot access dmesg (permission denied)"
echo ""

echo "9. Ray Cluster Status"
echo "----------------------------------------"
ray status 2>/dev/null || echo "Ray cluster may not be running"
echo ""

echo "========================================"
echo "DIAGNOSTICS COMPLETE"
echo "========================================"

