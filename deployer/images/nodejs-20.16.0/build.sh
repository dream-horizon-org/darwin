#!/bin/sh
set -e

docker build \
  -t darwin/nodejs:20.16.0-bookworm-slim \
  --load .

