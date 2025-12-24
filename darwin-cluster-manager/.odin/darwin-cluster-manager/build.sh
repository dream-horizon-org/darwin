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

# Copy the kind kubeconfig file to the target directory
mkdir -p ./target/darwin-cluster-manager/configs
# Path from darwin-cluster-manager/.odin/darwin-cluster-manager/ to root kind/config/
# Try multiple possible paths to handle different execution contexts
KUBECONFIG_SOURCE=""
if [ -f "../../kind/config/kindkubeconfig.yaml" ]; then
    KUBECONFIG_SOURCE="../../kind/config/kindkubeconfig.yaml"
elif [ -f "../../../kind/config/kindkubeconfig.yaml" ]; then
    KUBECONFIG_SOURCE="../../../kind/config/kindkubeconfig.yaml"
elif [ -f "../kind/config/kindkubeconfig.yaml" ]; then
    KUBECONFIG_SOURCE="../kind/config/kindkubeconfig.yaml"
elif [ -f "$(pwd)/../../kind/config/kindkubeconfig.yaml" ]; then
    KUBECONFIG_SOURCE="$(pwd)/../../kind/config/kindkubeconfig.yaml"
fi

if [ -n "$KUBECONFIG_SOURCE" ] && [ -f "$KUBECONFIG_SOURCE" ]; then
    cp "$KUBECONFIG_SOURCE" ./target/darwin-cluster-manager/configs/kind
else
    echo "⚠️  Warning: kindkubeconfig.yaml not found. Skipping kubeconfig copy."
    echo "   This may be expected if running outside of a Kind cluster setup"
    # Create an empty file to prevent sed from failing
    touch ./target/darwin-cluster-manager/configs/kind
fi

# Update the kubeconfig server address to use the in-cluster DNS name
# Use cross-platform sed syntax (works on both macOS and Linux)
if [ -f ./target/darwin-cluster-manager/configs/kind ] && [ -s ./target/darwin-cluster-manager/configs/kind ]; then
    # Detect OS and use appropriate sed syntax
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS requires empty string after -i
        sed -i '' 's|server: https://127\.0\.0\.1:[0-9]*|server: https://kubernetes.default.svc|' ./target/darwin-cluster-manager/configs/kind
    else
        # Linux doesn't need empty string
        sed -i 's|server: https://127\.0\.0\.1:[0-9]*|server: https://kubernetes.default.svc|' ./target/darwin-cluster-manager/configs/kind
    fi
    echo "✅ Updated kubeconfig server address"
else
    echo "⚠️  Warning: kubeconfig file not found or empty at ./target/darwin-cluster-manager/configs/kind"
    echo "   This may be expected if running outside of a Kind cluster setup"
fi
