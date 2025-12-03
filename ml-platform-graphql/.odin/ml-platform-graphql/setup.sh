#!/bin/bash
set -e

echo "Running setup for ml-platform-graphql..."

echo "Installing dependencies in Docker container..."
cd /app
# even if NODE_ENV=production is set
# Skip Puppeteer's Chromium download (not needed for build, only for tests)
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
yarn install --frozen-lockfile --production=false
echo "✓ Dependencies installed"

# Build TypeScript
echo "Compiling TypeScript..."
cd /app
yarn build
echo "✓ TypeScript compiled successfully"

echo "Setup complete!"

