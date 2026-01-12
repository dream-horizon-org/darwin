#!/bin/sh
set -e

mkdir -p tmp
# Copy settings.xml if it exists, otherwise create a minimal one
if [ -f "$HOME/.m2/settings.xml" ]; then
  cp "$HOME/.m2/settings.xml" tmp/settings.xml
else
  # Create minimal settings.xml if it doesn't exist
  cat > tmp/settings.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
          http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <localRepository/>
  <interactiveMode/>
  <usePluginRegistry/>
  <offline/>
  <pluginGroups/>
  <servers/>
  <mirrors/>
  <proxies/>
  <profiles/>
  <activeProfiles/>
</settings>
EOF
fi

docker build \
  --build-arg JAVA_DOWNLOAD_URL_AMD64="https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.25%2B9/OpenJDK11U-jre_x64_linux_hotspot_11.0.25_9.tar.gz" \
  --build-arg JAVA_DOWNLOAD_URL_ARM64="https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.25%2B9/OpenJDK11U-jre_aarch64_linux_hotspot_11.0.25_9.tar.gz" \
  -t darwin/java:11-maven-bookworm-slim \
  --load .

rm -r ./tmp