#!/usr/bin/env bash

set -e # For enabling Exit on error

echo "APP_DIR: ${APP_DIR}"
echo "ENV: ${ENV}"
echo "SERVICE_NAME: ${SERVICE_NAME}"
echo "PLATFORM: ${PLATFORM}"
echo "DEPLOYMENT_TYPE: ${DEPLOYMENT_TYPE}"
echo "NAMESPACE: ${NAMESPACE}"

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

echo "Cding into app dir.."
cd "$APP_DIR" || exit


# for local development
export VAULT_SERVICE_MYSQL_USERNAME=darwin
export VAULT_SERVICE_MYSQL_PASSWORD=password
export CONFIG_SERVICE_MYSQL_MASTERHOST=${DARWIN_MYSQL_HOST:-darwin-mysql}
export CONFIG_SERVICE_MYSQL_DATABASE=darwin_mlflow
export CONFIG_SERVICE_MYSQL_AUTH_DATABASE=darwin_mlflow_auth
export MLFLOW_S3_BUCKET=${MLFLOW_S3_BUCKET:-darwin-mlflow}
# Set MLFLOW_S3_ENDPOINT_URL for LocalStack (use AWS_ENDPOINT_OVERRIDE if available)
export MLFLOW_S3_ENDPOINT_URL=${AWS_ENDPOINT_OVERRIDE:-${MLFLOW_S3_ENDPOINT_URL:-http://darwin-localstack:4566}}
export VAULT_SERVICE_ADMIN_USERNAME=darwin
export VAULT_SERVICE_ADMIN_PASSWORD=password
export VAULT_SERVICE_MLFLOW_ADMIN_PASSWORD=password
export VAULT_SERVICE_MLFLOW_ADMIN_USERNAME=darwin

if [[ -z "${LOG_DIR:-}" ]]; then
  if [[ "$DEPLOYMENT_TYPE" == "container" ]]; then
    mkdir -p /app/log/"$SERVICE_NAME"
    chmod 777 /app/log/"$SERVICE_NAME"/
    export LOG_DIR=/app/log/"$SERVICE_NAME"
  else
    mkdir -p /var/log/"$SERVICE_NAME"
    chmod 777 /var/log/"$SERVICE_NAME"/
    export LOG_DIR=/var/log/"$SERVICE_NAME"
  fi
fi

if [[ "$ENV" != "darwin-local" ]] ; then
  if [[ -z "$NAMESPACE" ]]; then
    echo "ERROR: Environment variable NAMESPACE is not set"
    exit 1
  fi
  if [[ -z "$PLATFORM" ]]; then
    echo "ERROR: Environment variable PLATFORM is not set"
    exit 1
  fi
fi
MLFLOW_AUTH_ENABLED=${MLFLOW_AUTH_ENABLED:-false}
# Auth config (optional)
if [[ "$MLFLOW_AUTH_ENABLED" == "true" ]]; then
  # Generate auth.ini file
  rm -f auth_config.ini
  echo "[mlflow]" > auth_config.ini
  echo "default_permission = MANAGE" >> auth_config.ini
  echo "database_uri = mysql+pymysql://${VAULT_SERVICE_MYSQL_USERNAME}:${VAULT_SERVICE_MYSQL_PASSWORD}@${CONFIG_SERVICE_MYSQL_MASTERHOST}/${CONFIG_SERVICE_MYSQL_AUTH_DATABASE}" >> auth_config.ini
  echo "admin_username = ${VAULT_SERVICE_ADMIN_USERNAME}" >> auth_config.ini
  echo "admin_password = ${VAULT_SERVICE_ADMIN_PASSWORD}" >> auth_config.ini
  echo "authorization_function = mlflow.server.auth:authenticate_request_basic_auth" >> auth_config.ini
fi

# Starting App Layer
echo "Starting App Layer"
if [[ "$DEPLOYMENT_TYPE" == "container" ]]; then
  source bin/activate
fi

echo "Starting MLFlow Server"

mlflow --version

if [[ "$MLFLOW_AUTH_ENABLED" == "true" ]]; then
  echo "auth true"
  echo "Using S3 endpoint: ${MLFLOW_S3_ENDPOINT_URL}"
  echo "Using S3 bucket: ${MLFLOW_S3_BUCKET}"
  MLFLOW_TRACKING_USERNAME=${VAULT_SERVICE_MLFLOW_ADMIN_USERNAME} MLFLOW_TRACKING_PASSWORD=${VAULT_SERVICE_MLFLOW_ADMIN_PASSWORD} LOG_FILE=$LOG_DIR/darwin-mlflow.log MLFLOW_S3_ENDPOINT_URL=${MLFLOW_S3_ENDPOINT_URL} MLFLOW_AUTH_CONFIG_PATH=auth_config.ini mlflow server \
    --backend-store-uri "mysql+pymysql://${VAULT_SERVICE_MYSQL_USERNAME}:${VAULT_SERVICE_MYSQL_PASSWORD}@${CONFIG_SERVICE_MYSQL_MASTERHOST}/${CONFIG_SERVICE_MYSQL_DATABASE}" \
    --artifacts-destination "s3://${MLFLOW_S3_BUCKET}" \
    --host 0.0.0.0 \
    --port 8080 \
    --app-name basic-auth
else
  echo "auth false"
  echo "Using S3 endpoint: ${MLFLOW_S3_ENDPOINT_URL}"
  echo "Using S3 bucket: ${MLFLOW_S3_BUCKET}"
  MLFLOW_TRACKING_USERNAME=${VAULT_SERVICE_MLFLOW_ADMIN_USERNAME} MLFLOW_TRACKING_PASSWORD=${VAULT_SERVICE_MLFLOW_ADMIN_PASSWORD} LOG_FILE=$LOG_DIR/darwin-mlflow.log MLFLOW_S3_ENDPOINT_URL=${MLFLOW_S3_ENDPOINT_URL} mlflow server \
    --backend-store-uri "mysql+pymysql://${VAULT_SERVICE_MYSQL_USERNAME}:${VAULT_SERVICE_MYSQL_PASSWORD}@${CONFIG_SERVICE_MYSQL_MASTERHOST}/${CONFIG_SERVICE_MYSQL_DATABASE}" \
    --artifacts-destination "s3://${MLFLOW_S3_BUCKET}" \
    --host 0.0.0.0 \
    --port 8080 \
    --dev
fi
