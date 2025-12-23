#!/usr/bin/env bash

# Get the workflow directory (parent of .odin/darwin-workflow)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKFLOW_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Create target directory in the expected location for Docker build
mkdir -p "$WORKFLOW_DIR/target/darwin-workflow"

cp -rf "$WORKFLOW_DIR/app_layer" "$WORKFLOW_DIR/target/darwin-workflow/app_layer"
cp -rf "$WORKFLOW_DIR/core" "$WORKFLOW_DIR/target/darwin-workflow/core"
cp -rf "$WORKFLOW_DIR/model" "$WORKFLOW_DIR/target/darwin-workflow/model"
# Copy .odin/darwin-workflow contents to target/darwin-workflow/.odin (flatten structure)
mkdir -p "$WORKFLOW_DIR/target/darwin-workflow/.odin"
# Copy files from .odin/darwin-workflow, excluding target directory to avoid recursion
rsync -av --exclude='target' "$WORKFLOW_DIR/.odin/darwin-workflow/" "$WORKFLOW_DIR/target/darwin-workflow/.odin/" || \
  (cd "$WORKFLOW_DIR/.odin/darwin-workflow" && find . -mindepth 1 -maxdepth 1 ! -name target -exec cp -rf {} "$WORKFLOW_DIR/target/darwin-workflow/.odin/" \;)