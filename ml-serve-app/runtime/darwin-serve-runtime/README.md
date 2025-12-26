# Darwin Serve Runtime

Flavor-specific runtime images for one-click model deployments.

## Available Images

| Image Tag | Frameworks | Python |
|-----------|------------|--------|
| `serve-md-runtime:sklearn` | scikit-learn, scipy | 3.9 |
| `serve-md-runtime:boosting` | XGBoost, LightGBM, CatBoost | 3.9 |
| `serve-md-runtime:pytorch` | PyTorch (CPU) | 3.9 |
| `serve-md-runtime:tensorflow` | TensorFlow, Keras | 3.10 |

## Automatic Flavor Detection

When deploying a model via the `deploy-model` API, the system automatically:
1. Fetches the `MLmodel` file from MLflow
2. Detects the model flavor (sklearn, xgboost, pytorch, etc.)
3. Selects the appropriate runtime image

No manual image selection is required!

## Purpose

Each image is used for:
1. **Main container**: Serving MLflow models via FastAPI
2. **Init container**: Downloading models from MLflow
3. **Cleanup job**: Managing model cache lifecycle

## Directory Structure

```
darwin-serve-runtime/
├── src/                    # Shared application code
├── flavors/
│   ├── sklearn/           # scikit-learn image
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── boosting/          # XGBoost/LightGBM/CatBoost image
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── pytorch/           # PyTorch image
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── tensorflow/        # TensorFlow/Keras image
│       ├── Dockerfile
│       └── requirements.txt
└── README.md
```

## Building Images

Images are built automatically during `setup.sh`. To build manually:

```bash
cd ml-serve-app/runtime/darwin-serve-runtime

# Build sklearn image
docker build -t localhost:5000/serve-md-runtime:sklearn -f flavors/sklearn/Dockerfile .

# Build all flavors
for flavor in sklearn boosting pytorch tensorflow; do
  docker build -t localhost:5000/serve-md-runtime:$flavor -f flavors/$flavor/Dockerfile .
  docker push localhost:5000/serve-md-runtime:$flavor
done
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

Deploy a model and the correct image is automatically selected:

```bash
hermes deploy-model \
  --serve-name my-model \
  --model-uri models:/my-model/Production \
  --artifact-version v1 \
  --cores 4 \
  --memory 8
```

### Manual Deployment

If deploying manually, select the appropriate image for your model:

```yaml
spec:
  initContainers:
  - name: model-downloader
    image: localhost:5000/serve-md-runtime:sklearn  # or :boosting, :pytorch, :tensorflow
    command: [python, /scripts/download_model.py]
    env:
      - name: MODEL_URI
        value: "models:/my-model/Production"
      - name: STORAGE_STRATEGY
        value: "pvc"
  
  containers:
  - name: model-server
    image: localhost:5000/serve-md-runtime:sklearn
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

### Wrong Image Selected

If the wrong image is selected for your model:
1. Check the `MLmodel` file in your model artifacts
2. Ensure it contains the correct flavor in the `flavors` section
3. The flavor detection prioritizes: xgboost/lightgbm/catboost → sklearn → pytorch/tensorflow

Check CronJob logs:
```bash
kubectl logs job/<cleanup-job-name>
```

If cleanup doesn't remove old entries, ensure:
- The shared PVC is still mounted at the expected `CACHE_PATH`.
- The cronjob has read/write access to that PVC (node permissions, storage class).

