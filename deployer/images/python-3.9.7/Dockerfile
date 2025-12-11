# Use official Python slim image - already optimized (~45MB base)
FROM python:3.9.7-slim-bullseye

# Install only essential runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      default-mysql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Upgrade pip with no cache
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

CMD ["sh", "-c", "python3 --version && pip --version"]
