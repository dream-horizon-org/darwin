#!/usr/bin/env bash
# CI Test Service build script
# This follows the Darwin .odin build pattern
#
# The build script is called by deployer/scripts/image-builder.sh
# from the base-path directory (.github/ci-test-service/)
#
# Note: The .odin scripts (setup.sh, start.sh) are copied by image-builder.sh
# to target/ci-test-service/.odin automatically.

set -e

echo "Building ci-test-service..."

# Create target directory
mkdir -p ./target/ci-test-service

# Copy application files
cp -f ./main.py ./target/ci-test-service/

echo "✅ ci-test-service build complete"
