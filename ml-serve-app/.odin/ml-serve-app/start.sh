#!/usr/bin/env bash

set -e

echo "APP_DIR: ${APP_DIR}"
echo "ENV: ${ENV}"
echo "VPC_SUFFIX: ${VPC_SUFFIX}"
echo "TEAM_SUFFIX: ${TEAM_SUFFIX}"
echo "SERVICE_NAME: ${SERVICE_NAME}"
echo "PLATFORM: ${PLATFORM}"
echo "DEPLOYMENT_TYPE: ${DEPLOYMENT_TYPE}"
echo "NAMESPACE: ${NAMESPACE}"

export OTEL_SERVICE_NAME=${SERVICE_NAME}
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

echo "OTEL_SERVICE_NAME: ${OTEL_SERVICE_NAME}"
echo "OTEL_EXPORTER_OTLP_ENDPOINT: ${OTEL_EXPORTER_OTLP_ENDPOINT}"

echo "----- Setup log file path -----"
mkdir -p log/ml-serve-app
chmod 777 log/ml-serve-app/
export LOG_DIR=/app/log/ml-serve-app

echo "Cding into app dir.."
cd "$APP_DIR" || exit

echo "Starting app layer..."
# Use APPLICATION_PORT from environment, default to 8080 (matches service port)
APP_PORT=${APPLICATION_PORT:-8080}
echo "Starting uvicorn on port $APP_PORT..."
LOG_FILE=$LOG_DIR/ml-serve-app.log python3 -m uvicorn app_layer.src.ml_serve_app_layer.main:app --host 0.0.0.0 --port $APP_PORT --workers 2
