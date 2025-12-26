# Darwin Serve Runtime - Scikit-learn
# Image: serve-md-runtime:sklearn

FROM python:3.10-slim-bookworm

LABEL maintainer="Darwin Team"
LABEL flavor="sklearn"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY flavors/sklearn/requirements.txt requirements.txt
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt && \
    rm requirements.txt

COPY src/ src/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthcheck')" || exit 1

CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers $(nproc) --timeout-keep-alive 75"]

