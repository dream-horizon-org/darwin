#!/usr/bin/env bash
set -e

echo "BASE_DIR: $BASE_DIR"
echo "SERVICE_NAME: $SERVICE_NAME"
echo "DEPLOYMENT_TYPE: $DEPLOYMENT_TYPE"
echo "APP_DIR: $APP_DIR"

REQUIRED_VARS=("BASE_DIR" "SERVICE_NAME" "DEPLOYMENT_TYPE" "APP_DIR")
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

# This is to install git in the containers for the deployment type container
if [[ "$DEPLOYMENT_TYPE" == "container" ]]; then
  ls -la
  python3 -m venv .
  source bin/activate
  bin/python3 -m pip install --upgrade pip
  export PATH=$PATH:"$BASE_DIR"/bin
  bin/pip3 install -e app_layer/.
  echo "Requirements installed"
else
  # In local mode, check if SERVICE_NAME subdirectory exists
  # If not, files are directly in BASE_DIR (e.g., GitHub CI)
  if [ -d "$BASE_DIR/$SERVICE_NAME" ]; then
    cd "$BASE_DIR/$SERVICE_NAME" || exit
  else
    cd "$BASE_DIR" || exit
  fi
  pip3 install -e app_layer/.
  echo "Requirements installed"
fi