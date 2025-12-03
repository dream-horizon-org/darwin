#!/bin/sh
set -e

echo "Starting ml-platform-mf..."

# Set default environment variables if not provided
export ENV="${ENV:-local}"
export SERVICE_NAME="${SERVICE_NAME:-ml-platform-mf}"
export NAMESPACE="${NAMESPACE:-darwin}"
export DEPLOYMENT_TYPE="${DEPLOYMENT_TYPE:-container}"
export NODE_ENV="${NODE_ENV:-dev-local}"
export PORT="${PORT:-7700}"

echo "Environment: $ENV"
echo "Service Name: $SERVICE_NAME"
echo "Namespace: $NAMESPACE"
echo "Deployment Type: $DEPLOYMENT_TYPE"
echo "Node Environment: $NODE_ENV"
echo "Port: $PORT"

# Start the application
cd /app
exec node server.js

