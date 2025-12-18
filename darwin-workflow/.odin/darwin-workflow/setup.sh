#!/bin/bash
set -e

echo "🔧 Darwin Workflow Setup"
echo "========================="
echo "Environment: ${ENV:-local}"
echo "Deployment Type: ${DEPLOYMENT_TYPE:-container}"

# Check if running in local/darwin-local mode
if [[ "$ENV" == "local" ]] || [[ "$ENV" == "darwin-local" ]]; then
  echo "🏠 Local development mode detected"
  echo "📦 Installing compute_sdk from darwin-compute submodule (if available)..."
  
  # Try to install compute_sdk from darwin-compute submodule
  DARWIN_COMPUTE_SDK_PATH="${BASE_DIR}/../darwin-compute/sdk"
  if [ -d "$DARWIN_COMPUTE_SDK_PATH" ]; then
    echo "  → Found darwin-compute submodule, installing compute_sdk..."
    bash "${BASE_DIR}/.odin/darwin-workflow/install-compute-sdk.sh" || {
      echo "  ⚠️  Failed to install from darwin-compute submodule"
      echo "  ℹ️  darwin_compute will be installed from PyPI via requirements.txt"
    }
  else
    echo "  → darwin-compute submodule not found"
    echo "  ℹ️  darwin_compute will be installed from PyPI via requirements.txt"
  fi
  
  # Install boto3 for pre-deploy script (S3 bucket setup)
  echo "📦 Installing boto3 for pre-deploy script..."
  pip3 install --quiet boto3 botocore elasticsearch || echo "⚠️  Failed to install boto3/elasticsearch"
  
  # Skip internal PyPI configuration for local mode
  echo "📋 Using public PyPI only for local development"
  
else
  echo "☁️  Production/Staging mode detected"
  
  # Install nfs client for mounting EFS (production only)
  if command -v apt-get &> /dev/null; then
    if command -v sudo &> /dev/null; then
      sudo apt-get update && sudo apt-get install -y nfs-common || echo "⚠️  Could not install nfs-common"
    else
      apt-get update && apt-get install -y nfs-common || echo "⚠️  Could not install nfs-common (no sudo)"
    fi
  fi
  
  echo "🔧 Configuring internal PyPI..."
  
  if [[ "$DD_ENV" == prod* ]] || [[ "$DD_ENV" == uat* ]]; then
    export INDEX_URL="http://pypi-server.darwin.dream11-k8s.local/"
    export TRUSTED_HOST="pypi-server.darwin.dream11-k8s.local"
    echo "Pip conf set for Production & UAT environment"
  else
    export INDEX_URL="http://pypi-server.darwin-d11-stag.local/"
    export TRUSTED_HOST="pypi-server.darwin-d11-stag.local"
    echo "Pip conf set for Staging & Development environment"
  fi
  
  echo "INDEX_URL: ${INDEX_URL}"
  echo "TRUSTED_HOST: ${TRUSTED_HOST}"
  
  # Create pip.conf (with or without sudo)
  mkdir -p /etc 2>/dev/null || true
  if command -v sudo &> /dev/null; then
    sudo mkdir -p /etc
    sudo tee /etc/pip.conf > /dev/null <<EOF
[global]
index-url = http://pypi.org/simple
extra-index-url= $INDEX_URL
trusted-host = $TRUSTED_HOST
               pypi.org
EOF
  else
    tee /etc/pip.conf > /dev/null <<EOF
[global]
index-url = http://pypi.org/simple
extra-index-url= $INDEX_URL
trusted-host = $TRUSTED_HOST
               pypi.org
EOF
  fi
  
  echo "✅ Internal PyPI configured"
fi

# Install application packages
if [[ "$DEPLOYMENT_TYPE" == "aws_ec2" ]]; then
  cd "${BASE_DIR}"/"${SERVICE_NAME}"
  echo "📦 Installing application packages (aws_ec2 mode)..."
  pip3 install -e app_layer/. --force-reinstall
  pip3 install -e core/. --force-reinstall
  pip3 install -e model/. --force-reinstall
  echo "✅ Application packages installed"
elif [[ "$DEPLOYMENT_TYPE" == "container" ]]; then
  cd "${BASE_DIR}"
  echo "📦 Installing application packages (container mode)..."
  # First install ALL dependencies from core/requirements.txt (including httpx)
  if [ -f "core/requirements.txt" ]; then
    echo "  → Installing core dependencies (including httpx)..."
    pip3 install -r core/requirements.txt --quiet || {
      echo "❌ Failed to install core dependencies from core/requirements.txt"
      echo "   Attempting to install httpx directly..."
      pip3 install httpx==0.23.3 || {
        echo "❌ Failed to install httpx directly"
        exit 1
      }
    }
  else
    echo "⚠️  core/requirements.txt not found, installing httpx directly..."
    pip3 install httpx==0.23.3 || {
      echo "❌ Failed to install httpx"
      exit 1
    }
  fi
  # Install core and model packages in editable mode (dependencies should already be installed)
  pip3 install -e core/. --no-deps --quiet || echo "⚠️  Failed to install core"
  pip3 install -e model/. --quiet || echo "⚠️  Failed to install model"
  # Install runtime dependencies from app_layer/requirements.txt (excluding editable deps)
  if [ -f "app_layer/requirements.txt" ]; then
    echo "  → Installing app_layer dependencies..."
    # Filter out editable dependencies and install the rest
    grep -v "^-e" app_layer/requirements.txt | pip3 install -r /dev/stdin --quiet || echo "⚠️  Failed to install some app_layer requirements"
  fi
  # Finally install app_layer in editable mode
  pip3 install -e app_layer/. --quiet || echo "⚠️  Failed to install app_layer"
  echo "✅ Application packages installed"
else
  echo "📦 Deployment type: $DEPLOYMENT_TYPE (skip manual package install)"
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Installed packages:"
pip3 list | grep -E "(darwin-compute|workflow)" || echo "No workflow packages found"