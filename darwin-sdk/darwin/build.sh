#!/bin/bash

set -e

# Defaults
SPARK_VERSION="3.5.0" # Default Spark version
# TODO: Add bump version logic based on latest version
BUILD_VERSION="1.0.0" # Default build version for the SDK

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -s|--spark-version)
      SPARK_VERSION="$2"
      shift
      ;;
    -b|--build-version)
      BUILD_VERSION="$2"
      shift
      ;;
    *)
      echo "❌ Unknown parameter passed: $1"
      echo "Usage: ./build.sh -s <spark.version> -b <build.version>"
      exit 1
      ;;
  esac
  shift
done

# Validate spark version is provided
if [ -z "$SPARK_VERSION" ]; then
  echo "❌ Spark version is required. Use -s or --spark-version"
  exit 1
fi

# Validate spark version is supported (only 3.5.0 is supported)
SUPPORTED_SPARK_VERSIONS=("3.5.0")
if [[ ! " ${SUPPORTED_SPARK_VERSIONS[@]} " =~ " ${SPARK_VERSION} " ]]; then
  echo "❌ Unsupported Spark version: $SPARK_VERSION"
  echo "   Supported versions: ${SUPPORTED_SPARK_VERSIONS[*]}"
  exit 1
fi

echo "🚀 Building Darwin SDK with:"
echo "   Spark version: $SPARK_VERSION"
echo "   SDK version:   $BUILD_VERSION"
echo

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JARS_DIR="$SCRIPT_DIR/darwin/jars"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
  echo "❌ Maven is not installed. Please install Maven first."
  exit 1
fi

# Clean jars directory
if [ -d "$JARS_DIR" ]; then
  echo "🧹 Cleaning $JARS_DIR ..."
  rm -f "$JARS_DIR"/*.jar
else
  mkdir -p "$JARS_DIR"
fi

# Download dependencies using Maven
echo "📦 Downloading dependencies via Maven for Spark $SPARK_VERSION ..."
cd "$SCRIPT_DIR"
mvn dependency:copy-dependencies \
  -DoutputDirectory="$JARS_DIR" \
  -DincludeScope=runtime \
  -Dspark.version="$SPARK_VERSION" \
  -q

JAR_COUNT=$(ls -1 "$JARS_DIR"/*.jar 2>/dev/null | wc -l | tr -d ' ')
echo "   Downloaded $JAR_COUNT jars"

# Update requirements.txt
echo "📋 Updating requirements.txt"
sed -i.bak '/^pyspark==/d' requirements.txt
echo -e "\npyspark==$SPARK_VERSION" >> requirements.txt
rm -f requirements.txt.bak

# Write spark version and build version to version.txt
echo "📄 Writing version info to version.txt"
echo "SPARK_VERSION=$SPARK_VERSION" > version.txt
echo "BUILD_VERSION=$BUILD_VERSION" >> version.txt

# Python sdist build
echo "📦 Building Python sdist with version: $SPARK_VERSION+$BUILD_VERSION ..."
python3 setup.py sdist

echo "✅ Build complete! Artifacts in ./dist"
