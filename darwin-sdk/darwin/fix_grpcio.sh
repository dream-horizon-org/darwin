#!/bin/bash
# Fix grpcio version for Ray 2.37.0 compatibility
# Run this on each pod (head and workers) via k9s shell

set -e

echo "========================================"
echo "FIXING GRPCIO FOR RAY 2.37.0"
echo "========================================"
echo ""

echo "1. Current grpcio version:"
pip freeze | grep grpcio
echo ""

echo "2. Stopping Ray (if running)..."
ray stop --force 2>/dev/null || true
echo ""

echo "3. Installing compatible grpcio version..."
pip install grpcio==1.54.2 grpcio-tools==1.54.2 --force-reinstall
echo ""

echo "4. Verifying installation:"
pip freeze | grep grpcio
echo ""

echo "========================================"
echo "GRPCIO FIX COMPLETE"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Run this script on ALL worker pods"
echo "  2. Restart Ray cluster on head node:"
echo "     ray start --head --dashboard-host=0.0.0.0 --port=6379"
echo "  3. Test with: python cluster_test.py"

