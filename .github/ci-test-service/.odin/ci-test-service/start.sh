#!/usr/bin/env bash
# CI Test Service start script
# This is the entrypoint for the Docker container

set -e

echo "Starting ci-test-service..."

# Start the FastAPI application
cd /app
exec uvicorn main:app --host 0.0.0.0 --port 8000
