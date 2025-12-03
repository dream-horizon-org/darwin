FROM debian:bookworm-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
      curl wget xz-utils ca-certificates \
      && rm -rf /var/lib/apt/lists/*

ARG NODE_VERSION=20.16.0
ARG TARGETARCH

# Download and install Node.js (arch-aware)
RUN if [ "$TARGETARCH" = "amd64" ] || [ -z "$TARGETARCH" ]; then \
        NODE_ARCH="x64"; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
        NODE_ARCH="arm64"; \
    else \
        echo "Unsupported arch: $TARGETARCH" && exit 1; \
    fi \
    && NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" \
    && echo "Downloading Node.js from $NODE_URL" \
    && curl -fsSL "$NODE_URL" -o /tmp/node.tar.xz \
    && mkdir -p /opt/nodejs \
    && tar -C /opt/nodejs -xJf /tmp/node.tar.xz --strip-components=1 \
    && rm -f /tmp/node.tar.xz

# Set PATH for Node.js and install yarn globally
ENV PATH="/opt/nodejs/bin:$PATH"
RUN npm install -g yarn

# --- Final runtime image ---
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
      ca-certificates curl wget git \
      && rm -rf /var/lib/apt/lists/*

# Copy Node.js installation from builder
COPY --from=builder /opt/nodejs /opt/nodejs

# Set environment variables
ENV PATH="/opt/nodejs/bin:$PATH" \
    NODE_ENV="production" \
    NPM_CONFIG_LOGLEVEL="info"

CMD ["sh", "-c", "node --version && npm --version && yarn --version"]

