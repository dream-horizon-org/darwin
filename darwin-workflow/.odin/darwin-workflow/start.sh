#!/usr/bin/env bash
set -e

echo "=========================================="
echo "Darwin Workflow - Starting"
echo "=========================================="
echo "ENV: ${ENV:-not set}"
echo "DEPLOYMENT_TYPE: ${DEPLOYMENT_TYPE:-container}"
echo "SERVICE_NAME: ${SERVICE_NAME:-darwin-workflow}"
echo "=========================================="

# Check if running in local/container mode (no Consul/Vault)
# Use separate conditions to avoid bash evaluation issues
IS_LOCAL=false
if [ "$DEPLOYMENT_TYPE" == "container" ]; then
  IS_LOCAL=true
fi
if [ "$ENV" == "local" ] || [ "$ENV" == "darwin-local" ]; then
  IS_LOCAL=true
fi

if [ "$IS_LOCAL" == "true" ]; then
  echo "🚀 Running in LOCAL/CONTAINER mode"
  echo "   Skipping FSx, Consul, and Vault setup"
  
  # Setup log directory
  mkdir -p /var/log/darwin-workflow 2>/dev/null || mkdir -p /tmp/darwin-workflow
  export LOG_DIR=${LOG_DIR:-/tmp/darwin-workflow}
  export LOG_FILE=${LOG_FILE:-$LOG_DIR/workflow.log}
  
  echo "   LOG_DIR: $LOG_DIR"
  echo "   LOG_FILE: $LOG_FILE"
  
  # Go to app directory
  cd /app || exit 1
  
  # Create static directory
  mkdir -p /app/app_layer/src/workflow_app_layer/static
  mkdir -p /app/static
  echo "✅ Created static directories"
  
  # Go to app layer
  cd /app/app_layer/src/workflow_app_layer || exit 1
  
  # Determine number of workers (use CORES env var or default to 1 for local)
  CORES=${CORES:-1}
  echo "   Starting uvicorn with $CORES worker(s)..."
  
  # Start uvicorn directly (no envconsul needed for local)
  # Use python3 -m uvicorn to ensure it's found in the Python environment
  # Add --log-level debug to capture more details
  exec python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --workers $CORES --timeout-keep-alive 75 --log-level debug 2>&1
  
else
  # PRODUCTION MODE - Original script logic
  echo "🏢 Running in PRODUCTION mode"
  
  echo "----- Setup log file path -----"
  mkdir -p /var/log/darwin-workflow
  chmod 777 /var/log/darwin-workflow/
  
  echo "----- Attach FSx -----"
  cd /var/www
  sudo mkdir -p fsx
  chmod 777 /var/www/fsx/
  
  # Configuration via environment variables
  # These should be set based on your infrastructure
  if [[ "$ENV" == "prod" || "$ENV" == "uat" ]]; then
      CONSUL_ADDR="${CONSUL_ADDR:-config-store-${ENV}.example.com}"
      VAULT_ADDR="${VAULT_ADDR:-http://secret-store-${ENV}.example.com}"
      FSX_NFS_SERVER="${FSX_NFS_SERVER_PROD:-${FSX_NFS_SERVER}}"
  else
      CONSUL_ADDR="${CONSUL_ADDR:-config-store-${ENV}.example.com}"
      VAULT_ADDR="${VAULT_ADDR:-http://secret-store-${ENV}.example.com}"
      FSX_NFS_SERVER="${FSX_NFS_SERVER_DEV:-${FSX_NFS_SERVER}}"
  fi
  
  if [ -z "$FSX_NFS_SERVER" ]; then
    echo "⚠️  FSX_NFS_SERVER environment variable is not set. Skipping NFS mount."
    echo "   Set FSX_NFS_SERVER (or FSX_NFS_SERVER_PROD/FSX_NFS_SERVER_DEV) to your NFS server IP or hostname to enable FSx mounting."
  else
    echo "   Mounting NFS from ${FSX_NFS_SERVER}..."
    sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport "${FSX_NFS_SERVER}:/" fsx
    if [ $? -eq 0 ]; then
      echo "✅ NFS mount successful"
    else
      echo "⚠️  NFS mount failed, continuing without FSx..."
    fi
  fi
  
  echo "Cding into app dir.."
  cd "${APP_DIR}" || exit
  
  CONFIG_OPTS="-upcase -sanitize -flatten -consul-addr ${CONSUL_ADDR} -vault-addr ${VAULT_ADDR} -vault-renew-token=false -prefix d11/${NAMESPACE} -secret secrets/data/d11/${NAMESPACE}/${SERVICE_NAME}/${ENV}/default"
  echo ${CONFIG_OPTS}
  echo "----- Set AWS variables -----"
  whoami
  ACCESS_KEY=$(envconsul ${CONFIG_OPTS} env | grep -E '^VAULT_SERVICE_ACCESS_KEY_ID=' | cut -d "=" -f2)
  SECRET_KEY=$(envconsul ${CONFIG_OPTS} env | grep -E '^VAULT_SERVICE_SECRET_ACCESS_KEY=' | cut -d "=" -f2)
  DEF_REGION=$(envconsul ${CONFIG_OPTS} env | grep -E '^VAULT_SERVICE_DEFAULT_REGION=' | cut -d "=" -f2)
  
  # Export AWS credentials from Vault/Consul
  export AWS_ACCESS_KEY_ID="${ACCESS_KEY}"
  export AWS_SECRET_ACCESS_KEY="${SECRET_KEY}"
  export AWS_DEFAULT_REGION="${DEF_REGION}"

  echo "AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:+***set***}"
  echo "AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:+***set***}"
  echo "AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION}"
  echo "----- AWS caller identity -----"
  aws sts get-caller-identity
  
  cd "$APP_DIR" || exit
  export LOG_DIR=/var/log/darwin-workflow
  
  echo "Cding into app layer"
  cd app_layer/src/workflow_app_layer
  
  # Create static directory for production
  mkdir -p static
  echo "✅ Created static directory"
  
  echo "Starting app layer"
  CORES=$(nproc)
  if [[ "$ENV" == "prod" || "$ENV" == "uat" ]]; then
    LOG_FILE=$LOG_DIR/workflow.log envconsul ${CONFIG_OPTS} python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --workers $CORES --timeout-keep-alive 75
  else
    VPC_SUFFIX="$VPC_SUFFIX" TEAM_SUFFIX="$TEAM_SUFFIX" LOG_FILE=$LOG_DIR/workflow.log envconsul ${CONFIG_OPTS} python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --workers $CORES --timeout-keep-alive 75
  fi
  echo "app layer started"
fi
