#!/usr/bin/env bash
# CI Test Service setup script
# This is called during Docker image build to install dependencies

set -e

echo "Setting up ci-test-service..."

# Install Python dependencies
pip install --no-cache-dir fastapi uvicorn

echo "✅ ci-test-service setup complete"
