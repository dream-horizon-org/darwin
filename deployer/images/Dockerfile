# Dockerfile
ARG BASE_IMAGE=debian:bookworm-slim
FROM ${BASE_IMAGE} AS base

ARG APP_NAME
ARG APP_BASE_DIR
ARG APP_DIR
ARG EXTRA_ENV_VARS
WORKDIR /app/

# Append BASE_DIR, SERVICE_NAME, DEPLOYMENT_TYPE, APP_DIR to EXTRA_ENV_VARS
ENV EXTRA_ENV_VARS_FINAL="${EXTRA_ENV_VARS}|SERVICE_NAME=${APP_NAME}|APP_DIR=${APP_DIR}"
RUN echo "EXTRA_ENV_VARS_FINAL: ${EXTRA_ENV_VARS_FINAL}"

COPY ${APP_BASE_DIR}/${APP_DIR}/target/${APP_NAME}/. /app/

RUN chmod +x /app/.odin/*.sh 2>/dev/null || true

# Run setup.sh if it exists
# Set environment variables needed by setup.sh
ENV BASE_DIR=/app
ENV DEPLOYMENT_TYPE=container
# Set ENV=local by default for Docker builds (can be overridden via EXTRA_ENV_VARS)
ENV ENV=local

RUN if [ -f "/app/.odin/setup.sh" ]; then \
      env $(echo ${EXTRA_ENV_VARS_FINAL} | tr '|' ' ') bash -x /app/.odin/setup.sh; \
    fi

# Entrypoint
ENTRYPOINT ["bash", "-c", "/app/.odin/start.sh"]
