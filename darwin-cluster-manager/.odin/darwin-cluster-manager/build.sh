#!/usr/bin/env bash

set -e # For enabling Exit on error

cp -rf ./app ./target/darwin-cluster-manager/app
cp -rf ./charts ./target/darwin-cluster-manager/charts
cp -rf ./constants ./target/darwin-cluster-manager/constants
cp -rf ./dto ./target/darwin-cluster-manager/dto
cp -rf ./logger ./target/darwin-cluster-manager/logger
cp -rf ./rest ./target/darwin-cluster-manager/rest
cp -rf ./services ./target/darwin-cluster-manager/services
cp -rf ./utils ./target/darwin-cluster-manager/utils
cp -rf ./go.mod ./target/darwin-cluster-manager/go.mod
cp -rf ./go.sum ./target/darwin-cluster-manager/go.sum
cp -rf ./main.go ./target/darwin-cluster-manager/main.go

# Create configs directory for runtime kubeconfig caching (downloaded from S3)
mkdir -p ./target/darwin-cluster-manager/configs
