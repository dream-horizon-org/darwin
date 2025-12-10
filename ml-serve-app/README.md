# Darwin ML Serve

A scalable machine learning model serving platform

## Overview

Darwin ML Serve is the **control plane** for ML model deployments within the Darwin Platform. It provides a comprehensive solution for deploying, managing, and scaling machine learning models in production environments, handling lifecycle management, versioning, and auto-scaling across multiple environments.

When deployed via the Darwin ecosystem, this service runs inside a **kind cluster** (local Kubernetes) and communicates with other Darwin services (Cluster Manager, Artifact Builder, MLflow) through Kubernetes service discovery.

This repository manages:
- **Serve lifecycle** - Create, deploy, update, and undeploy ML services
- **Artifact management** - Build and version deployment artifacts via Artifact Builder
- **Environment management** - Multi-environment deployment support with per-environment configuration
- **Auto-scaling** - Kubernetes HPA-based horizontal pod autoscaling
- **Infrastructure abstraction** - Works with Darwin Cluster Manager (DCM) for K8s operations

## Darwin Ecosystem Integration

This service is designed to be deployed as part of the **Darwin** ecosystem. The typical setup workflow is:

```
Darwin Workflow:
1. init.sh      → Select which services to enable (interactive wizard)
2. setup.sh     → Build images, push to kind-registry (localhost:5000)
3. start.sh     → Deploy to kind cluster via Helm

Image Flow for Model Serving:
┌─────────────────────────────────────────────────────────────────────┐
│  One-Click Deployment                                                │
│  └─> Uses pre-built serve-md-runtime image from kind-registry       │
│      (localhost:5000/serve-md-runtime:latest)                       │
│                                                                      │
│  Custom Deployment (via Artifact Builder)                           │
│  └─> Artifact Builder builds image from GitHub repo                 │
│  └─> Pushes to kind-registry (localhost:5000/serve-app:{tag})       │
│  └─> ML Serve deploys the image to the kind cluster                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Services Interaction

| Service | Role | Kubernetes Service URL |
|---------|------|------------------------|
| **ML Serve App** | Control plane for model deployments | `darwin-ml-serve-app:8000` |
| **Darwin Cluster Manager (DCM)** | Manages Kubernetes resources (Helm charts) | `darwin-cluster-manager:8080` |
| **Artifact Builder** | Builds Docker images from GitHub repos | `darwin-artifact-builder:8000` |
| **MLflow** | Model registry and tracking | `darwin-mlflow-lib:8080` |

## Repository Structure

```
.
├── README.md                   # Project documentation
├── env.example                 # Environment variables template
├── runtime/                    # Pre-built runtime for one-click deployments
│   └── darwin-serve-runtime/   # MLflow model serving runtime
│       ├── Dockerfile          # Runtime image definition
│       ├── requirements.txt    # Runtime dependencies
│       └── src/                # Runtime source code
├── app_layer/                  # FastAPI REST API layer
│   ├── src/
│   │   └── ml_serve_app_layer/ # API endpoints and request handling
│   └── tests/
├── core/                       # Core business logic
│   ├── src/
│   │   └── ml_serve_core/      
│   │       ├── client/         # External service clients (DCM, MySQL)
│   │       ├── config/         # Configuration management
│   │       ├── constants/      # Application constants
│   │       ├── resources/      # YAML templates (FastAPI, Ray)
│   │       ├── service/        # Business logic services
│   │       └── utils/          # Utility functions
│   └── tests/
├── model/                      # Database models
│   ├── src/
│   │   └── ml_serve_model/     # Tortoise ORM models
│   └── tests/
└── resources/
    └── db/
        └── mysql/
            └── migrations/     # Database migration scripts
```

## Features

- **FastAPI & Ray Serve** - Deploy models using FastAPI or Ray Serve backends
- **One-Click Deployment** - Deploy MLflow models instantly using pre-built runtime
- **Lifecycle Management** - Complete deployment lifecycle with versioning and rollback
- **Auto-scaling** - Kubernetes HPA with scheduled scaling strategies
- **Multi-Environment** - Deploy across multiple environments (local, prod, custom)
- **Artifact Management** - Build and manage deployment artifacts
- **Flexible Configuration** - Environment-based configuration with sensible defaults

## Prerequisites

### For Darwin Deployment (Recommended)

- Docker Desktop or Docker Engine
- `kind` (Kubernetes in Docker) - auto-installed by setup.sh
- `kubectl` CLI
- `helm` CLI

The Darwin setup scripts (`init.sh`, `setup.sh`, `start.sh`) handle:
- Creating the kind cluster
- Setting up the local container registry (`kind-registry`)
- Building and pushing all service images
- Deploying via Helm

### For Standalone Development

- Python 3.9+
- MySQL 8.0+
- Docker (for building images)
- Access to a Kubernetes cluster

## Environment Variables

When deployed via Darwin ecosystem, these variables are **automatically configured** in the Helm values. For standalone development, configure them in your `.env` file.

| Variable                      | Description                                    | Default (Darwin Ecosystem)                      |
|-------------------------------|------------------------------------------------|----------------------------------------------------|
| **Core Configuration**        |                                                |                                                    |
| `ENV`                         | Environment name (local/prod)                  | `local`                                            |
| **Database Configuration**    |                                                |                                                    |
| `MYSQL_HOST`                  | MySQL master host                              | `darwin-mysql` (K8s service)                       |
| `MYSQL_SLAVE_HOST`            | MySQL slave host (optional)                    | Falls back to `MYSQL_HOST`                         |
| `MYSQL_DATABASE`              | Database name                                  | `darwin_ml_serve`                                  |
| `MYSQL_USERNAME`              | Database user                                  | `root`                                             |
| `MYSQL_PASSWORD`              | Database password                              | `password`                                         |
| **Service URLs**              |                                                |                                                    |
| `DCM_URL`                     | Darwin Cluster Manager URL                     | `http://darwin-cluster-manager.darwin.svc.cluster.local:8080` |
| `ARTIFACT_BUILDER_URL`        | Artifact Builder internal service URL          | `http://darwin-artifact-builder.darwin.svc.cluster.local:8000` |
| `ARTIFACT_BUILDER_PUBLIC_URL` | Artifact Builder public/external URL           | `http://localhost/artifact-builder`                |
| **GitHub Configuration**      |                                                |                                                    |
| `GITHUB_TOKEN`                | GitHub personal access token (for private repos) | ``                                               |
| **Optional**                  |                                                |                                                    |
| `ENABLE_OTEL`                 | Enable OpenTelemetry exporters/instrumentation | `false` (local)                                    |
| `OTEL_SERVICE_NAME`           | Service name for telemetry                     | `darwin-ml-serve`                                  |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint                        | `http://localhost:4318`                            |
| **Kubernetes Configuration**  |                                                |                                                    |
| `KUBE_INGRESS_CLASS`          | Kubernetes ingress class                       | `nginx`                                            |
| **Container Registry**        |                                                |                                                    |
| `CONTAINER_REGISTRY`          | Container registry URL                         | `localhost:5000` (kind-registry)                   |
| `IMAGE_REPOSITORY`            | Image repository path                          | `serve-app`                                        |
| `IMAGE_TAG`                   | Default image tag                              | `latest`                                           |
| `DEFAULT_RUNTIME`             | Runtime image for one-click deployments        | `localhost:5000/serve-md-runtime:latest`           |
| **MLflow Configuration**      |                                                |                                                    |
| `MLFLOW_TRACKING_URI`         | MLflow tracking server URL                     | `http://darwin-mlflow-lib.darwin.svc.cluster.local:8080` |
| `MLFLOW_TRACKING_USERNAME`    | MLflow username (passed to deployed models)    | ``                                                 |
| `MLFLOW_TRACKING_PASSWORD`    | MLflow password (passed to deployed models)    | ``                                                 |
| **Deployed Service Configuration** |                                           |                                                    |
| `APPLICATION_PORT`            | Port for deployed FastAPI services (not control plane) | `8000`                                      |
| `HEALTHCHECK_PATH`            | Health check path for deployed services        | `/healthcheck`                                     |
| `ORGANIZATION_NAME`           | Organization name for tagging                  | `my-org`                                           |
| **Service Mesh (Optional)**   |                                                |                                                    |
| `ENABLE_ISTIO`                | Enable Istio service mesh                      | `false`                                            |
| `ISTIO_SERVICE_NAME`          | Istio service name                             | `istio-ingressgateway`                             |
| `ISTIO_NAMESPACE`             | Istio namespace                                | `istio-system`                                     |
| **ALB Configuration (Optional)** |                                             |                                                    |
| `ALB_LOGS_ENABLED`            | Enable ALB access logs                         | `false`                                            |
| `ALB_LOGS_BUCKET`             | S3 bucket for ALB logs                         | ``                                                 |
| `ALB_LOGS_PREFIX`             | Prefix for ALB logs in S3                      | `alb-logs`                                         |
| **Workflow Serves (Optional)** |                                               |                                                    |
| `JOB_CLUSTER_RUNTIME`         | Runtime for workflow job clusters              | ``                                                 |

See [env.example](env.example) for the complete list of environment variables.

## Quick Start with Darwin

### 1. Deploy via Darwin (Recommended)

From the Darwin root directory:

```bash
# 1. Configure which services to enable (enable ml-serve-app)
./init.sh

# 2. Build all images and set up the kind cluster
./setup.sh

# 3. Deploy to Kubernetes
./start.sh
```

This automatically:
- Creates a kind cluster with `kind-registry` at `localhost:5000`
- Builds the `ml-serve-app` image and pushes it to the registry
- Builds the `serve-md-runtime` image for one-click deployments
- Deploys all services via Helm to the `darwin` namespace

### 2. Access the API

Once deployed, access the ML Serve API through the ingress:

```bash
# Via ingress (path-based routing)
curl http://localhost/ml-serve/healthcheck

# Or port-forward for direct access
kubectl port-forward svc/darwin-ml-serve-app -n darwin 8007:8000
curl http://localhost:8007/healthcheck
```

**API Documentation:**
- **Swagger UI**: http://localhost/ml-serve/docs
- **Health Check**: http://localhost/ml-serve/healthcheck

### 3. Create an Environment for Deployments

Before deploying models, create an environment:

```bash
curl -X POST "http://localhost/ml-serve/api/v1/environment" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "local",
    "environment_configs": {
      "domain_suffix": "",
      "cluster_name": "kind",
      "namespace": "darwin",
      "security_group": "",
      "ft_redis_url": "",
      "workflow_url": ""
    }
  }'
```

## Key API Workflows

### One-Click Model Deployment

Deploy MLflow models directly using the **pre-built runtime image** (`serve-md-runtime`). This runtime is automatically built during `setup.sh` and pushed to `localhost:5000/serve-md-runtime:latest`.

The one-click deployment:
1. Uses the pre-built `serve-md-runtime` image (contains MLflow model loader)
2. Passes the MLflow model URI as an environment variable
3. The runtime fetches and loads the model at startup
4. Deploys to the kind cluster via Darwin Cluster Manager
Deploy MLflow models directly while auto-creating the necessary serve/artifact metadata:

```bash
POST /api/v1/serve/deploy-model
{
  "serve_name": "existing-serve-name",   # Optional; auto-generated if omitted
  "artifact_version": "v1",
  "model_uri": "mlflow-artifacts:/45/abc123.../artifacts/model",
  "env": "local",
  "cores": 4,
  "memory": 8,
  "node_capacity": "spot",
  "min_replicas": 1,
  "max_replicas": 3
}
```

**How it works:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  1. ML Serve receives deploy-model request                          │
│  2. Uses DEFAULT_RUNTIME image (localhost:5000/serve-md-runtime)    │
│  3. Generates Helm values with MLflow model URI as env var          │
│  4. Calls Darwin Cluster Manager to deploy the Helm chart           │
│  5. DCM deploys to kind cluster, pod pulls image from kind-registry │
│  6. Runtime container loads MLflow model and starts serving         │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- `env` must reference an existing environment created via the environment API.
- `serve_name` is optional; if it is omitted, ML Serve will create (or reuse) a `<user>-one-click-deployments` serve automatically.
- `artifact_version` is required so each one-click deployment can be tracked like a standard artifact/serve deployment. It is a deployment label for the one-click serve (not the underlying runtime image tag).

### One-Click Model Undeploy

Stop and remove a model that was deployed via the one-click deployment API:

```bash
POST /api/v1/serve/undeploy-model
{
  "serve_name": "my-model",
  "artifact_version": "v1",
  "env": "local"
}
```

This stops the Kubernetes deployment and removes the running pods for the specified model serve.

### Standard Deployment Workflow (Custom Images)

For more control over the deployment process, use Artifact Builder to create custom images:

1. **Create a Serve**
   ```bash
   POST /api/v1/serve
   {
     "name": "my-model-serve",
     "type": "api",
     "description": "Production model serving",
     "space": "ml-team"
   }
   ```

2. **Configure Infrastructure per Environment**
   ```bash
   POST /api/v1/serve/{serve_name}/infra-config/{env}
   {
     "api_serve_infra_config": {
       "backend_type": "fastapi",
       "cores": 4,
       "memory": 8,
       "min_replicas": 2,
       "max_replicas": 10,
       "node_capacity_type": "spot"
     }
   }
   ```

3. **Create an Artifact (triggers Artifact Builder)**
   
   This calls Artifact Builder to build a Docker image from your GitHub repository and push it to the kind-registry.
   
   ```bash
   POST /api/v1/artifact
   {
     "serve_name": "my-model-serve",
     "version": "v1.0.0",
     "github_repo_url": "https://github.com/myorg/my-model",
     "branch": "main"
   }
   ```
   
   **Image flow:**
   ```
   GitHub Repo → Artifact Builder → localhost:5000/serve-app:v1.0.0 → kind cluster
   ```

4. **Deploy to Environment**
   ```bash
   POST /api/v1/serve/{serve_name}/deploy
   {
     "env": "local",
     "artifact_version": "v1.0.0",
     "api_serve_deployment_config": {
       "deployment_strategy": "rolling",
       "environment_variables": {
         "MODEL_PATH": "/models/production"
       }
     }
   }
   ```

### Updating Infrastructure Configuration

Update resource limits, replicas, or other infra settings for a deployed serve:

```bash
PATCH /api/v1/serve/{serve_name}/infra-config/{env}
{
  "api_serve_infra_config": {
    "min_replicas": 5,
    "max_replicas": 20,
    "cores": 8,
    "memory": 16
  }
}
```

**Automatic Redeployment:** If a serve is already deployed, updating the infra config will automatically trigger a redeployment with the new settings.

## Environment Management

Environments are fully managed via the API, allowing you to create and configure multiple deployment targets without code changes or application restarts.

### Creating an Environment

Use the `/api/v1/environment` endpoint to create new environments:

```bash
POST /api/v1/environment
{
  "name": "prod",
  "environment_configs": {
    "domain_suffix": ".mycompany.com",
    "cluster_name": "kind",
    "namespace": "serve",
    "security_group": "sg-12345, sg-67890",
    "subnets": "subnet-abc123, subnet-def456",
    "ft_redis_url": "",
    "workflow_url": ""
  }
}
```

### Environment Configuration Fields

| Field | Description | Required |
|-------|-------------|----------|
| `domain_suffix` | Domain suffix for service URLs (e.g., `.mycompany.com`) | Yes (can be empty for local) |
| `cluster_name` | Kubernetes cluster name | Yes |
| `namespace` | Kubernetes namespace for deployments | Yes (use `serve` for kind local deployments) |
| `security_group` | AWS security groups (comma-separated) | Yes (can be empty) |
| `subnets` | AWS subnets for ALB (comma-separated) | No (defaults to empty) |
| `ft_redis_url` | Redis URL for feature store | Yes (can be empty) |
| `workflow_url` | Workflow service URL | Yes (can be empty) |

### Managing Environments

```bash
# List all environments
GET /api/v1/environment

# Get specific environment
GET /api/v1/environment/{environment_name}

# Update environment configuration
PATCH /api/v1/environment/{environment_name}
{
  "environment_configs": {
    "domain_suffix": ".updated-domain.com",
    ...
  }
}

# Delete environment
DELETE /api/v1/environment/{environment_name}
```

## Artifact Builder: FastAPI Best Practices

When deploying FastAPI applications via the artifact-builder workflow (building from GitHub), follow these best practices to ensure full compatibility with Swagger UI and path-based routing.

### Swagger UI Support

Darwin uses **path-based routing** in local/development environments. Your serve is accessible at:
```
http://localhost/{serve-name}/
```

For example, if your serve is named `my-model` and deployed to environment `local`:
```
http://localhost/my-model-local/healthcheck
http://localhost/my-model-local/docs
http://localhost/my-model-local/predict
```

**For Swagger UI to work correctly**, your FastAPI app must use the `ROOT_PATH` environment variable. Darwin automatically sets this variable for all deployed serves.

### Using ROOT_PATH (Required for Swagger UI)

Darwin automatically sets the `ROOT_PATH` environment variable for all deployed serves. Reading this variable in your FastAPI app ensures:

- Swagger UI `/docs` works correctly
- OpenAPI schema URLs are properly prefixed
- OAuth2 redirects work behind the reverse proxy
- "Try it out" functionality in Swagger UI calls the correct endpoints

**Recommended FastAPI Setup:**

```python
import os
from fastapi import FastAPI

# Read ROOT_PATH from environment (set automatically by Darwin)
# Falls back to empty string for local development without Darwin
root_path = os.environ.get("ROOT_PATH", "")

# Pass root_path to FastAPI
app = FastAPI(
    title="My ML Model API",
    root_path=root_path
)

@app.get("/healthcheck")
async def healthcheck():
    return {"status": "healthy"}

@app.post("/predict")
async def predict(data: dict):
    # Your prediction logic here
    return {"prediction": "result"}
```

### Complete Example: FastAPI App for Darwin

Here's a complete example of a FastAPI application optimized for Darwin deployment:

```python
import os
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Darwin sets ROOT_PATH automatically for path-based routing
root_path = os.environ.get("ROOT_PATH", "")

app = FastAPI(
    title="House Price Predictor",
    description="Predict house prices based on features",
    version="1.0.0",
    root_path=root_path
)

class PredictRequest(BaseModel):
    area: int
    bedrooms: int
    bathrooms: int
    stories: int
    parking: int

class PredictResponse(BaseModel):
    predicted_price: float
    confidence: float

@app.get("/healthcheck")
async def healthcheck() -> Dict[str, str]:
    """Health check endpoint required by Darwin"""
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest) -> PredictResponse:
    """Make a price prediction"""
    try:
        # Your ML model prediction logic here
        # Example: price = model.predict(request.dict())
        predicted_price = request.area * 100 + request.bedrooms * 50000
        
        return PredictResponse(
            predicted_price=predicted_price,
            confidence=0.95
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Dockerfile for Darwin Deployment

When building via artifact-builder, include a `Dockerfile` in your repository:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Requirements

Your `requirements.txt` should include:

```
fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.0.0
# Add your ML dependencies (scikit-learn, torch, etc.)
```

### Important Notes

1. **Healthcheck Endpoint**: Darwin expects a `/healthcheck` endpoint that returns HTTP 200. This is used for liveness and readiness probes.

2. **Port 8000**: By default, Darwin expects your app to listen on port 8000. This can be configured via `APPLICATION_PORT` if needed.

3. **ROOT_PATH is Required for Swagger UI**: For `/docs` and `/openapi.json` to work correctly with path-based routing, your FastAPI app must read the `ROOT_PATH` environment variable and pass it to `FastAPI(root_path=...)`. Without this, Swagger UI will fail to load the OpenAPI schema.

4. **Environment Variables**: You can pass additional environment variables during deployment via the `environment_variables` field in the deploy request.

## Standalone Development Setup

For developing ML Serve App independently (outside Darwin ecosystem):

### PyCharm Setup

1. **Mark source directories**: Right-click on each `src` directory → Mark Directory as → Sources Root
   - `app_layer/src`
   - `core/src`
   - `model/src`

2. **Mark test directories**: Right-click on each `tests` directory → Mark Directory as → Test Sources Root

3. **Install dependencies**:
   ```bash
   # From workspace root - install all packages in editable mode
   pip install -r app_layer/requirements.txt
   
   # Or install individually (from workspace root)
   pip install -e model/
   pip install -e core/
   pip install -e app_layer/
   
   # Development dependencies (linting, testing)
   pip install -r core/requirements_dev.txt
   ```

4. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your local configuration
   ```

5. **Setup database**:
   ```bash
   # Using Docker
   docker run -d \
     --name darwin-mysql \
     -e MYSQL_ROOT_PASSWORD=password \
     -e MYSQL_DATABASE=darwin_ml_serve \
     -p 3306:3306 \
     mysql:8.0
   ```

   > **MySQL authentication note:** The default MySQL 8.0 configuration ships with `caching_sha2_password`. When TLS is disabled (the local Docker image above), the driver performs an RSA exchange that depends on the `cryptography` package—this project ships it by default so local installs "just work." In production, prefer enabling TLS for the database connection; once TLS is in place (or if you switch the user to `mysql_native_password`) you may remove the dependency if desired.

6. **Run the application**:
   - Create a FastAPI run configuration:
     - **Application file**: `app_layer/src/ml_serve_app_layer/main.py`
     - **Working directory**: `app_layer`
     - **Environment variables**: Load from `.env` file
   - Or run from terminal:
     ```bash
     cd app_layer/src
     uvicorn ml_serve_app_layer.main:app --reload --host 0.0.0.0 --port 8007
     ```

## Development Workflow

### Running Tests

```bash
# Run all tests
pytest

# Run specific module tests
pytest app_layer/tests/
pytest core/tests/
pytest model/tests/

# Run with coverage
pytest --cov=ml_serve_app_layer --cov=ml_serve_core --cov=ml_serve_model
```

### Code Formatting

```bash
# Format code with black
black app_layer/ core/ model/ -l 120

# Check with flake8
flake8 app_layer/ core/ model/
```

### Database Management

This project uses **Tortoise ORM** for database management with automatic schema generation. The database schema is defined using Python models in the `model` package.

**Key Features:**
- **Automatic Schema Generation**: Tables are created automatically from model definitions
- **No Manual Migrations**: Schema changes are handled by updating model classes
- **Model-First Approach**: Database structure follows Python model definitions

**Database Configuration:**
- Configuration files: `resources/config/mysql/connection-*.conf`
- Models location: `model/src/ml_serve_model/`
- Automatic initialization on application startup

For detailed information about database models, table structures, and relationships, see the [Model Package README](model/README.md).

## Helm Chart Configuration

When deployed via Darwin ecosystem, the service is configured through Helm values. Key configuration in `helm/darwin/charts/services/values.yaml`:

```yaml
ml-serve-app:
  enabled: true
  serviceName: darwin-ml-serve-app
  image:
    registry: localhost:5000      # kind-registry
    name: ml-serve-app
    tag: latest
  extraEnvVars:
    - name: DCM_URL
      value: "http://darwin-cluster-manager.darwin.svc.cluster.local:8080"
    - name: ARTIFACT_BUILDER_URL
      value: "http://darwin-artifact-builder.darwin.svc.cluster.local:8000"
    - name: DEFAULT_RUNTIME
      value: "localhost:5000/serve-md-runtime:latest"
    # ... other env vars
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style (Black formatter with 120 line length)
- Tests pass (`pytest`)
- Documentation is updated

## Acknowledgments

Darwin ML Serve was originally developed internally and is now open-sourced to benefit the machine learning community.
