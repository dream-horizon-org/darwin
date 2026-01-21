#!/bin/sh
set -e

YAML_FILE="services.yaml"
ENABLED_SERVICES_FILE=".setup/enabled-services.yaml"

# Source the config.env file
set -o allexport
. .setup/config.env
set +o allexport

# Variables
APP_DIR="/app"
ENV="darwin-local"
TEAM_SUFFIX="-darwin-local"
VPC_SUFFIX="-darwin-local"
DEPLOYMENT_TYPE="container"
DARWIN_MYSQL_HOST="darwin-mysql"
DARWIN_CASSANDRA_HOST="darwin-cassandra"
DARWIN_MYSQL_USERNAME="root"
DARWIN_MYSQL_PASSWORD="password"
DARWIN_KAFKA_HOST="darwin-kafka"
DARWIN_ZOOKEEPER_HOST="darwin-zookeeper"


run_pre_deploy_pod() {
if [ $# -lt 3 ]; then
    echo "Usage: run_test_pod <namespace> <image> <service_name> [EXTRA_ENV=VALUE ...]"
    return 1
  fi

  namespace=$1
  image=$2
  service_name=$3
  shift 3
  # Store remaining args for extra env vars

  pod_name="$service_name-pre-deploy"

  # Start env JSON array with predefined vars
  env_json="
    {\"name\":\"APP_DIR\",\"value\":\"$APP_DIR\"},
    {\"name\":\"ENV\",\"value\":\"$ENV\"},
    {\"name\":\"TEAM_SUFFIX\",\"value\":\"$TEAM_SUFFIX\"},
    {\"name\":\"VPC_SUFFIX\",\"value\":\"$VPC_SUFFIX\"},
    {\"name\":\"DEPLOYMENT_TYPE\",\"value\":\"$DEPLOYMENT_TYPE\"},
    {\"name\":\"DARWIN_MYSQL_HOST\",\"value\":\"$DARWIN_MYSQL_HOST\"},
    {\"name\":\"DARWIN_CASSANDRA_HOST\",\"value\":\"$DARWIN_CASSANDRA_HOST\"},
    {\"name\":\"DARWIN_MYSQL_USERNAME\",\"value\":\"$DARWIN_MYSQL_USERNAME\"},
    {\"name\":\"DARWIN_MYSQL_PASSWORD\",\"value\":\"$DARWIN_MYSQL_PASSWORD\"},
    {\"name\":\"DARWIN_KAFKA_HOST\",\"value\":\"$DARWIN_KAFKA_HOST\"},
    {\"name\":\"DARWIN_ZOOKEEPER_HOST\",\"value\":\"$DARWIN_ZOOKEEPER_HOST\"},
    {\"name\":\"SERVICE_NAME\",\"value\":\"$service_name\"}
  "

  # Append extra envs
  for kv in "$@"; do
    key=${kv%%=*}
    val=${kv#*=}
    env_json="$env_json, {\"name\":\"$key\",\"value\":\"$val\"}"
  done

  kubectl run "$pod_name" --rm -it \
    --namespace="$namespace" \
    --image="$image" \
    --restart=Never \
    --image-pull-policy=IfNotPresent \
    --overrides="
    {
        \"spec\": {
            \"containers\": [{
            \"name\": \"$pod_name\",
            \"image\": \"$image\",
            \"imagePullPolicy\": \"IfNotPresent\",
            \"command\": [\"bash\", \"-c\", \".odin/pre-deploy.sh\"],
            \"env\": [ $env_json ],
            \"volumeMounts\": [{
                \"mountPath\": \"/root/.m2/\",
                \"name\": \"host-data\"
            }]
            }],
            \"volumes\": [{
            \"name\": \"host-data\",
            \"hostPath\": {
                \"path\": \"/mnt/shared-data/.m2/\",
                \"type\": \"Directory\"
            }
            }]
        }
    }"
}

# Check that enabled services config exists (from init.sh)
if [ ! -f "$ENABLED_SERVICES_FILE" ]; then
  echo "❌ No configuration found at $ENABLED_SERVICES_FILE"
  echo "   Please run ./init.sh first to configure which services to enable."
  exit 1
fi

# Loop through applications and run pre-deploy only for enabled ones
app_count=$(yq eval '.applications | length' "$YAML_FILE")
i=0
while [ $i -lt $app_count ]; do
  application=$(yq eval ".applications[$i].application" "$YAML_FILE")

  # Check enabled status from .setup/enabled-services.yaml
  is_enabled=$(yq eval ".applications.\"$application\"" "$ENABLED_SERVICES_FILE")
  if [ "$is_enabled" != "true" ]; then
    echo "⏭️  Skipping pre-deploy for $application (disabled)"
    i=$((i + 1))
    continue
  fi

  image="$DOCKER_REGISTRY/$application:latest"

  # Build extra envs string from YAML (may be empty)
  extra_envs=$(yq eval ".applications[$i].env[] | .name + \"=\" + .value" "$YAML_FILE" 2>/dev/null | tr '\n' ' ')

  echo ">>> Running pre deploy for $application"
  # Use eval to properly expand the env vars as separate arguments
  eval "set -- $extra_envs"
  run_pre_deploy_pod "darwin" "$image" "$application" "$@"
  
  echo ">>> Completed processing $application"
  i=$((i + 1))
done
