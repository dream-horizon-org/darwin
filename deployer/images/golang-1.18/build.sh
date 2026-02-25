#!/bin/sh
set -e

docker build \
  -t darwin/golang-1.18-bookworm-slim:latest \
  --load .

