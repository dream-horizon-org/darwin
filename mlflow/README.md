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
- Models are automatically versioned and stored in the artifact store (no manual versioning commands needed)
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

When deployed in the Darwin ecosystem, these service URLs are only accessible within the Kubernetes cluster:
- **MLflow Tracking Server**: `http://darwin-mlflow-lib.darwin.svc.cluster.local:8080`
- **MLflow App Layer**: `http://darwin-mlflow-app.darwin.svc.cluster.local:8000`
- **ML Serve**: `http://darwin-ml-serve-app.darwin.svc.cluster.local:8000`

> **Note**: These Kubernetes service URLs are not accessible from outside the cluster. To access these services externally, use port-forwarding:
> ```bash
> kubectl port-forward -n darwin svc/darwin-mlflow-app 8000:8000
> kubectl port-forward -n darwin svc/darwin-mlflow-lib 8080:8080
> ```
> Or access via the ingress URLs configured in your environment (e.g., `http://localhost/mlflow-app/experiments`).

## 🎓 Training Models with MLflow in Workspace

### Darwin-Specific Setup

**Authentication (Required for Darwin MLflow)**

Darwin MLflow requires authentication. Set the following environment variables:
- `MLFLOW_TRACKING_USERNAME`: Your email address
- `MLFLOW_TRACKING_PASSWORD`: Your email address (or configured password)
- Set tracking URI to: `http://darwin-mlflow-lib.darwin.svc.cluster.local:8080`

**Model Logging (Darwin-Specific Pattern)**

Darwin MLflow requires using `tempfile` and `log_artifacts` instead of direct model logging. The pattern involves:
1. Creating a temporary directory
2. Saving the model using `mlflow.sklearn.save_model()` (or appropriate flavor)
3. Using `mlflow.log_artifacts()` to upload the model
4. Extracting the model URI for deployment: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`

> **📚 For standard MLflow usage**, see [MLflow 2.12.2 Documentation](https://mlflow.org/docs/2.12.2/index.html)
> 
> **💡 For complete Darwin examples with full code**, see [`examples/`](../examples/)

## 🚀 Deploying Models from MLflow to Serve

Once your model is trained and logged to MLflow, you can deploy it to production using Darwin ML Serve.

### Understanding Model URIs

MLflow models are referenced using URIs that point to their storage location:

**Format**: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`

**Example**: `mlflow-artifacts:/45/abc123def456789/artifacts/model`

**Finding Your Model URI**:
1. Open MLflow UI: `http://localhost/mlflow-app/experiments` (or your MLflow URL)
2. Navigate to your experiment
3. Click on the run you want to deploy
4. Copy the Run ID from the run details page
5. Note the Experiment ID from the breadcrumb or URL
6. Construct the URI: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`

**Alternative URI Formats**:
- `runs:/{run_id}/model` - References a model from a specific run
- `models:/{model_name}/{version}` - References a registered model version
- `mlflow-artifacts:/...` - Direct artifact store path (recommended for deployment)

### Deployment Integration

MLflow models can be deployed to production using ML Serve. The deployment process involves:
- Passing the model URI to ML Serve
- ML Serve uses the pre-built `serve-md-runtime` image to load and serve the model
- Models are deployed as Kubernetes pods and accessible via REST API

> **💡 For complete deployment documentation, examples, and CLI commands**, see:
> - [ML Serve Documentation](../ml-serve-app/README.md)
> - [Hermes CLI Documentation](../hermes-cli/CLI.md)
> - [Examples](../examples/) directory

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
- Create or access your Jupyter workspace through the Darwin UI or Workspace API

**Step 2: Train and Track Model**
- Set up MLflow authentication and tracking URI
- Load your dataset and prepare training data
- Train your model and log parameters, metrics, and artifacts using the Darwin-specific pattern
- Extract the model URI for deployment

**Step 3: Register Model in Model Registry**
- Use MLflowClient to create a registered model
- Create a model version from your training run

**Step 4: Get Model URI**
- Extract the model URI in the format: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`
- This URI can be used to deploy the model to production

> **💡 For deployment steps (Steps 5-7)**, see [ML Serve Documentation](../ml-serve-app/README.md) and [Hermes CLI Documentation](../hermes-cli/CLI.md)

> **💡 For complete step-by-step examples with full code**, see [`examples/`](../examples/)

### Troubleshooting Common Issues

**Issue: "Model URI not found"**
- Verify the experiment ID and run ID are correct
- Check that artifacts were logged successfully in MLflow UI at `http://localhost/mlflow-app/experiments`
- Ensure the model path is `artifacts/model` (not just `model`)

**Issue: "Authentication failed"**
- Verify MLflow credentials are set correctly (`MLFLOW_TRACKING_USERNAME` and `MLFLOW_TRACKING_PASSWORD`)
- Check that the tracking URI is set to the correct MLflow service URL

**Issue: "Model logging fails"**
- Ensure the model was saved with `mlflow.log_artifacts()` (not `mlflow.sklearn.log_model()` directly)
- Verify you're using the Darwin-specific tempfile + log_artifacts pattern

> **💡 For deployment-related troubleshooting**, see [ML Serve Documentation](../ml-serve-app/README.md)

## 📚 Darwin MLflow SDK

### Key Differences from Standard MLflow

Darwin MLflow is based on MLflow 2.12.2 with these Darwin-specific requirements:

**1. Authentication Required**
```python
os.environ["MLFLOW_TRACKING_USERNAME"] = "your.email@company.com"
os.environ["MLFLOW_TRACKING_PASSWORD"] = "your.email@company.com"
```

**2. Use `tempfile` + `log_artifacts` for Model Logging**
- Don't use direct logging like `mlflow.sklearn.log_model(model, "model")` (won't work with Darwin MLflow)
- Use the tempfile + log_artifacts pattern: save model to a temporary directory, then use `mlflow.log_artifacts()`

**3. Model URI Format for Deployment**
- Use this format for ML Serve deployment: `mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model`

> **💡 For complete code examples**, see [`examples/`](../examples/)

> **📚 For all other MLflow operations**, refer to the official [MLflow 2.12.2 Documentation](https://mlflow.org/docs/2.12.2/index.html)

## 📖 Examples

For complete, working examples of MLflow integration with training and deployment workflows, see the [`examples/`](../examples/) directory.

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
