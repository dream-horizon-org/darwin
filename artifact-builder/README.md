# Darwin Artifact Builder

A Docker image building service for the Darwin ML Platform - part of the Darwin ecosystem.

## Overview

Darwin Artifact Builder is a service that builds Docker images from Git repositories and pushes them to container registries. When deployed as part of the Darwin ecosystem, it builds custom model serving images and pushes them to the **kind-registry** (`localhost:5000`), making them available for deployment to the kind cluster.

This service is called by **ML Serve App** when users create artifacts for their model serves. The built images are then deployed to Kubernetes via Darwin Cluster Manager.

This repository manages:
- **Docker Image Building** - Build images from Git repositories with custom Dockerfiles
- **Container Registry Integration** - Push to local kind-registry, AWS ECR, or GCP GCR
- **Task Management** - Queue-based image building with status tracking

## Darwin Ecosystem Integration

This service is designed to be deployed as part of the **Darwin** ecosystem. The typical setup workflow is:

```
Darwin Workflow:
1. init.sh      → Select which services to enable (enable artifact-builder)
2. setup.sh     → Build images, push to kind-registry (localhost:5000)
3. start.sh     → Deploy to kind cluster via Helm

Image Building Flow (triggered by ML Serve App):
┌─────────────────────────────────────────────────────────────────────┐
│  1. User calls ML Serve API to create artifact                      │
│  2. ML Serve calls Artifact Builder API                             │
│  3. Artifact Builder clones GitHub repo                             │
│  4. Builds Docker image using repo's Dockerfile                     │
│  5. Pushes to kind-registry: localhost:5000/serve-app:{tag}         │
│  6. ML Serve deploys the image to kind cluster via DCM              │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Services Interaction

| Service | Role | Kubernetes Service URL |
|---------|------|------------------------|
| **Artifact Builder** | Builds Docker images from GitHub repos | `darwin-artifact-builder:8000` |
| **ML Serve App** | Control plane for model deployments | `darwin-ml-serve-app:8000` |
| **Darwin Cluster Manager (DCM)** | Manages Kubernetes resources (Helm charts) | `darwin-cluster-manager:8080` |

### Docker-in-Docker Configuration

When running inside the kind cluster, Artifact Builder needs access to the Docker daemon to build images. The Helm chart mounts the Docker socket from the host:

```yaml
# From helm/darwin/charts/services/values.yaml
artifact-builder:
  securityContext:
    privileged: true        # Required for Docker-in-Docker
    runAsUser: 0            # Root access needed for Docker operations
  volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-socket
  volumes:
    - name: docker-socket
      hostPath:
        path: /var/run/docker.sock
        type: Socket
```

## Repository Structure

```
.
├── README.md                   # Project documentation
├── env.example                 # Environment variables template
├── run_simple.sh              # Quick start script (standalone dev)
├── model/                     # Database models (Tortoise ORM)
│   ├── src/
│   │   └── serve_model/       # ORM model definitions
│   │       └── image_builder.py   # ImageBuilder model
│   └── setup.py
├── app_layer/                 # FastAPI REST API layer
│   ├── src/
│   │   └── serve_app_layer/   # API endpoints and request handling
│   │       ├── main.py        # FastAPI application
│   │       ├── models/        # Request/Response models
│   │       ├── utils/         # Utility functions and shell scripts
│   │       │   ├── createImageFromGithub.sh       # Production build script
│   │       │   └── createImageFromGithub_local.sh # Local/kind build script
│   │       └── constants/     # App-layer constants
│   └── tests/
├── core/                      # Core business logic
│   ├── src/
│   │   └── serve_core/        
│   │       ├── build_image.py # Image building orchestration
│   │       ├── client/        # Database client (MysqlClient)
│   │       ├── constant/      # Configuration management
│   │       ├── dao/           # Database access layer
│   │       └── utils/         # Core utilities
│   └── tests/
├── build_artifacts/           # Generated build artifacts
├── logs/                      # Application logs
└── service-defintion/         # Service deployment definitions
```

## Features

- **Docker Image Building** - Build images from Git repositories with custom Dockerfiles
- **Queue-based Processing** - Background task processing for image builds
- **Kind Registry Support** - Push to local kind-registry for kind cluster deployments
- **Multi-Registry Support** - Also supports AWS ECR and GCP GCR
- **Task Monitoring** - Real-time build status and log streaming
- **Multi-Environment** - Support for local and production environments
- **Flexible Configuration** - Environment-based configuration with sensible defaults

## Prerequisites

### For Darwin Deployment (Recommended)

- Docker Desktop or Docker Engine
- `kind` (Kubernetes in Docker) - auto-installed by setup.sh
- `kubectl` CLI
- `helm` CLI

The Darwin setup scripts handle:
- Creating the kind cluster
- Setting up the local container registry (`kind-registry`)
- Building and pushing the artifact-builder image
- Deploying via Helm with Docker socket mounted

### For Standalone Development

- Python 3.9+
- Docker (for image building)
  - **Note**: For Apple Silicon (M1/M2/M3) Macs, images are automatically built for `linux/amd64` to ensure Kubernetes compatibility
- MySQL 8.0+
- AWS CLI (for ECR integration, optional)
- GCP CLI (for GCR integration, optional)

## Environment Variables

When deployed via Darwin ecosystem, these variables are **automatically configured** in the Helm values. For standalone development, configure them in your `.env` file.

### Core Configuration
| Variable | Description | Default (Darwin Ecosystem) |
|----------|-------------|-------------------------------|
| `ENV` | Environment (local/prod) | `local` |
| `DEV` | Development mode flag | `true` |
| `BUILD_ARTIFACTS_ROOT` | Build artifacts directory | `build_artifacts` |
| `LOG_FILE_ROOT_LOCAL` | Local logs directory | `logs` |
| `LOG_FILE_ROOT_PROD` | Production logs directory | `/var/www/artifact-builder/logs` |

### Database Configuration
| Variable | Description | Default (Darwin Ecosystem) |
|----------|-------------|-------------------------------|
| `MYSQL_HOST` | MySQL host | `darwin-mysql` (K8s service) |
| `MYSQL_PORT` | MySQL port | `3306` |
| `MYSQL_DATABASE` | Database name | `mlp_serve` |
| `MYSQL_USERNAME` | Database user | `root` |
| `MYSQL_PASSWORD` | Database password | `password` |

### Container Registry Configuration
| Variable | Description | Default (Darwin Ecosystem) |
|----------|-------------|-------------------------------|
| `CONTAINER_IMAGE_PREFIX` | Docker image prefix | `serve-app` |
| `CONTAINER_IMAGE_PREFIX_GCP` | GCP image prefix | `ray-images` |
| `IMAGE_REPOSITORY` | Repository name for local registry | `serve-app` |
| `LOCAL_REGISTRY` | Local container registry URL | Dynamically set (e.g., `127.0.0.1:55000`) |
| `AWS_ECR_ACCOUNT_ID` | AWS ECR account ID | `` |
| `AWS_ECR_REGION` | AWS ECR region | `us-east-1` |
| `GCP_PROJECT_ID` | GCP project ID | `` |
| `GCP_CREDS_PATH` | GCP credentials file path | `` |

### Service URLs
| Variable | Description | Default (Darwin Ecosystem) |
|----------|-------------|-------------------------------|
| `APP_LAYER_URL` | App layer service URL | `http://localhost/artifact-builder` |

### OpenTelemetry Configuration (Optional)
| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_OTEL` | Enable OpenTelemetry exporters/instrumentation | `false` (local) |
| `OTEL_SERVICE_NAME` | Service name for telemetry | `artifact-builder` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint | `http://localhost:4318` |

See [env.example](env.example) for the complete configuration template.

## Quick Start with Darwin

### 1. Deploy via Darwin (Recommended)

From the Darwin root directory:

```bash
# 1. Configure which services to enable (enable artifact-builder)
./init.sh

# 2. Build all images and set up the kind cluster
./setup.sh

# 3. Deploy to Kubernetes
./start.sh
```

This automatically:
- Creates a kind cluster with `kind-registry`
- Builds the `artifact-builder` image and pushes it to the registry
- Deploys with Docker socket mounted for building images
- Configures `LOCAL_REGISTRY` to point to the kind-registry using `DOCKER_REGISTRY` value from `config.env`.

### 2. Access the API

Once deployed, access the Artifact Builder API through the ingress:

```bash
# Via ingress (path-based routing)
curl http://localhost/artifact-builder/healthcheck

# Or port-forward for direct access
kubectl port-forward svc/darwin-artifact-builder -n darwin 8000:8000
curl http://localhost:8000/healthcheck
```

**API Documentation:**
- **Swagger UI**: http://localhost/artifact-builder/docs
- **Health Check**: http://localhost/artifact-builder/healthcheck

### 3. Build an Image

When called by ML Serve App (or directly):

```bash
# Build an image from a GitHub repository
curl -X POST "http://localhost/artifact-builder/build_with_dockerfile" \
  -F "app_name=my-model" \
  -F "image_tag=v1.0.0" \
  -F "git_repo=https://github.com/myorg/my-model-repo.git" \
  -F "branch=main"
```

The image will be built and pushed to:
```
localhost:5000/serve-app:v1.0.0
```

## Kind Registry (Local Container Registry)

When running in the Darwin ecosystem, a local container registry (`kind-registry`) is automatically created during `setup.sh`. This registry:

- Runs as a Docker container on the host machine
- Is accessible at a dynamically assigned port (stored in `config.env`)
- Is connected to the kind cluster's network
- Stores images that Kubernetes pods can pull

### How Images Are Built and Pushed

```
┌─────────────────────────────────────────────────────────────────────┐
│  Build Environment: Artifact Builder pod in kind cluster           │
│                                                                      │
│  1. Clone GitHub repo to local directory                            │
│  2. docker build -t serve-app:v1.0.0 .                              │
│  3. docker tag serve-app:v1.0.0 127.0.0.1:{PORT}/serve-app:v1.0.0   │
│  4. docker push 127.0.0.1:{PORT}/serve-app:v1.0.0                   │
│                                                                      │
│  Result: Image available at localhost:5000/serve-app:v1.0.0         │
│          (accessible by kind cluster pods)                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Registry Configuration

The `LOCAL_REGISTRY` environment variable tells artifact-builder where to push images:

```yaml
# From Helm values
- name: LOCAL_REGISTRY
  value: "127.0.0.1:55000"  # Dynamically assigned port
- name: IMAGE_REPOSITORY
  value: "serve-app"
```

Images are tagged and pushed in the format:
```
${LOCAL_REGISTRY}/${IMAGE_REPOSITORY}:${image_tag}
```

Example: `127.0.0.1:55000/serve-app:v1.0.0`

## API Usage Examples

### Complete Workflow: Build and Track an Image

```bash
# Step 1: Submit a build task
RESPONSE=$(curl -s -X POST "http://localhost/artifact-builder/build_with_dockerfile" \
  -F "app_name=my-app" \
  -F "image_tag=v1.0" \
  -F "git_repo=https://github.com/username/repo.git" \
  -F "branch=main")

# Extract task_id from response
TASK_ID=$(echo $RESPONSE | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
echo "Task ID: $TASK_ID"

# Step 2: Check build status
curl -X GET "http://localhost/artifact-builder/task/status?task_id=$TASK_ID"

# Step 3: Stream build logs (while building)
curl -X GET "http://localhost/artifact-builder/task/logs?task_id=$TASK_ID"

# Step 4: List all tasks
curl -X GET "http://localhost/artifact-builder/task"
```

### Build Status Values
- `waiting` - Task is queued, waiting to start
- `running` - Build is in progress
- `completed` - Build finished successfully
- `failed` - Build encountered an error

## API Endpoints

### Image Building
- `POST /build_with_dockerfile` - Build Docker image with custom Dockerfile
- `GET /task` - List all build tasks
- `GET /task/logs?task_id={id}` - Get build task logs
- `GET /task/status?task_id={id}` - Get build task status

### Health & Monitoring

#### `GET /healthcheck`
Service health check endpoint.

```bash
curl -X GET "http://localhost/artifact-builder/healthcheck"
```

**Response:**

```json
{
  "status": "SUCCESS",
  "message": "OK"
}
```

## Standalone Development Setup

For developing Artifact Builder independently (outside Darwin Ecosystem):

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
     -e MYSQL_DATABASE=mlp_serve \
     -p 3306:3306 \
     mysql:8.0
   ```
   
   > **Note:** The database and tables are created **automatically** on first startup. No manual setup required!

6. **Run the application**:
   ```bash
   ./run_simple.sh
   ```

### Quick Start (Standalone)

```bash
# 1. Clone and setup
git clone <repository-url>
cd artifact-builder
cp env.example .env
# Edit .env with your configuration

# 2. Setup database (Docker)
docker run -d \
  --name darwin-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=mlp_serve \
  -p 3306:3306 \
  mysql:8.0

# 3. Install dependencies
pip install -r app_layer/requirements.txt

# 4. Run the application
./run_simple.sh

# 5. Access the API
# - Swagger UI: http://localhost:8000/docs
# - Health Check: http://localhost:8000/healthcheck
```

## Database Management

Darwin Artifact Builder uses **Tortoise ORM** for database management, providing an elegant async ORM solution for Python.

### Database Structure

The application uses a MySQL database (`mlp_serve`) with the following tables:

#### **darwin_image_builder**
Tracks Docker image build tasks.

| Column | Type | Description |
|--------|------|-------------|
| `task_id` | VARCHAR(255) | Primary key, unique task identifier |
| `app_name` | VARCHAR(255) | Application name |
| `image_tag` | VARCHAR(255) | Docker image tag |
| `logs_url` | TEXT | URL to build logs |
| `build_params` | JSON | Build parameters (repo, branch, etc.) |
| `status` | ENUM | Build status: waiting, running, completed, failed |
| `created_at` | TIMESTAMP | Task creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### ORM Models

Models are defined in the `model/` package using Tortoise ORM:

```python
# model/src/serve_model/image_builder.py
class ImageBuilder(models.Model):
    task_id = fields.CharField(max_length=255, pk=True)
    app_name = fields.CharField(max_length=255)
    image_tag = fields.CharField(max_length=255)
    logs_url = fields.TextField(null=True)
    build_params = fields.JSONField(null=True)
    status = fields.CharEnumField(BuildStatus, default=BuildStatus.WAITING)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    
    class Meta:
        table = "darwin_image_builder"
```

### Database Initialization

The database is automatically initialized on application startup:

1. **Schema Auto-Generation**: Tortoise ORM automatically generates database schemas from model definitions
2. **Connection Management**: Database connections are managed through the FastAPI lifecycle
3. **No Manual Migrations**: Schema changes are reflected automatically (in development)

```python
# Startup event in main.py
@app.on_event("startup")
async def startup_event():
    await db_client.init_tortoise()  # Auto-generates schemas
```

### Working with Models

```python
from serve_model.image_builder import ImageBuilder

# Query examples
task = await ImageBuilder.get(task_id="id-123")
all_waiting = await ImageBuilder.filter(status="waiting").all()
await task.update(status="running")

# Create new record
new_task = await ImageBuilder.create(
    task_id="id-456",
    app_name="my-app",
    image_tag="v1.0",
    status="waiting"
)
```

## Development Workflow

### Running Tests
```bash
# Run all tests
pytest

# Run specific module tests
pytest app_layer/tests/
pytest core/tests/

# Run with coverage
pytest --cov=serve_app_layer --cov=serve_core
```

### Code Formatting
```bash
# Format code with black
black app_layer/ core/ --line-length 120

# Check with flake8
flake8 app_layer/ core/
```

## OpenTelemetry Observability

This service uses **OpenTelemetry** for distributed tracing and metrics. By default:

- **Disabled** for local development (`ENV=local`)
- **Enabled** automatically for production/staging environments

### Configuration

```bash
# Optional: Explicitly control OTEL
ENABLE_OTEL=true

# Service name in traces (default: artifact-builder)
OTEL_SERVICE_NAME=artifact-builder

# OTLP collector endpoint (default: http://localhost:4318)
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

## Helm Chart Configuration

When deployed via Darwin ecosystem, the service is configured through Helm values. Key configuration in `helm/darwin/charts/services/values.yaml`:

```yaml
artifact-builder:
  enabled: true
  serviceName: darwin-artifact-builder
  image:
    registry: localhost:5000
    name: artifact-builder
    tag: latest
  securityContext:
    privileged: true          # Required for Docker-in-Docker
    runAsUser: 0              # Root access for Docker operations
  volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-socket
  volumes:
    - name: docker-socket
      hostPath:
        path: /var/run/docker.sock
        type: Socket
  extraEnvVars:
    - name: LOCAL_REGISTRY
      value: "127.0.0.1:55000" # Dynamically assigned port
    - name: IMAGE_REPOSITORY
      value: "serve-app"
    # ... other env vars
```

## Troubleshooting

### Common Issues

1. **Docker not running / permission denied**
   - In Darwin Ecosystem: Check that Docker socket is mounted correctly
   - Verify the pod has `privileged: true` security context
   - Check pod logs: `kubectl logs -f deployment/darwin-artifact-builder -n darwin`

2. **Cannot push to local registry**
   - Verify kind-registry is running: `docker ps | grep kind-registry`
   - Check the registry port in `config.env`
   - Ensure `LOCAL_REGISTRY` env var matches the actual registry port

3. **Database connection failed**
   - Verify MySQL is running: `kubectl get pods -n darwin | grep mysql`
   - Check database credentials in Helm values

4. **Build tasks stuck in 'waiting' status**
   - Check background task processor is running
   - Verify Docker daemon accessibility from the pod
   - Check pod logs for errors

### Logs
- **Application logs**: Available via `kubectl logs`
- **Build task logs**: Via API `/task/logs?task_id={id}`
- **Docker build logs**: Stored in build artifacts directory

### Debugging in Kind Cluster

```bash
# Check pod status
kubectl get pods -n darwin | grep artifact-builder

# Check pod logs
kubectl logs -f deployment/darwin-artifact-builder -n darwin

# Exec into the pod
kubectl exec -it deployment/darwin-artifact-builder -n darwin -- /bin/bash

# Test Docker access inside the pod
docker version
docker images
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

Darwin Artifact Builder was originally developed internally and is now open-sourced to benefit the machine learning community.
