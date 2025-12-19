#!/bin/bash
# Install compute_sdk from darwin-compute submodule
# This creates a compute_sdk wrapper that uses darwin_compute

set -e

COMPUTE_SDK_DIR="/tmp/compute_sdk_wrapper"
DARWIN_COMPUTE_SDK_PATH="${BASE_DIR}/../darwin-compute/sdk"

echo "🔧 Installing compute_sdk from darwin-compute submodule..."

# Check if darwin-compute submodule exists
if [ ! -d "$DARWIN_COMPUTE_SDK_PATH" ]; then
    echo "⚠️  darwin-compute submodule not found at $DARWIN_COMPUTE_SDK_PATH"
    echo "   darwin_compute will be installed from PyPI via requirements.txt"
    exit 0
fi

# Create a wrapper package that makes darwin_compute available as compute_sdk
mkdir -p "$COMPUTE_SDK_DIR/compute_sdk"

# Create __init__.py that imports from darwin_compute
cat > "$COMPUTE_SDK_DIR/compute_sdk/__init__.py" << 'EOF'
"""compute_sdk compatibility wrapper for darwin_compute"""
__version__ = "1.0.5"
EOF

# Create compute.py that imports ComputeCluster from darwin_compute
cat > "$COMPUTE_SDK_DIR/compute_sdk/compute.py" << 'EOF'
"""compute_sdk.compute compatibility wrapper"""
from darwin_compute.compute import ComputeCluster

__all__ = ['ComputeCluster']
EOF

# Create setup.py for the wrapper
cat > "$COMPUTE_SDK_DIR/setup.py" << EOF
from setuptools import setup

setup(
    name="compute_sdk",
    version="1.0.5",
    description="compute_sdk compatibility wrapper for darwin_compute",
    packages=["compute_sdk"],
    install_requires=[],
    python_requires=">=3.8",
)
EOF

# First install darwin-compute SDK and compute_model
echo "  → Installing darwin-compute SDK..."
cd "$DARWIN_COMPUTE_SDK_PATH"

# Install compute_model first (dependency)
if [ -d "../model" ]; then
    echo "  → Installing compute_model..."
    cd ../model
    # Install model dependencies first
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt || echo "⚠️  Some model dependencies may have failed, continuing..."
    fi
    pip3 install -e . || {
        echo "⚠️  compute_model installation failed"
        exit 1
    }
    cd "$DARWIN_COMPUTE_SDK_PATH"
fi

# Install darwin-compute SDK dependencies first
if [ -f "requirements.txt" ]; then
    echo "  → Installing darwin-compute SDK dependencies..."
    pip3 install -r requirements.txt || echo "⚠️  Some SDK dependencies may have failed, continuing..."
fi

# Install darwin-compute SDK
pip3 install -e . || {
    echo "⚠️  darwin-compute SDK installation failed"
    exit 1
}

# Now install the wrapper
echo "  → Installing compute_sdk wrapper..."
cd "$COMPUTE_SDK_DIR"
pip3 install -e . --no-deps

echo "✅ compute_sdk installed from darwin-compute (via compatibility wrapper)"

