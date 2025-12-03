#!/bin/bash
set -e

echo "Running setup for ml-platform-mf..."

echo "Installing dependencies in Docker container..."
cd /app
# even if NODE_ENV=production is set
# Skip Puppeteer's Chromium download (not needed for build, only for tests)
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
yarn install --frozen-lockfile --production=false
echo "✓ Dependencies installed"

# Build webpack bundle (development mode for local k8s)
echo "Building webpack bundle..."
cd /app
yarn build
echo "✓ Webpack build completed successfully"

echo "Setup complete!"

