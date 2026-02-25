# Minimal CI Test Service Dockerfile
# Used for infrastructure CI validation

FROM python:3.9-slim

WORKDIR /app

# Install only required dependencies
RUN pip install --no-cache-dir fastapi uvicorn

# Copy application
COPY main.py .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthcheck')" || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
