#!/bin/sh
set -e

env_vars=""

while getopts a:p:t:e:r:B: flag
do
    case "${flag}" in
        a) application=${OPTARG};;
        p) path=${OPTARG};;
        t) base_path=${OPTARG};;
        e) base_image=${OPTARG};;
        r) registry=${OPTARG};;
        B) env_vars=${OPTARG};;
    esac
done

if [[ -z "$application" ]]; then
    echo 'Missing option -a (application name)' >&2
    exit 1
fi

if [[ -z "$path" ]]; then
    echo 'Missing option -p (path to application directory)' >&2
    exit 1
fi

if [[ -z "$base_path" ]]; then
    echo 'Missing option -t (base_path to application directory)' >&2
    exit 1
fi

cur_dir=$(pwd)
cd $base_path

echo "application: $application";
echo "path: $path";
echo "base_path: $base_path";
echo "base_image: $base_image";
echo "registry: $registry";
echo "dynamic env_vars: $env_vars";

rm -rf $path/target
mkdir -p -m 755 $path/target/$application/.odinst

echo "Building $application using build.sh"
bash .odin/$application/build.sh

cp -r .odin/$application/. $path/target/$application/.odin

chmod 755 $path/target/$application/.odin
cd "$cur_dir"

# Select Dockerfile based on base image type
if echo "$base_image" | grep -q "golang"; then
  DOCKERFILE="deployer/images/Dockerfile-golang"
  echo "Using Go multi-stage Dockerfile for $application"
else
  DOCKERFILE="deployer/images/Dockerfile"
fi

docker build \
  --build-arg BASE_IMAGE=$base_image \
  --build-arg APP_NAME=$application \
  --build-arg APP_BASE_DIR=$base_path \
  --build-arg APP_DIR=$path \
  --build-arg EXTRA_ENV_VARS="$env_vars" \
  -t $application:latest \
  -f $DOCKERFILE .
  
docker tag "$application":latest "$registry/$application":latest
docker push "$registry/$application":latest
