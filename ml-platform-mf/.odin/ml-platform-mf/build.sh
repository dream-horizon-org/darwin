#!/bin/sh
set -e

echo "Building ml-platform-mf..."
echo "Note: Dependencies and webpack build will happen inside Docker container"

# Create target directory
echo "Creating target directory..."
mkdir -p target/ml-platform-mf

# Copy necessary files to target directory
echo "Copying source files to target directory..."
cp -r src target/ml-platform-mf/
cp -r tests target/ml-platform-mf/
cp -r config target/ml-platform-mf/
cp -r pm2 target/ml-platform-mf/
cp -r s3 target/ml-platform-mf/
cp -r bitBucket target/ml-platform-mf/
cp -r assets target/ml-platform-mf/
cp -r gql-2-ts target/ml-platform-mf/
cp -r scripts target/ml-platform-mf/
cp package.json target/ml-platform-mf/
cp yarn.lock target/ml-platform-mf/
cp tsconfig.json target/ml-platform-mf/
cp tslint.json target/ml-platform-mf/
cp graphql.schema.json target/ml-platform-mf/
cp server.ts target/ml-platform-mf/
cp tracer.ts target/ml-platform-mf/
cp config.ts target/ml-platform-mf/
cp webpack.config.ts target/ml-platform-mf/
cp webpack.prod.config.ts target/ml-platform-mf/
cp jest.config.ts target/ml-platform-mf/
echo "Skipped node_modules, public (build artifacts), and other generated files - will be built in Docker layer"

echo "Config files in target:"
ls -la target/ml-platform-mf/config/

# Copy .odin directory to target
echo "Copying .odin directory..."
mkdir -p target/ml-platform-mf/.odin
cp -r .odin/ml-platform-mf/* target/ml-platform-mf/.odin/

echo "✅ Build completed successfully!"
echo "Dependencies will be installed and webpack build will run during Docker container setup"

