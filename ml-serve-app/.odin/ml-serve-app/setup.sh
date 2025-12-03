#!/usr/bin/env bash
set -e

# Requirements installation
# Note: Files are copied directly to BASE_DIR (/app/), not BASE_DIR/SERVICE_NAME
# So app_layer, core, model are directly in BASE_DIR

echo "📦 Installing system dependencies..."
apt-get update -y
# Install git and build dependencies needed for compiling Python packages (e.g., psutil)
apt-get install --assume-yes \
  git \
  gcc \
  g++ \
  python3-dev \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

cd "$BASE_DIR" || exit 1

echo "⬆️  Upgrading pip..."
pip3 install --upgrade pip

echo "📚 Installing Python packages..."
echo "  Installing model..."
pip3 install --no-cache-dir -e model/.

echo "  Installing core..."
pip3 install --no-cache-dir -e core/.

echo "  Installing app_layer..."
pip3 install --no-cache-dir -e app_layer/.

echo "🧹 Cleaning up build dependencies to reduce image size..."
# Remove build dependencies after installation to reduce final image size
apt-get purge -y \
  gcc \
  g++ \
  python3-dev \
  build-essential \
  && apt-get autoremove -y \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

echo "✅ Requirements installed successfully"