FROM python:3.10-slim-bookworm

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies first for better layer caching
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt && \
    rm requirements.txt

COPY . .

EXPOSE 8000

CMD ["bash", "-c", "uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers $(nproc) --timeout-keep-alive 75"]

