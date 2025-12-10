# Darwin ML Serve

A scalable Docker image building and runtime management platform for machine learning applications.

## Overview

Darwin ML Serve is a comprehensive platform for building, managing, and deploying Docker images for machine learning applications. It provides a REST API for creating Docker images from Git repositories and integrating with container registries.

This repository manages:
- **Docker Image Building** - Build images from Git repositories with custom Dockerfiles
- **Container Registry Integration** - Push to AWS ECR, GCP GCR, and other registries
- **Task Management** - Queue-based image building with status tracking

## Repository Structure

```
.
├── README.md                   # Project documentation
├── env.example                 # Environment variables template
├── run_simple.sh              # Quick start script
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

- 🐳 **Docker Image Building** - Build images from Git repositories with custom Dockerfiles
- 🔄 **Queue-based Processing** - Background task processing for image builds
- 📦 **Multi-Registry Support** - Push to AWS ECR, GCP GCR, and other container registries
- 🔍 **Task Monitoring** - Real-time build status and log streaming
- 🌍 **Multi-Environment** - Support for local and production environments
- 🔧 **Flexible Configuration** - Environment-based configuration with sensible defaults

## Prerequisites

- Python 3.9+
- Docker (for image building)
  - **Note**: For Apple Silicon (M1/M2/M3) Macs, images are automatically built for `linux/amd64` to ensure Kubernetes compatibility
- MySQL 8.0+
- AWS CLI (for ECR integration, optional)
- GCP CLI (for GCR integration, optional)

## Project Setup Instructions

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
   - Create a FastAPI run configuration:
     - **Script path**: `app_layer/src/serve_app_layer/main.py`
     - **Module name**: `serve_app_layer.main`
     - **Working directory**: `app_layer/src`
     - **Environment variables**: Load from `.env` file
   - Or run from terminal:
     ```bash
     ./run_simple.sh
     ```

## Quick Start (Command Line)

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

## Environment Variables

### Core Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `ENV` | Environment (local/prod) | `local` |
| `DEV` | Development mode flag | `true` |
| `BUILD_ARTIFACTS_ROOT` | Build artifacts directory | `build_artifacts` |
| `LOG_FILE_ROOT_LOCAL` | Local logs directory | `logs` |
| `LOG_FILE_ROOT_PROD` | Production logs directory | `/var/www/artifact-builder/logs` |

### Database Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `MYSQL_HOST` | MySQL host | `localhost` |
| `MYSQL_PORT` | MySQL port | `3306` |
| `MYSQL_DATABASE` | Database name | `mlp_serve` |
| `MYSQL_USERNAME` | Database user | `root` |
| `MYSQL_PASSWORD` | Database password | `` |

### Container Registry Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `CONTAINER_IMAGE_PREFIX` | Docker image prefix | `darwin` |
| `CONTAINER_IMAGE_PREFIX_GCP` | GCP image prefix | `ray-images` |
| `IMAGE_REPOSITORY` | Repository name for local registry pushes | `serve-app` |
| `AWS_ECR_ACCOUNT_ID` | AWS ECR account ID | `` |
| `AWS_ECR_REGION` | AWS ECR region | `us-east-1` |
| `GCP_PROJECT_ID` | GCP project ID | `` |
| `GCP_CREDS_PATH` | GCP credentials file path | `/home/admin/gcp_creds.json` |
| `LOCAL_REGISTRY` | Local container registry URL (for kind/local K8s) | `localhost:55000` |

### Service URLs
| Variable | Description | Default |
|----------|-------------|---------|
| `APP_LAYER_URL` | App layer service URL | `http://localhost:8000` |

### OpenTelemetry Configuration (Optional)
| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_OTEL` | Enable OpenTelemetry exporters/instrumentation | Auto (disabled for `ENV=local`, enabled otherwise) |
| `OTEL_SERVICE_NAME` | Service name for telemetry | `artifact-builder` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint | `http://localhost:4318` |

See [env.example](env.example) for the complete configuration template.

## API Usage Examples

### Complete Workflow: Build and Track an Image

```bash
# Step 1: Submit a build task
RESPONSE=$(curl -s -X POST "http://localhost:8000/build_with_dockerfile" \
  -F "app_name=my-app" \
  -F "image_tag=v1.0" \
  -F "git_repo=https://github.com/username/repo.git" \
  -F "branch=main")

# Extract task_id from response
TASK_ID=$(echo $RESPONSE | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)
echo "Task ID: $TASK_ID"

# Step 2: Check build status
curl -X GET "http://localhost:8000/task/status?task_id=$TASK_ID"

# Step 3: Stream build logs (while building)
curl -X GET "http://localhost:8000/task/logs?task_id=$TASK_ID"

# Step 4: List all tasks
curl -X GET "http://localhost:8000/task"
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
curl -X GET "http://localhost:8000/healthcheck"
```

**Response:**

```json
{
  "status": "OK",
  "message": "Docker is running.",
  "docker_info": {
    "version": "24.0.6"
  }
}
```

## PyCharm Setup

1. **Open project** in PyCharm

2. **Mark source directories**: Right-click → Mark Directory as → Sources Root
   - `app_layer/src`
   - `core/src`
   - `model/src`

3. **Mark test directories**: Right-click → Mark Directory as → Test Sources Root
   - `app_layer/tests`
   - `core/tests`
   - `model/tests`

4. **Install dependencies**:
   ```bash
   pip install -e app_layer/.
   pip install -e core/.
   pip install -e model/.
   ```

5. **Configure run configuration**:
   - **Module name**: `serve_app_layer.main`
   - **Working directory**: `app_layer/src`
   - **Environment variables**: Load from `.env` file or set manually
   - **Python interpreter**: Project interpreter

6. **Run the application** using the configured run configuration (database will be auto-created in local/dev environments)

## Database Management

Darwin ML Serve uses **Tortoise ORM** for database management, providing an elegant async ORM solution for Python.

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

### Database Configuration

Configure database connection via environment variables:

```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=mlp_serve
MYSQL_USERNAME=root
MYSQL_PASSWORD=
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

### Benefits of Tortoise ORM

- ✅ **Async/Await Support** - Native async operations for FastAPI
- ✅ **Type Safety** - Pydantic-like model validation
- ✅ **Auto Schema Generation** - No manual SQL migrations needed
- ✅ **Query Builder** - Pythonic query API
- ✅ **Relationships** - Foreign key and relation support
- ✅ **Migration Support** - Built-in migration tools (Aerich)

### Production Considerations

For production deployments:

1. **Use Aerich for migrations**:
   ```bash
   pip install aerich
   aerich init -t core.src.serve_core.client.mysql_client.TORTOISE_ORM
   aerich init-db
   ```

2. **Disable auto-generation** in production:
   ```python
   register_tortoise(
       app,
       db_url=db_url,
       modules=modules,
       generate_schemas=False,  # Set to False in production
   )
   ```

3. **Use connection pooling** for better performance

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

### Adding New Environments

To add a custom environment beyond `local` and `prod`:

1. Edit `core/src/serve_core/constant/config_constants.py`:
   ```python
   CONFIGS_MAP = {
       "local": {...},
       "prod": {...},
       "staging": {  # Your custom environment
           "mysql_db": {
               "host": os.getenv("MYSQL_HOST", "staging-mysql"),
               "username": os.getenv("MYSQL_USERNAME", "root"),
               "password": os.getenv("MYSQL_PASSWORD", ""),
               "database": os.getenv("MYSQL_DATABASE", "mlp_serve"),
               "port": os.getenv("MYSQL_PORT", "3306"),
           },
           "s3.bucket": os.getenv("S3_BUCKET", "staging-bucket"),
           "app-layer-url": os.getenv("APP_LAYER_URL", "http://staging:8000"),
       }
   }
   ```

2. Set `ENV=staging` in your environment variables

3. Restart the application

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

### What's Instrumented

- ✅ **FastAPI routes** - Automatic span creation for all endpoints
- ✅ **HTTP requests** - Outbound requests to external services
- ✅ **Custom metrics** - Service-specific metrics (if configured)

### Local Testing with OTEL

To test OpenTelemetry locally:

```bash
# 1. Run OTEL collector (optional)
docker run -d -p 4318:4318 -p 55679:55679 \
  otel/opentelemetry-collector-contrib:latest

# 2. Enable OTEL in .env
ENABLE_OTEL=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# 3. Start the service
./run_simple.sh
```

## Container Registry Setup

### Local Registry (for Kubernetes Local Development)

For local Kubernetes development (e.g., with kind, minikube), you can configure a local container registry:

```bash
# Set up a local registry (example with kind)
docker run -d --restart=always -p 55000:5000 --name kind-registry registry:2

# Configure environment variables
export LOCAL_REGISTRY=localhost:55000
export IMAGE_REPOSITORY=serve-app
```

**How it works:**
- `LOCAL_REGISTRY` - The URL of your local container registry
- `IMAGE_REPOSITORY` - The repository name used when pushing images (must match your Kubernetes deployment expectations)
- Images are automatically tagged and pushed to the local registry when configured
- Format: `${LOCAL_REGISTRY}/${IMAGE_REPOSITORY}:${image_tag}`
- Example: `localhost:55000/serve-app:v1.0`

> **Note:** These variables are optional and only needed for local Kubernetes development.

### AWS ECR
```bash
# Configure AWS CLI
aws configure

# Set environment variables
export AWS_ECR_ACCOUNT_ID=123456789012
export AWS_ECR_REGION=us-east-1
```

### GCP GCR
```bash
# Authenticate with GCP
gcloud auth login

# Set environment variables
export GCP_PROJECT_ID=my-project
export GCP_CREDS_PATH=/path/to/service-account.json
```

## Deployment

### Docker Deployment
```bash
# Build application image
docker build -t artifact-builder .

# Run with environment file
docker run --env-file .env -p 8000:8000 artifact-builder
```

### Production Considerations
- Use external MySQL database
- Configure proper logging directory
- Set up container registry authentication
- Set up monitoring and alerting

## Troubleshooting

### Common Issues

1. **Docker not running**
   - Ensure Docker daemon is running
   - Check Docker permissions for the user

2. **Database connection failed**
   - Verify MySQL is running and accessible
   - Check database credentials in `.env`

3. **Container registry authentication failed**
   - Verify AWS/GCP credentials are configured
   - Check registry URLs and permissions

4. **Build tasks stuck in 'waiting' status**
   - Check background task processor is running
   - Verify Docker daemon accessibility

### Logs
- Application logs: `logs/` directory
- Build task logs: Available via API `/task/logs?task_id={id}`
- Database logs: Check MySQL error logs

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style
- Tests pass (`pytest`)
- Documentation is updated

## License

This project is open-sourced under [License TBD].

## Acknowledgments

Darwin ML Serve was originally developed internally and is now open-sourced to benefit the machine learning community.

---

For more detailed information, please refer to the API documentation at `/docs` when the service is running.