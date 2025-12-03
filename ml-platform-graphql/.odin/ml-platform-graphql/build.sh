#!/bin/sh
set -e

echo "Building ml-platform-graphql..."
echo "Note: Dependencies and TypeScript compilation will happen inside Docker container"

# Create target directory
echo "Creating target directory..."
mkdir -p target/ml-platform-graphql

# Copy necessary files to target directory
echo "Copying source files to target directory..."
cp -r src target/ml-platform-graphql/
cp -r logger target/ml-platform-graphql/
cp -r pm2 target/ml-platform-graphql/
cp package.json target/ml-platform-graphql/
cp yarn.lock target/ml-platform-graphql/
cp tsconfig.json target/ml-platform-graphql/
cp tslint.json target/ml-platform-graphql/
cp nodemon.json target/ml-platform-graphql/
cp env.template target/ml-platform-graphql/
cp server.ts target/ml-platform-graphql/
cp bootloader.ts target/ml-platform-graphql/
cp auth.ts target/ml-platform-graphql/
cp constants.ts target/ml-platform-graphql/
cp errorHandler.ts target/ml-platform-graphql/
cp instrumentation.ts target/ml-platform-graphql/

# Copy .odin directory to target
echo "Copying .odin directory..."
mkdir -p target/ml-platform-graphql/.odin
cp -r .odin/ml-platform-graphql/* target/ml-platform-graphql/.odin/

echo "✅ Build completed successfully!"
echo "Dependencies will be installed and TypeScript will be compiled during Docker container setup"
