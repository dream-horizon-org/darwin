#!/bin/sh
set -e

docker build \
  -t darwin/python-3.9.7-pip-bookworm-slim:latest \
  --load .
