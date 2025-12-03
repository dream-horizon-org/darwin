#!/usr/bin/env bash
set -e

# During Docker build, we run as root, so no sudo needed
# Install system dependencies
echo "📦 Installing system dependencies..."
apt-get update -y
apt-get install --assume-yes \
  nfs-common \
  apt-utils \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  python3 \
  python3-pip \
  && rm -rf /var/lib/apt/lists/*

# Install Docker CLI (daemon will be started at runtime in start.sh)
echo "🐳 Installing Docker CLI..."
mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install --assume-yes --no-install-recommends \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
echo "📚 Installing Python dependencies..."
cd "$BASE_DIR" || exit 1
# Install in dependency order: model -> core -> app_layer
echo "  Installing model..."
pip3 install --no-cache-dir -e model/.
echo "  Installing core..."
pip3 install --no-cache-dir -e core/.
echo "  Installing app_layer..."
pip3 install --no-cache-dir -e app_layer/.
echo "✅ Python requirements installed"