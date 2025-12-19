# Darwin MLflow Platform

A comprehensive MLflow platform implementation, providing experiment tracking, model management, and ML lifecycle management capabilities.

## ⚖️ Attribution

This project contains a modified version of [Apache MLflow](https://github.com/mlflow/mlflow), originally developed by Databricks, Inc. and licensed under the Apache License 2.0.

**Original Work:**
- Project: Apache MLflow
- Copyright: 2018 Databricks, Inc.
- License: Apache License 2.0
- Repository: https://github.com/mlflow/mlflow

**Modifications by DS Horizon:**

This Darwin MLflow Platform builds upon the original MLflow codebase with the following key modifications:
- Custom authentication and authorization layer
- Integration with Darwin's user management and permissions system
- Custom experiment and run management APIs
- Customized UI integration and proxy layer
- S3 bucket initialization utilities
- Integration with Darwin's MySQL database for metadata storage

All modifications are provided under the terms of the Apache License 2.0, maintaining full attribution to the original MLflow authors. See the [LICENSE](LICENSE) and [NOTICE](NOTICE) files for complete details.

## 📋 Table of Contents

- [Overview](#overview)
- [MLflow Version](#mlflow-version)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Integration with Darwin Services](#integration-with-darwin-services)
- [Training Models with MLflow in Workspace](#training-models-with-mlflow-in-workspace)
- [Deploying Models from MLflow to Serve](#deploying-models-from-mlflow-to-serve)
- [Complete End-to-End Workflow](#complete-end-to-end-workflow)
- [MLflow SDK Reference](#mlflow-sdk-reference)
- [Examples](#examples)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)


## 🎯 Overview

This MLflow platform consists of two main components:

1.  **MLflow App Layer** (`app_layer/`) - A FastAPI-based web application that provides REST APIs and a UI for MLflow operations.
2.  **MLflow SDK** (`sdk/`) - A Python SDK wrapper around MLflow for easy integration with ML workflows.

This platform enables teams to:
- Track ML experiments and runs
- Manage model versions and artifacts
- Collaborate on ML projects
- Monitor model performance
- Deploy models to production

## 🔢 MLflow Version

- **MLflow Core**: `2.12.2`
- **Python**: `3.9.7`

## 📁 Project Structure

```
mlflow/
├── app_layer/                    # FastAPI application layer
│   ├── src/mlflow_app_layer/     # Main application source code
│   │   ├── controllers/          # API controllers
│   │   ├── dao/                  # Data access objects
│   │   ├── models/               # Pydantic models
│   │   ├── service/              # Business logic services
│   │   ├── util/                 # Utility functions
│   │   ├── config/               # Configuration constants
│   │   └── static-files/         # Frontend static files
│   ├── requirements.txt          # Production dependencies
│   ├── requirements_dev.txt      # Development dependencies
│   └── setup.py                  # Package setup
├── sdk/                          # MLflow SDK wrapper
│   ├── mlflow_sdk/               # SDK source code
│   ├── requirements.txt          # SDK dependencies
│   └── setup.py                  # SDK package setup
└── tests/                        # Test files
```

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   REST APIs     │    │   MLflow Core   │
│   (Static)      │◄──►│   (FastAPI)     │◄──►│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MySQL DB      │
                       │   (Metadata)    │
                       └─────────────────┘
```

### Component Details

1.  **App Layer (Port 8000)**
    - FastAPI-based REST API server
    - Serves MLflow UI static files
    - Handles authentication and authorization
    - Proxies requests to MLflow backend
    - Manages experiment permissions

2.  **MLflow Backend (Port 8080)**
    - Core MLflow tracking server
    - Handles experiment and run management
    - Manages model registry
    - Stores artifacts and metadata

3.  **MySQL Database**
    - Stores experiment permissions
    - User management data
    - Custom metadata

## 🔗 Integration with Darwin Services

MLflow serves as the central hub for experiment tracking and model management in the Darwin platform, seamlessly integrating with Workspace for model training and ML Serve for production deployment.

### Service Integration Flow

```mermaid
flowchart LR
    Workspace[Workspace/Jupyter] -->|Train & Track| MLflow[MLflow Tracking]
    MLflow -->|Store Artifacts| S3[S3/Artifact Store]
    MLflow -->|Register Model| Registry[Model Registry]
    Registry -->|Model URI| Serve[ML Serve]
    Serve -->|Deploy| K8s[Kubernetes Pods]
```

### How It Works

**1. Model Training (Workspace)**
- Data scientists work in Jupyter notebooks within Darwin Workspace
- MLflow SDK tracks experiments, parameters, metrics, and artifacts
- Models are automatically versioned and stored in the artifact store
- Each training run gets a unique run ID and experiment ID

**2. Model Storage**
- Artifacts (models, plots, data) are stored in S3 or compatible storage
- Metadata (parameters, metrics, tags) is stored in MySQL database
- Model Registry maintains versions and stages (staging, production)

**3. Model Deployment (ML Serve)**
- Models are referenced by their MLflow URI: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`
- ML Serve fetches models from MLflow using the URI
- Pre-built runtime (`serve-md-runtime`) handles model loading automatically
- Deployed models serve predictions via REST API

### Key Concepts

**Experiments**: Logical grouping of related runs (e.g., "house_pricing", "fraud_detection")

**Runs**: Individual training executions with specific hyperparameters and results

**Artifacts**: Files produced during training (models, plots, datasets, etc.)

**Model URI**: Unique identifier for a trained model, used for deployment
- Format: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`
- Example: `mlflow-artifacts:/45/abc123def456/artifacts/model`

**Model Registry**: Central repository for managing model versions and lifecycle stages

### Service URLs (Kubernetes)

When deployed in the Darwin ecosystem:
- **MLflow Tracking Server**: `http://darwin-mlflow-lib.darwin.svc.cluster.local:8080`
- **MLflow App Layer**: `http://darwin-mlflow-app.darwin.svc.cluster.local:8000`
- **ML Serve**: `http://darwin-ml-serve-app.darwin.svc.cluster.local:8000`

## 🎓 Training Models with MLflow in Workspace

### Darwin-Specific Setup

**Authentication (Required for Darwin MLflow)**

```python
import os
import mlflow

# Darwin MLflow requires authentication
os.environ["MLFLOW_TRACKING_USERNAME"] = "your.email@company.com"
os.environ["MLFLOW_TRACKING_PASSWORD"] = "your.email@company.com"

# Set tracking URI to Darwin MLflow service
mlflow.set_tracking_uri("http://darwin-mlflow-lib.darwin.svc.cluster.local:8080")
```

**Model Logging (Darwin-Specific Pattern)**

Darwin MLflow requires using `tempfile` and `log_artifacts` instead of direct model logging:

```python
import tempfile
from mlflow.models import infer_signature

with mlflow.start_run():
    # Train your model...
    
    # Darwin-specific: Use tempfile + log_artifacts
    signature = infer_signature(X_train, model.predict(X_train))
    
    with tempfile.TemporaryDirectory() as tmpdir:
        local_path = os.path.join(tmpdir, "model")
        mlflow.sklearn.save_model(model, local_path, signature=signature)
        mlflow.log_artifacts(local_path, artifact_path="model")  # Required for Darwin
    
    # Get model URI for deployment
    run_id = mlflow.active_run().info.run_id
    experiment_id = mlflow.active_run().info.experiment_id
    model_uri = f"mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model"
```

> **📚 For standard MLflow usage**, see [MLflow 2.12.2 Documentation](https://mlflow.org/docs/2.12.2/index.html)
> 
> **💡 For complete Darwin examples**, see [`examples/house-price-prediction/`](../examples/house-price-prediction/) and [`examples/iris-classification/`](../examples/iris-classification/)

## 🚀 Deploying Models from MLflow to Serve

Once your model is trained and logged to MLflow, you can deploy it to production using Darwin ML Serve.

### Understanding Model URIs

MLflow models are referenced using URIs that point to their storage location:

**Format**: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`

**Example**: `mlflow-artifacts:/45/abc123def456789/artifacts/model`

**Finding Your Model URI**:
1. Open MLflow UI: `http://localhost/mlflow` (or your MLflow URL)
2. Navigate to your experiment
3. Click on the run you want to deploy
4. Copy the Run ID from the run details page
5. Note the Experiment ID from the breadcrumb or URL
6. Construct the URI: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`

**Alternative URI Formats**:
- `runs:/{run_id}/model` - References a model from a specific run
- `models:/{model_name}/{version}` - References a registered model version
- `mlflow-artifacts:/...` - Direct artifact store path (recommended for deployment)

### One-Click Deployment

The simplest way to deploy an MLflow model is using the one-click deployment API.

**How It Works**:
1. ML Serve uses the pre-built `serve-md-runtime` image
2. The runtime image contains MLflow model loading capabilities
3. Your model URI is passed as an environment variable
4. The runtime fetches and loads the model at startup
5. The model is deployed to Kubernetes and ready to serve predictions

**Deployment Request**:

```bash
curl -X POST "http://localhost/ml-serve/api/v1/serve/deploy-model" \
  -H "Content-Type: application/json" \
  -d '{
    "serve_name": "house-pricing-model",
    "artifact_version": "v1.0",
    "model_uri": "mlflow-artifacts:/45/abc123def456789/artifacts/model",
    "env": "local",
    "cores": 2,
    "memory": 4,
    "node_capacity": "spot",
    "min_replicas": 1,
    "max_replicas": 3
  }'
```

**Parameters**:
- `serve_name`: Name for your deployment (optional, auto-generated if omitted)
- `artifact_version`: Version label for tracking (e.g., "v1.0", "v2.1")
- `model_uri`: MLflow model URI (from previous step)
- `env`: Environment name (must exist, e.g., "local", "prod")
- `cores`: CPU cores per pod (e.g., 2, 4, 8)
- `memory`: Memory in GB per pod (e.g., 4, 8, 16)
- `node_capacity`: Node type ("spot" or "on-demand")
- `min_replicas`: Minimum number of pods (for auto-scaling)
- `max_replicas`: Maximum number of pods (for auto-scaling)

### Using Hermes CLI

The Hermes CLI provides a convenient command-line interface for deployment:

**1. Configure Hermes** (one-time setup):
```bash
export HERMES_USER_TOKEN=admin-token-default-change-in-production
hermes configure
```

**2. Create Environment** (if not exists):
```bash
hermes create-environment \
  --name local \
  --domain-suffix .local \
  --cluster-name kind \
  --namespace darwin
```

**3. Deploy Model**:
```bash
hermes deploy-model \
  --serve-name house-pricing-model \
  --artifact-version v1.0 \
  --model-uri "mlflow-artifacts:/45/abc123def456789/artifacts/model" \
  --cores 2 \
  --memory 4 \
  --node-capacity spot \
  --min-replicas 1 \
  --max-replicas 3
```

**4. Check Deployment Status**:
```bash
# List all deployments
kubectl get deployments -n darwin

# Check pod status
kubectl get pods -n darwin | grep house-pricing-model

# View logs
kubectl logs -n darwin deployment/house-pricing-model-local
```

### Testing Deployed Models

Once deployed, your model is accessible via a REST API endpoint.

**Finding Your Endpoint URL**:
- **Local (kind cluster)**: `http://localhost/{serve-name}-{env}/predict`
- **Example**: `http://localhost/house-pricing-model-local/predict`

**Making Predictions**:

```python
import requests
import json

# Prediction endpoint
url = "http://localhost/house-pricing-model-local/predict"

# Sample input (California Housing features)
payload = {
    "features": {
        "MedInc": 3.5,
        "HouseAge": 15.0,
        "AveRooms": 5.5,
        "AveBedrms": 1.2,
        "Population": 1200.0,
        "AveOccup": 3.0,
        "Latitude": 37.5,
        "Longitude": -122.3
    }
}

# Send prediction request
response = requests.post(url, json=payload)
prediction = response.json()

print(f"Predicted house price: ${prediction['prediction']:.2f} (hundred thousands)")
```

**Using curl**:
```bash
curl -X POST "http://localhost/house-pricing-model-local/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "MedInc": 3.5,
      "HouseAge": 15.0,
      "AveRooms": 5.5,
      "AveBedrms": 1.2,
      "Population": 1200.0,
      "AveOccup": 3.0,
      "Latitude": 37.5,
      "Longitude": -122.3
    }
  }'
```

**Accessing Swagger UI**:

Navigate to `http://localhost/house-pricing-model-local/docs` to access the interactive API documentation.

> **Note**: Swagger UI requires your FastAPI app to use the `ROOT_PATH` environment variable. The Darwin runtime handles this automatically.

### Undeploying Models

**Using Hermes CLI**:
```bash
hermes undeploy-model \
  --serve-name house-pricing-model \
  --artifact-version v1.0
```

**Using API**:
```bash
curl -X POST "http://localhost/ml-serve/api/v1/serve/undeploy-model" \
  -H "Content-Type: application/json" \
  -d '{
    "serve_name": "house-pricing-model",
    "artifact_version": "v1.0",
    "env": "local"
  }'
```

## 🔄 Complete End-to-End Workflow

This section walks through the entire ML lifecycle from training to production deployment.

### Workflow Overview

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant WS as Workspace
    participant MLflow as MLflow
    participant Serve as ML Serve
    participant K8s as Kubernetes
    
    Dev->>WS: Launch Jupyter
    Dev->>WS: Train model
    WS->>MLflow: Log params/metrics
    WS->>MLflow: Save model artifacts
    WS->>MLflow: Register model
    MLflow-->>Dev: Return model URI
    Dev->>Serve: Deploy model (with URI)
    Serve->>K8s: Create deployment
    K8s-->>Serve: Deployment ready
    Serve-->>Dev: Endpoint URL
    Dev->>K8s: Send prediction request
    K8s-->>Dev: Return prediction
```

### Step-by-Step Guide

**Step 1: Launch Workspace Environment**

```bash
# Create or access your Jupyter workspace
# This is typically done through the Darwin UI or Workspace API
```

**Step 2: Train and Track Model**

In your Jupyter notebook:

```python
import os
import mlflow
import mlflow.sklearn
from mlflow import set_tracking_uri, set_experiment
from mlflow.client import MlflowClient
from sklearn.ensemble import RandomForestRegressor
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
import tempfile

# Configure MLflow
os.environ["MLFLOW_TRACKING_USERNAME"] = "your.email@company.com"
os.environ["MLFLOW_TRACKING_PASSWORD"] = "your.email@company.com"
set_tracking_uri("http://darwin-mlflow-lib.darwin.svc.cluster.local:8080")
set_experiment("house_pricing_production")

# Load data
data = fetch_california_housing(as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

# Train and log
with mlflow.start_run(run_name="production_model_v1"):
    model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
    model.fit(X_train, y_train)
    
    # Log metrics
    from sklearn.metrics import mean_squared_error, r2_score
    y_pred = model.predict(X_test)
    mlflow.log_metric("rmse", mean_squared_error(y_test, y_pred, squared=False))
    mlflow.log_metric("r2", r2_score(y_test, y_pred))
    
    # Log model
    from mlflow.models import infer_signature
    signature = infer_signature(X_train, model.predict(X_train))
    
    with tempfile.TemporaryDirectory() as tmpdir:
        local_path = os.path.join(tmpdir, "model")
        mlflow.sklearn.save_model(
            model, local_path, 
            signature=signature,
            input_example=X_test.head(1)
        )
        mlflow.log_artifacts(local_path, artifact_path="model")
    
    run_id = mlflow.active_run().info.run_id
    experiment_id = mlflow.active_run().info.experiment_id
    
    print(f"✅ Model trained successfully!")
    print(f"📋 Run ID: {run_id}")
    print(f"📋 Experiment ID: {experiment_id}")
```

**Step 3: Register Model in Model Registry**

```python
# Register model
client = MlflowClient()
model_name = "HousePricingProduction"

try:
    client.create_registered_model(model_name)
except:
    pass  # Model already exists

version = client.create_model_version(
    name=model_name,
    source=f"runs:/{run_id}/model",
    run_id=run_id
)

print(f"✅ Model registered as {model_name} version {version.version}")
```

**Step 4: Copy Model URI**

```python
model_uri = f"mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model"
print(f"\n📦 Model URI for deployment:")
print(f"   {model_uri}")
print(f"\n💡 Copy this URI for the next step!")
```

**Step 5: Deploy Model**

Open a terminal and run:

```bash
hermes deploy-model \
  --serve-name house-pricing-prod \
  --artifact-version v1.0 \
  --model-uri "mlflow-artifacts:/45/abc123def456789/artifacts/model" \
  --cores 4 \
  --memory 8 \
  --node-capacity on-demand \
  --min-replicas 2 \
  --max-replicas 10
```

**Step 6: Verify Deployment**

```bash
# Check deployment status
kubectl get deployments -n darwin | grep house-pricing-prod

# Check pods
kubectl get pods -n darwin | grep house-pricing-prod

# View logs
kubectl logs -n darwin -l app=house-pricing-prod-local --tail=50
```

**Step 7: Test the Endpoint**

```python
import requests

url = "http://localhost/house-pricing-prod-local/predict"

test_data = {
    "features": {
        "MedInc": 3.5,
        "HouseAge": 15.0,
        "AveRooms": 5.5,
        "AveBedrms": 1.2,
        "Population": 1200.0,
        "AveOccup": 3.0,
        "Latitude": 37.5,
        "Longitude": -122.3
    }
}

response = requests.post(url, json=test_data)
print(f"Prediction: {response.json()}")
```

### Practical Example: House Price Prediction

This example demonstrates the complete workflow using the California Housing dataset.

**Training Script** (in Jupyter):

See the complete example in [`examples/house-price-prediction/train_house_pricing_model.ipynb`](../examples/house-price-prediction/train_house_pricing_model.ipynb)

**Deployment Command**:

```bash
hermes deploy-model \
  --serve-name california-housing \
  --artifact-version v1.0 \
  --model-uri "mlflow-artifacts:/45/abc123def456789/artifacts/model" \
  --cores 2 \
  --memory 4 \
  --node-capacity spot \
  --min-replicas 1 \
  --max-replicas 5
```

**Testing**:

```python
import requests

response = requests.post(
    "http://localhost/california-housing-local/predict",
    json={
        "features": {
            "MedInc": 8.3252,
            "HouseAge": 41.0,
            "AveRooms": 6.98,
            "AveBedrms": 1.02,
            "Population": 322.0,
            "AveOccup": 2.55,
            "Latitude": 37.88,
            "Longitude": -122.23
        }
    }
)

print(f"Predicted price: ${response.json()['prediction'] * 100000:.2f}")
```

### Troubleshooting Common Issues

**Issue: "Model URI not found"**
- Verify the experiment ID and run ID are correct
- Check that artifacts were logged successfully in MLflow UI
- Ensure the model path is `artifacts/model` (not just `model`)

**Issue: "Deployment failed - insufficient resources"**
- Reduce `cores` or `memory` requirements
- Check cluster capacity: `kubectl describe nodes`

**Issue: "Prediction endpoint returns 404"**
- Verify the endpoint URL format: `http://localhost/{serve-name}-{env}/predict`
- Check pod status: `kubectl get pods -n darwin`
- View pod logs: `kubectl logs -n darwin <pod-name>`

**Issue: "Model loading fails at startup"**
- Verify MLflow credentials are set correctly
- Check that the model URI is accessible from the pod
- Ensure the model was saved with `mlflow.log_artifacts()` (not `mlflow.sklearn.log_model()` directly)

**Issue: "Input validation error"**
- Ensure your input matches the model signature
- Check the input example in MLflow UI for the expected format
- Verify all required features are included in the request

## 📚 Darwin MLflow SDK

### Key Differences from Standard MLflow

Darwin MLflow is based on MLflow 2.12.2 with these Darwin-specific requirements:

**1. Authentication Required**
```python
os.environ["MLFLOW_TRACKING_USERNAME"] = "your.email@company.com"
os.environ["MLFLOW_TRACKING_PASSWORD"] = "your.email@company.com"
```

**2. Use `tempfile` + `log_artifacts` for Model Logging**
```python
# ❌ Don't use direct logging (won't work with Darwin MLflow)
mlflow.sklearn.log_model(model, "model")

# ✅ Use tempfile + log_artifacts pattern
with tempfile.TemporaryDirectory() as tmpdir:
    path = os.path.join(tmpdir, "model")
    mlflow.sklearn.save_model(model, path, signature=signature)
    mlflow.log_artifacts(path, artifact_path="model")
```

**3. Model URI Format for Deployment**
```python
# Use this format for ML Serve deployment
model_uri = f"mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model"
```

> **📚 For all other MLflow operations**, refer to the official [MLflow 2.12.2 Documentation](https://mlflow.org/docs/2.12.2/index.html)

## 📖 Examples

For complete, working examples of MLflow integration with training and deployment workflows, see the [`examples/`](../examples/) directory:

- **[House Price Prediction](../examples/house-price-prediction/)** - Random Forest regression with California Housing dataset
- **[Iris Classification](../examples/iris-classification/)** - Multi-class classification example

Each example includes:
- Complete Jupyter notebook with MLflow tracking
- Model training, logging, and registration
- Deployment instructions and sample payloads

## 🔧 Prerequisites

- Python 3.9.7+
- MySQL 8.0+
- Git
- A virtual environment tool (like `venv`)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mlflow
```

### 2. Set Up Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Database Configuration
export VAULT_SERVICE_MYSQL_USERNAME=your_username
export VAULT_SERVICE_MYSQL_PASSWORD=your_password
export CONFIG_SERVICE_MYSQL_DATABASE=darwin
export CONFIG_SERVICE_MYSQL_MASTERHOST=localhost

# MLflow Configuration
export VAULT_SERVICE_MLFLOW_ADMIN_USERNAME=admin
export VAULT_SERVICE_MLFLOW_ADMIN_PASSWORD=admin_password
export CONFIG_SERVICE_S3_PATH=s3://your-mlflow-bucket

# Application URLs
export MLFLOW_UI_URL="http://localhost:8080"
export MLFLOW_APP_LAYER_URL="http://localhost:8000"
```

### 3. Install Dependencies

#### For App Layer:

```bash
cd app_layer
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements_dev.txt
pip install -e .
```

#### For SDK:

```bash
cd sdk
pip install -e .
```

## 🏃‍♂️ Running the Project

### Local Development

#### 1. Start the App Layer

```bash
cd app_layer
source venv/bin/activate
uvicorn src.mlflow_app_layer.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start MLflow Backend (Separate Terminal)

```bash
mlflow server --backend-store-uri mysql://username:password@localhost:3306/darwin \
               --default-artifact-root s3://your-bucket \
               --host 0.0.0.0 --port 8080
```

### Manual Local Development

#### 1. Start the App Layer

```bash
cd app_layer
source venv/bin/activate
uvicorn src.mlflow_app_layer.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start the MLflow Backend (in a separate terminal)

```bash
# Ensure you have activated the venv from the app_layer
mlflow server --backend-store-uri mysql+pymysql://${VAULT_SERVICE_MYSQL_USERNAME}:${VAULT_SERVICE_MYSQL_PASSWORD}@${DARWIN_MYSQL_HOST}:${MYSQL_PORT}/${CONFIG_SERVICE_MYSQL_DATABASE} \
               --default-artifact-root ${MLFLOW_ARTIFACT_STORE} \
               --host 0.0.0.0 --port 8080
```

### Access the Application

-   **App Layer UI**: [http://localhost:8000](http://localhost:8000)
-   **MLflow Backend**: [http://localhost:8080](http://localhost:8080)
-   **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

## 📚 API Documentation

### Core Endpoints

#### Experiments
- `GET /experiments` - MLflow UI
- `GET /v1/experiment/{experiment_id}` - Get experiment details
- `POST /v1/experiment` - Create new experiment
- `PUT /v1/experiment/{experiment_id}` - Update experiment
- `DELETE /v1/experiment/{experiment_id}` - Delete experiment

#### Runs
- `GET /v1/experiment/{experiment_id}/run/{run_id}` - Get run details
- `POST /v1/experiment/{experiment_id}/run` - Create new run
- `DELETE /v1/experiment/{experiment_id}/run/{run_id}` - Delete run
- `POST /v1/run/{run_id}/log-data` - Log run data

#### Models
- `GET /v1/models` - Search models

#### Users
- `POST /v1/user` - Create user

### Authentication

**For SDK Usage**:
```python
import os
os.environ["MLFLOW_TRACKING_USERNAME"] = "your.email@company.com"
os.environ["MLFLOW_TRACKING_PASSWORD"] = "your.email@company.com"
```

**For Direct API Calls**:
```bash
curl -H "email: user@example.com" \
     -H "Authorization: Basic <base64-encoded-credentials>" \
     http://localhost:8000/v1/experiment/123
```

### Model URI Format

When deploying models to ML Serve, use the following URI format:

**Format**: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`

**Example**: `mlflow-artifacts:/45/abc123def456789/artifacts/model`

**Alternative Formats**:
- `runs:/{run_id}/model` - For model registry operations
- `models:/{model_name}/{version}` - For registered model versions
- `models:/{model_name}/{stage}` - For model stages (Production, Staging)

### Model Deployment Integration

For deploying MLflow models to production, see:
- [Deploying Models from MLflow to Serve](#deploying-models-from-mlflow-to-serve)
- [ML Serve Documentation](../ml-serve-app/README.md)
- [Hermes CLI Documentation](../hermes-cli/CLI.md)


## 🛠️ Configuration

Configuration is managed through environment variables. For a production setup, you might use a configuration management service.

### Database Configuration

The following environment variables are used to configure the database connection (as defined in `app_layer/src/mlflow_app_layer/config/constants.py`):

```
DARWIN_MYSQL_HOST              # Database hostname
VAULT_SERVICE_MYSQL_USERNAME   # Database username
VAULT_SERVICE_MYSQL_PASSWORD   # Database password
CONFIG_SERVICE_MYSQL_DATABASE  # Database name
MYSQL_PORT                     # Database port (defaults to 3306)
```

## 💻 Development

### Code Structure

-   **Controllers**: Handle HTTP requests and responses.
-   **Services**: Implement business logic and MLflow integration.
-   **DAO**: Data access layer for database operations.
-   **Models**: Pydantic models for request/response validation.
-   **Utils**: Utility functions for authentication, logging, etc.

### Adding New Features

1.  Create a new controller in `controllers/`.
2.  Add business logic in `service/`.
3.  Define Pydantic models in `models/`.
4.  Add database queries in `dao/queries/`.
5.  Register new routes in `main.py`.

### Code Quality

This project uses the following tools to maintain code quality:

-   **Type Checking**: `mypy`
-   **Linting**: `pylint`
-   **Testing**: `pytest`
-   **Coverage**: `pytest-cov`

To run the quality checks:

```bash
# From the mlflow/app_layer directory
# Type checking
mypy src/

# Linting
pylint src/

# Testing
pytest tests/
```

## 🧪 Testing

### Running Tests

To run the full test suite with coverage:

```bash
cd app_layer
pytest --cov=mlflow_app_layer
```

### Test Structure

-   Unit tests for individual components.
-   Integration tests for API endpoints.
-   Dependencies like the MLflow backend and database should be mocked.

## 🚀 Deployment

### Container Deployment

The project includes Docker support and Kubernetes deployment configurations:

1. **Build**: Use the provided build scripts
2. **Deploy**: Deploy using Helm charts in the parent directory
3. **Monitor**: Use the health check endpoints

## 🤝 Contributing

We welcome contributions! Please follow this workflow:

1.  Fork the repository.
2.  Create a feature branch.
3.  Make your changes, following the code structure and quality guidelines.
4.  Add tests for new functionality.
5.  Ensure all quality checks and tests are passing.
6.  Submit a pull request.

### Code Standards

-   Follow PEP 8 style guidelines.
-   Use type hints for all functions.
-   Add docstrings for classes and methods.
-   Write unit and integration tests for new features.
-   Keep the documentation updated.
