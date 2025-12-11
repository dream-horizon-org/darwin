# Lightweight Go build image - optimized for static binary compilation
# Use official golang alpine for minimal footprint (~300MB vs ~1GB)
FROM golang:1.18-alpine

# Install only essential build dependencies
RUN apk add --no-cache \
    ca-certificates \
    git \
    bash \
    curl

# Create GOPATH directory
RUN mkdir -p /go/bin /go/src /go/pkg

ENV GO111MODULE=on \
    CGO_ENABLED=0

CMD ["sh", "-c", "go version && go env"]
