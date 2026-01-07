# Darwin Serve Runtime

Default runtime image for one-click model deployments.

## Purpose

This image is used for:
1. **Main container**: Serving MLflow models via FastAPI
2. **Init container**: Downloading models from MLflow
3. **Cleanup job**: Managing model cache lifecycle

## Dependencies

### Core Runtime Dependencies
- `fastapi`: Web framework for serving predictions
- `mlflow`: Loading and serving MLflow models
- `uvicorn`: ASGI server

## Building the Image

```bash
cd ml-serve-app/runtime/darwin-serve-runtime
docker build -t localhost:5000/serve-md-runtime:latest .
docker push localhost:5000/serve-md-runtime:latest
```

## Verifying Dependencies

To check if the image has all required dependencies:

```bash
docker run --rm localhost:5000/serve-md-runtime:latest python -c "
import mlflow
print('✅ MLflow available')
"
```

## Configuration

The runtime is configured via environment variables:

### For Model Serving (Main Container)
- `MLFLOW_MODEL_URI`: MLflow model URI to serve
- `MODEL_LOCAL_PATH`: Local path where model is pre-downloaded (optional)
- `MLFLOW_TRACKING_URI`: MLflow tracking server URI
- `MLFLOW_TRACKING_USERNAME`: MLflow authentication username
- `MLFLOW_TRACKING_PASSWORD`: MLflow authentication password

### For Model Download (Init Container)
- `MODEL_URI`: MLflow model URI to download
- `OUTPUT_PATH`: Where to save the downloaded model (default: `/models`)
- `STORAGE_STRATEGY`: `emptydir` or `pvc` (for caching)
- `CACHE_PATH`: PVC cache location (default: `/model-cache`)
- `MAX_RETRIES`: Number of download retry attempts (default: 3)
- `BACKOFF_SECONDS`: Backoff between retries (default: 5)

### For Cache Cleanup (CronJob)
- `CACHE_PATH`: PVC cache location to clean up
- `NAMESPACE`: Kubernetes namespace to query for active pods
- `TTL_DAYS`: Delete cache entries older than this (default: 7)
- `MAX_SIZE_GB`: Optional max cache size limit (0 = unlimited)
- `DRY_RUN`: Set to "true" to test without deleting

## Usage

### One-Click Deployment

This image is automatically used when deploying models via:

```bash
hermes deploy-model \
  --serve-name my-model \
  --model-uri models:/my-model/Production \
  --artifact-version v1 \
  --cores 4 \
  --memory 8
```

### Custom Deployment

You can use this image directly in your Kubernetes deployments:

```yaml
spec:
  initContainers:
  - name: model-downloader
    image: localhost:5000/serve-md-runtime:latest
    command: [python, /scripts/download_model.py]
    env:
      - name: MODEL_URI
        value: "models:/my-model/Production"
      - name: STORAGE_STRATEGY
        value: "pvc"
  
  containers:
  - name: model-server
    image: localhost:5000/serve-md-runtime:latest
    env:
      - name: MODEL_LOCAL_PATH
        value: "/models"
```

## Troubleshooting

### Model Download Failures

Check init container logs:
```bash
kubectl logs <pod-name> -c model-downloader
```

Common issues:
- MLflow credentials not set
- Network connectivity to MLflow server
- Insufficient disk space

### Cache Cleanup Issues

Check CronJob logs:
```bash
kubectl logs job/<cleanup-job-name>
```

If cleanup doesn't remove old entries, ensure:
- The shared PVC is still mounted at the expected `CACHE_PATH`.
- The cronjob has read/write access to that PVC (node permissions, storage class).

