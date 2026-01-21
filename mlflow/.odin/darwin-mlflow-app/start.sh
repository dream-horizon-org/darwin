#!/usr/bin/env bash
set -e
echo "APP_DIR: ${APP_DIR}"
echo "ENV: ${ENV}"
echo "SERVICE_NAME: ${SERVICE_NAME}"
echo "PLATFORM: ${PLATFORM}"
echo "DEPLOYMENT_TYPE: ${DEPLOYMENT_TYPE}"
echo "NAMESPACE: ${NAMESPACE}"

# Check for required environment variables and log all missing before exiting
REQUIRED_VARS=("APP_DIR" "ENV" "SERVICE_NAME" "DEPLOYMENT_TYPE")
MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!VAR}" ]]; then
    echo "ERROR: Environment variable $VAR is not set"
    MISSING_VARS+=("$VAR")
  fi
done

if [[ ${#MISSING_VARS[@]} -ne 0 ]]; then
  echo "The following required environment variables are missing: ${MISSING_VARS[*]}"
  exit 1
fi



echo "----- Setup log file path -----"
if [[ -z "${LOG_DIR:-}" ]]; then
  if [[ "$DEPLOYMENT_TYPE" == "container" ]]; then
    mkdir -p /app/log/darwin-mlflow-app
    chmod 777 /app/log/darwin-mlflow-app/
    export LOG_DIR=/app/log/darwin-mlflow-app
  else
    mkdir -p /var/log/darwin-mlflow-app
    chmod 777 /var/log/darwin-mlflow-app/
    export LOG_DIR=/var/log/darwin-mlflow-app
  fi
  else
    mkdir -p "${LOG_DIR}"
fi
echo "Cding into app dir.."
cd "$APP_DIR" || exit

export VAULT_SERVICE_MYSQL_USERNAME=${VAULT_SERVICE_MYSQL_USERNAME:-darwin}
export VAULT_SERVICE_MYSQL_PASSWORD=${VAULT_SERVICE_MYSQL_PASSWORD:-password}
export CONFIG_SERVICE_MYSQL_MASTERHOST=${CONFIG_SERVICE_MYSQL_MASTERHOST:-darwin-mysql}
export CONFIG_SERVICE_MYSQL_DATABASE=${CONFIG_SERVICE_MYSQL_DATABASE:-darwin_mlflow}
export VAULT_SERVICE_ADMIN_USERNAME=${VAULT_SERVICE_ADMIN_USERNAME:-admin}
export VAULT_SERVICE_ADMIN_PASSWORD=${VAULT_SERVICE_ADMIN_PASSWORD:-password}
export VAULT_SERVICE_MLFLOW_ADMIN_USERNAME=${VAULT_SERVICE_MLFLOW_ADMIN_USERNAME:-darwin}
export VAULT_SERVICE_MLFLOW_ADMIN_PASSWORD=${VAULT_SERVICE_MLFLOW_ADMIN_PASSWORD:-password}
export DARWIN_MYSQL_PASSWORD=${DARWIN_MYSQL_PASSWORD:-password}
export DARWIN_MYSQL_HOST=${DARWIN_MYSQL_HOST:-darwin-mysql}
export DARWIN_MYSQL_USERNAME=${DARWIN_MYSQL_USERNAME:-darwin}
export MLFLOW_S3_BUCKET=${MLFLOW_S3_BUCKET:-darwin-mlflow}
export AWS_ENDPOINT_OVERRIDE=${AWS_ENDPOINT_OVERRIDE:-http://darwin-localstack:4566}
export MLFLOW_UI_URL=${MLFLOW_UI_URL:-http://localhost:8080}
export MLFLOW_APP_LAYER_URL=${MLFLOW_APP_LAYER_URL:-http://localhost:8000}
export MLFLOW_APP_BASE_PATH=${MLFLOW_APP_BASE_PATH:-}
export MYSQL_PORT=${MYSQL_PORT:-3306}

echo "Environment variables:"
echo "VAULT_SERVICE_MYSQL_USERNAME: ${VAULT_SERVICE_MYSQL_USERNAME:-darwin}"
echo "VAULT_SERVICE_MYSQL_PASSWORD: ${VAULT_SERVICE_MYSQL_PASSWORD:-password}"
echo "CONFIG_SERVICE_MYSQL_MASTERHOST: ${CONFIG_SERVICE_MYSQL_MASTERHOST:-darwin-mysql}"
echo "CONFIG_SERVICE_MYSQL_DATABASE: ${CONFIG_SERVICE_MYSQL_DATABASE:-darwin_mlflow}"
echo "MLFLOW_S3_BUCKET: ${MLFLOW_S3_BUCKET:-darwin-mlflow}"
echo "AWS_ENDPOINT_OVERRIDE: ${AWS_ENDPOINT_OVERRIDE:-http://darwin-localstack:4566}"
echo "VAULT_SERVICE_ADMIN_USERNAME: ${VAULT_SERVICE_ADMIN_USERNAME:-admin}"
echo "VAULT_SERVICE_ADMIN_PASSWORD: ${VAULT_SERVICE_ADMIN_PASSWORD:-password}"
echo "DARWIN_MYSQL_PASSWORD: ${DARWIN_MYSQL_PASSWORD:-password}"
echo "DARWIN_MYSQL_HOST: ${DARWIN_MYSQL_HOST:-darwin-mysql}"
echo "DARWIN_MYSQL_USERNAME: ${DARWIN_MYSQL_USERNAME:-darwin}"

if [[ "$DEPLOYMENT_TYPE" == "container" ]]; then
  source bin/activate
  echo "Starting app layer ..."
  LOG_FILE=$LOG_DIR/darwin-mlflow-app.log uvicorn app_layer.src.mlflow_app_layer.main:app --host 0.0.0.0 --port 8000 --workers 1
else
  echo "Starting app layer ..."
  LOG_FILE=$LOG_DIR/darwin-mlflow-app.log uvicorn app_layer.src.mlflow_app_layer.main:app --host 0.0.0.0 --port 8000 --workers 1
fi