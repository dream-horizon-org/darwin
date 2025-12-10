# Contributing to Darwin ML Platform

Thank you for your interest in contributing to Darwin! This document provides guidelines and best practices for contributing to the Darwin ML Platform codebase.

---

## 📋 Table of Contents

- [Getting Started for Contributors](#-getting-started-for-contributors)
- [Development Guidelines](#-development-guidelines)
- [Testing Expectations](#-testing-expectations)
- [Adding New Features or Modules](#-adding-new-features-or-modules)
- [Security & Access](#-security--access)
- [Deploy & Verify Changes](#-deploy--verify-changes)
- [Communication Expectations](#-communication-expectations)
- [Getting Help](#-getting-help)

---

## 🚀 Getting Started for Contributors

### Prerequisites

Ensure you have the following installed on your system:

**Required Tools:**
- **Git** v2.30+
- **Docker** v20.10+ and Docker Compose
- **Kind** v0.11+ (for local Kubernetes)
- **kubectl** v1.24+
- **Helm** v3.9+
- **yq** v4.0+ (YAML processor, auto-installed by setup script)

**Language-Specific Requirements:**

| Component | Language | Version | Build Tool |
|-----------|----------|---------|------------|
| Feature Store | Java | 11+ | Maven 3.8+ |
| Compute, MLflow, Workspace, ML Serve | Python | 3.9.7+ | pip, venv |
| Cluster Manager | Go | 1.18+ | Go modules |

**System Requirements:**
- **OS**: macOS (darwin) or Linux
- **Architecture**: x86_64 (amd64) or arm64
- **RAM**: Minimum 16GB (for running full platform)
- **Disk**: At least 20GB free space

---

### Repository Setup

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/darwin-distro.git
cd darwin-distro
```

#### 2. Initialize Submodules

Darwin uses git submodules for service components:

```bash
# Initialize and update all submodules
git submodule sync --recursive
git submodule update --init --recursive --remote
```

#### 3. Run Initial Configuration

```bash
# Interactive wizard to select components to enable
./init.sh

# Build base images and setup local Kind cluster
./setup.sh -y  # Use -y flag to skip prompts

# Deploy Darwin platform to local cluster
./start.sh
```

**What this does:**
- Creates a Kind Kubernetes cluster
- Builds base Docker images (Java 11, Python 3.9.7, Go 1.18)
- Compiles and builds all enabled service images
- Deploys services via Helm to the local cluster

---

### Repository Structure

```
darwin-distro/
├── darwin-compute/          # Ray cluster orchestration (Python)
│   ├── app_layer/          # FastAPI REST API
│   ├── core/               # Business logic
│   ├── model/              # Data models
│   ├── sdk/                # Python SDK
│   └── script/             # Background jobs (status poller, auto-termination)
├── darwin-cluster-manager/  # Kubernetes orchestration (Go)
│   ├── services/           # Service layer
│   ├── rest/               # HTTP handlers
│   └── charts/             # Helm chart templates
├── feature-store/           # Feature Store (Java/Vert.x)
│   ├── app/                # Online serving
│   ├── admin/              # Feature management
│   ├── consumer/           # Kafka consumer
│   ├── populator/          # Bulk ingestion
│   └── python/             # Python SDK
├── mlflow/                  # Experiment tracking (Python)
│   ├── app_layer/          # FastAPI wrapper
│   └── sdk/                # MLflow client wrapper
├── ml-serve-app/            # Model serving (Python)
│   ├── app_layer/          # REST API
│   ├── core/               # Deployment logic
│   ├── model/              # Tortoise ORM models
│   └── runtime/            # Serving runtime template
├── artifact-builder/        # Docker image builder (Python)
├── chronos/                 # Event processing (Python)
├── workspace/               # Project management (Python)
├── darwin-catalog/          # Data catalog (Java/Spring Boot)
├── hermes-cli/              # CLI tool (Python/Typer)
├── helm/                    # Helm charts
│   └── darwin/              # Umbrella chart
│       ├── charts/datastores/  # MySQL, Cassandra, Kafka, etc.
│       └── charts/services/    # Application services
├── deployer/                # Build infrastructure
│   ├── images/             # Base Docker images
│   └── scripts/            # Image builders
├── kind/                    # Local Kubernetes config
├── .prompts/                # AI agent documentation
├── init.sh                  # Configuration wizard
├── setup.sh                 # Build and setup script
├── start.sh                 # Deployment script
└── services.yaml            # Service registry
```

---

### Setting Up Development Environments

#### Python Services (Compute, MLflow, Workspace, ML Serve, Chronos)

```bash
# Example: Setting up darwin-compute
cd darwin-compute

# Create virtual environment
python3.9 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install all modules in editable mode
pip install -e app_layer/.
pip install -e core/.
pip install -e model/.
pip install -e sdk/.
pip install -e script/.

# Install development dependencies
pip install -r core/requirements_dev.txt
```

**PyCharm Setup:**
1. Mark all `src` directories as "Sources Root" (Right-click → Mark Directory as → Sources Root)
2. Mark all `tests` directories as "Test Sources Root"
3. Configure Python interpreter to use the virtual environment
4. Install plugins: Black (code formatter), EnvFile (environment variables)

#### Java Services (Feature Store, Catalog)

```bash
# Example: Setting up feature-store
cd feature-store

# Build the project
mvn clean compile package

# Run tests
mvn clean verify
```

**IntelliJ IDEA Setup:**
1. Import as Maven project
2. Set JDK to 11
3. Enable annotation processing (for Lombok and MapStruct)
4. Run `mvn clean compile` to generate sources
5. Sync Maven project: Right-click `pom.xml` → Maven → Reload project

#### Go Services (Cluster Manager)

```bash
# Example: Setting up darwin-cluster-manager
cd darwin-cluster-manager

# Download dependencies
go mod download

# Build the project
make build

# Run tests
make test
```

---

## 🧱 Development Guidelines

### Code Style Standards

#### Python Services

**Style Guide**: PEP 8 with line length 120 characters

**Required Tools:**
- **Black** (code formatter): `black -l 120 src/ tests/`
- **isort** (import sorting): `isort src/ tests/`
- **mypy** (type checking): `mypy src/`
- **pylint** (linting): `pylint src/`
- **pytest** (testing): `pytest tests/`

**Type Hints**: All functions must have type hints
```python
from typing import List, Dict, Optional

def fetch_cluster(cluster_id: str, user: Optional[str] = None) -> Dict[str, Any]:
    """Fetch cluster details by ID."""
    ...
```

**Docstrings**: Use Google-style docstrings
```python
def create_cluster(cluster_def: ComputeClusterDefinition) -> dict:
    """Create a new Ray cluster.

    Args:
        cluster_def: Cluster configuration definition

    Returns:
        Dictionary containing cluster_id and status

    Raises:
        ValueError: If cluster definition is invalid
    """
    ...
```

**Logging**: Use structured logging
```python
from loguru import logger

logger.info(f"Creating cluster: {cluster_id}")
logger.error(f"Failed to create cluster: {cluster_id}", exc_info=True)
```

#### Java Services

**Style Guide**: Google Java Style Guide

**Required Tools:**
- **Spotless** (code formatter): `mvn spotless:apply`
- **Checkstyle** (style checker): Configured in pom.xml
- **Lombok**: Use for boilerplate reduction (@Data, @Builder)
- **MapStruct**: Use for DTO mappings

**Code Formatting**:
```bash
# Format code before committing
mvn spotless:apply
```

**Naming Conventions**:
- Classes: PascalCase (`FeatureGroupService`)
- Methods: camelCase (`createFeatureGroup`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- Packages: lowercase (`com.dream11.app.service`)

#### Go Services

**Style Guide**: Effective Go + Go Code Review Comments

**Required Tools:**
- **gofmt** (formatting): `gofmt -w .`
- **golint** (linting): `golint ./...`
- **go vet** (static analysis): `go vet ./...`

**Naming Conventions**:
- Exported identifiers: PascalCase (`CreateCluster`)
- Private identifiers: camelCase (`getClusterStatus`)
- Acronyms: All uppercase or all lowercase (`HTTPServer`, `httpServer`)

---

### Project-Specific Conventions

#### `.odin/` Directory Structure

Every service submodule **MUST** contain `.odin/{service-name}/` with these scripts:

```
service-name/
├── .odin/
│   └── {service-name}/
│       ├── build.sh      # Compile and prepare artifacts (REQUIRED)
│       ├── setup.sh      # Install dependencies at Docker build time (REQUIRED)
│       ├── start.sh      # Container entrypoint (REQUIRED)
│       └── pre-deploy.sh # Database migrations (OPTIONAL)
```

**build.sh** - Compiles application, outputs to `target/`:
```bash
#!/bin/bash
set -e

SERVICE_NAME="my-service"
mkdir -p target/$SERVICE_NAME

# Copy application files
cp -r src/* target/$SERVICE_NAME/
cp requirements.txt target/$SERVICE_NAME/

echo "Build completed for $SERVICE_NAME"
```

**setup.sh** - Runs at Docker build time:
```bash
#!/bin/bash
set -e

cd /app
pip install --no-cache-dir -r requirements.txt
```

**start.sh** - Container entrypoint:
```bash
#!/bin/bash
cd /app
exec uvicorn main:app --host 0.0.0.0 --port 8000
```

#### API Design Guidelines

**REST API Standards:**
- Use FastAPI for Python services
- Use Spring Boot/Vert.x for Java services
- Follow RESTful conventions (GET, POST, PUT, DELETE)
- Use snake_case for JSON keys in Python services
- Use camelCase for JSON keys in Java services
- Include OpenAPI/Swagger documentation

**Response Format** (Python services):
```python
{
    "status": "SUCCESS" | "FAILURE",
    "data": {...},
    "message": "Optional message"
}
```

**Error Handling**:
```python
from fastapi import HTTPException

raise HTTPException(
    status_code=404,
    detail={"error": "ClusterNotFound", "cluster_id": cluster_id}
)
```

#### Database Conventions

**MySQL Naming**:
- Tables: snake_case (`compute_clusters`, `feature_groups`)
- Columns: snake_case (`cluster_id`, `created_at`)
- Indexes: `idx_{table}_{column}`
- Foreign keys: `fk_{table}_{referenced_table}`

**Schema Migrations**:
- Feature Store: Flyway migrations in `resources/db/`
- Compute: SQL scripts in `resources/db/mysql/migrations/`
- ML Serve/Artifact Builder: Tortoise ORM auto-migration

**Connection Pooling**:
- Use connection pooling for all database access
- Configuration files in `resources/config/mysql/`

---

### Shared Libraries and Dependencies

#### Internal Dependencies

**Python Packages** (installed in editable mode):
- `compute_model`: Shared models across Compute SDK and service
- `ml_serve_model`: Shared models for ML Serve
- `darwin_fs`: Feature Store Python SDK
- `darwin_mlflow`: MLflow wrapper SDK
- `darwin_compute`: Compute SDK

**Java Modules** (Maven multi-module):
- `core`: Shared domain logic
- `app`: Application service
- `admin`: Admin service
- `consumer`: Consumer service

#### External Dependencies

**Version Pinning**: All dependencies must be pinned to specific versions
```python
# requirements.txt
fastapi==0.104.1
ray==2.37.0
mlflow==2.12.2
```

**Dependency Updates**: 
- Create a separate PR for dependency updates
- Run full test suite before merging
- Document breaking changes in PR description

---

### Configuration Management

**Environment Variables**:
- Use uppercase SNAKE_CASE (`MYSQL_HOST`, `ENV`)
- Document all environment variables in service README
- Use `.env.example` files (NEVER commit actual `.env` files)

**Configuration Files**:
- YAML for Kubernetes/Helm configurations
- `.conf` files for database connections
- Store in `resources/config/` directory

**Secrets Management**:
- Use Kubernetes Secrets in production
- Use environment variables in local development
- NEVER hardcode credentials in code

---

## 🧪 Testing Expectations

### Test Coverage Requirements

| Service Type | Unit Tests | Integration Tests | E2E Tests |
|-------------|-----------|------------------|-----------|
| Python Services | ≥70% | Required | Optional |
| Java Services | ≥60% | Required | Required |
| Go Services | ≥60% | Required | Optional |

### Running Tests

#### Python Services

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=compute_core --cov-report=html

# Run specific test file
pytest tests/test_compute.py

# Run specific test
pytest tests/test_compute.py::test_create_cluster

# Run with verbose output
pytest -v

# Run integration tests only
pytest -m integration
```

**Test Markers**:
```python
import pytest

@pytest.mark.unit
def test_cluster_validation():
    ...

@pytest.mark.integration
def test_dcm_integration():
    ...

@pytest.mark.slow
def test_long_running_job():
    ...
```

#### Java Services

```bash
# Run all tests
mvn test

# Run with coverage
mvn clean verify

# Run specific test class
mvn test -Dtest=FeatureGroupServiceTest

# Skip tests (use sparingly)
mvn clean package -DskipTests
```

#### Go Services

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./services/clusterv2

# Run with verbose output
go test -v ./...
```

### Test Organization

```
service/
├── tests/                  # Test directory
│   ├── conftest.py        # Pytest fixtures (Python)
│   ├── test_unit/         # Unit tests
│   ├── test_integration/  # Integration tests
│   └── test_e2e/          # End-to-end tests
```

### Test Data

**Fixtures and Mocks**:
- Store test data in `tests/fixtures/` or `tests/resources/`
- Use pytest fixtures for reusable test setup
- Mock external services (databases, APIs) in unit tests
- Use real services in integration tests (Docker Compose)

**Example Pytest Fixture**:
```python
# conftest.py
import pytest
from compute_core.compute import Compute

@pytest.fixture
def compute_client():
    """Provide a Compute client for tests."""
    return Compute(env="test")

@pytest.fixture
def sample_cluster_definition():
    """Provide a sample cluster definition."""
    return {
        "name": "test-cluster",
        "runtime": "Ray2.37.0-Py310-CPU",
        "head_node": {"cores": 2, "memory": 4}
    }
```

### Testing Best Practices

1. **Test Naming**: Use descriptive names (`test_create_cluster_with_valid_config`)
2. **AAA Pattern**: Arrange, Act, Assert
3. **Isolation**: Tests should not depend on each other
4. **Cleanup**: Always clean up resources (clusters, databases) after tests
5. **Deterministic**: Tests should produce consistent results
6. **Fast**: Unit tests should run in milliseconds

---

## 👐 Adding New Features or Modules

### Proposing Changes

1. **Check Existing Issues**: Search for existing issues/discussions
2. **Create an Issue**: Describe the feature, use case, and proposed approach
3. **Discuss**: Wait for feedback from maintainers before implementation
4. **Design Document**: For major features, create a design document

### Pull Request Workflow

#### 1. Create a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions**:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

#### 2. Make Your Changes

**Checklist before committing**:
- [ ] Code follows style guidelines (run linters/formatters)
- [ ] All tests pass (`pytest`, `mvn test`, `go test`)
- [ ] New tests added for new functionality
- [ ] Documentation updated (README, docstrings, comments)
- [ ] No sensitive data committed (credentials, tokens, PII)
- [ ] Type hints added (Python) or proper types used (Java/Go)
- [ ] No debug statements or commented-out code
- [ ] Environment variables documented

#### 3. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Format: <type>(<scope>): <subject>

git commit -m "feat(compute): add auto-scaling policy support"
git commit -m "fix(feature-store): resolve Cassandra timeout issues"
git commit -m "docs(mlflow): update SDK usage examples"
git commit -m "refactor(serve): simplify deployment logic"
git commit -m "test(catalog): add lineage tracking tests"
```

**Commit Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build scripts)
- `perf`: Performance improvements

**Commit Scope Examples**:
- `compute`, `feature-store`, `mlflow`, `serve`, `catalog`, `chronos`
- `sdk`, `cli`, `helm`, `deploy`

#### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Create a Pull Request on GitHub with this template:

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe the tests you ran:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing performed

## Deployment Notes
Any special deployment considerations?

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
```

---

### Component-Specific Guidelines

#### Darwin Compute

**Critical Paths**:
- Cluster lifecycle management (create, start, stop, restart)
- DCM integration (cluster deployment)
- Ray cluster configuration generation
- Auto-termination policies

**Testing Requirements**:
- Mock DCM responses in unit tests
- Test cluster state transitions
- Validate YAML generation for Ray clusters
- Test auto-termination policy triggers

**Breaking Change Checklist**:
- [ ] SDK backward compatibility maintained
- [ ] Database schema migrations included
- [ ] API versioning updated if needed
- [ ] Documentation updated

#### Feature Store

**Critical Paths**:
- Feature serving API (low-latency path)
- Cassandra read/write operations
- Feature group schema management
- Kafka consumer offset management

**Testing Requirements**:
- Performance tests for feature retrieval (<10ms)
- Integration tests with Cassandra
- Schema evolution tests
- Consumer lag monitoring

**Breaking Change Checklist**:
- [ ] Python SDK updated (`darwin_fs`)
- [ ] API version bump
- [ ] Migration scripts for schema changes
- [ ] Backward compatibility for old schemas

#### ML Serve

**Critical Paths**:
- Serve deployment logic
- Artifact build integration
- DCM integration for deployment
- Model URI resolution (MLflow/S3)

**Testing Requirements**:
- Test deployment to multiple environments
- Mock artifact builder responses
- Test auto-scaling configuration
- Validate Helm values generation

**Breaking Change Checklist**:
- [ ] Hermes CLI updated
- [ ] Deployment configs migrated
- [ ] Active deployments not affected

#### MLflow

**Critical Paths**:
- Experiment and run tracking
- Artifact storage (S3)
- Authentication and permissions
- Proxy to MLflow backend

**Testing Requirements**:
- Test user permissions
- Artifact upload/download
- Experiment CRUD operations
- Auth middleware

**Breaking Change Checklist**:
- [ ] SDK wrapper updated (`darwin_mlflow`)
- [ ] Migration for database schema
- [ ] Existing experiments accessible

---

## 🔐 Security & Access

### Secrets Management

**NEVER Commit**:
- Database credentials
- API keys and tokens
- AWS access keys
- Private keys or certificates
- User PII or sensitive data
- Internal hostnames or IPs

**Approved Methods**:
- **Local Development**: Use `.env` files (add to `.gitignore`)
- **Kubernetes**: Use Kubernetes Secrets
- **CI/CD**: Use GitHub Secrets or CI environment variables

**Example `.env` file** (NEVER commit):
```bash
# Database
MYSQL_HOST=localhost
MYSQL_USERNAME=darwin
MYSQL_PASSWORD=password

# AWS (LocalStack for local)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
```

### Authentication & Authorization

**Service Authentication**:
- Use service accounts in Kubernetes
- Use IAM roles for AWS services
- Use token-based auth for service-to-service communication

**User Authentication**:
- Email-based authentication via headers (`email` header)
- Token-based authentication for CLI tools
- MLflow Basic Auth for experiment access

**Implementing Auth in New Services**:
```python
from fastapi import Header, HTTPException

async def get_current_user(email: str = Header(...)):
    """Extract user from email header."""
    if not email:
        raise HTTPException(status_code=401, detail="Authentication required")
    return email
```

### Code Review Security Checklist

Reviewers should verify:
- [ ] No hardcoded credentials
- [ ] SQL injection prevention (parameterized queries)
- [ ] Input validation and sanitization
- [ ] Proper error handling (no sensitive data in error messages)
- [ ] Rate limiting on public endpoints
- [ ] CORS configured appropriately
- [ ] Dependencies have no known vulnerabilities

---

## 📦 Deploy & Verify Changes

### Local Deployment

#### Full Platform Deployment

```bash
# Clean rebuild
./setup.sh -y

# Redeploy with changes
./start.sh

# Check deployment status
kubectl get pods -n darwin
kubectl logs -f deployment/darwin-compute -n darwin
```

#### Service-Specific Deployment

**Option 1: Rebuild and Redeploy Single Service**

```bash
# Example: Rebuild darwin-compute
cd darwin-compute

# Rebuild Docker image
docker build -t darwin-compute:latest \
  --build-arg BASE_IMAGE=darwin/python:3.9.7-pip-bookworm-slim \
  -f ../deployer/images/Dockerfile ..

# Tag and push to local registry
docker tag darwin-compute:latest localhost:5000/darwin-compute:latest
docker push localhost:5000/darwin-compute:latest

# Restart deployment
kubectl rollout restart deployment/darwin-compute -n darwin
kubectl rollout status deployment/darwin-compute -n darwin
```

**Option 2: Local Development (without Docker)**

```bash
# Example: Run darwin-compute locally
cd darwin-compute/app_layer

# Set environment variables
export ENV=local
export VAULT_SERVICE_MYSQL_USERNAME=darwin
export VAULT_SERVICE_MYSQL_PASSWORD=password
# ... other env vars

# Run service
uvicorn src.compute_app_layer.main:app --reload --port 8000
```

#### Testing Integration

**Port Forwarding for Local Testing**:
```bash
# Forward Darwin Compute
kubectl port-forward deployment/darwin-compute 8000:8000 -n darwin

# Forward MySQL
kubectl port-forward service/darwin-mysql 3306:3306 -n darwin

# Forward MLflow
kubectl port-forward deployment/darwin-mlflow-app 8080:8000 -n darwin
```

**Test Endpoints**:
```bash
# Health check
curl http://localhost:8000/health

# Create cluster (example)
curl -X POST http://localhost:8000/cluster \
  -H "Content-Type: application/json" \
  -H "msd-user: {\"email\": \"test@example.com\"}" \
  -d @test-cluster-config.json
```

### Validation Checklist

Before requesting review, verify:

**Service Health**:
- [ ] Service pod is running: `kubectl get pods -n darwin`
- [ ] Health endpoint responds: `curl http://service/health`
- [ ] Logs show no errors: `kubectl logs -f deployment/service -n darwin`

**API Functionality**:
- [ ] CRUD operations work as expected
- [ ] Authentication/authorization works
- [ ] Database connections successful
- [ ] External service integrations work (DCM, MLflow, Feature Store)

**Performance**:
- [ ] Response times are acceptable (<1s for most operations)
- [ ] No memory leaks (monitor pod memory usage)
- [ ] Database queries are optimized (check slow query logs)

**Integration**:
- [ ] Dependent services can communicate
- [ ] SDKs work with changes
- [ ] CLI commands function correctly

---

### End-to-End Testing

#### Test Complete Workflow: Ray Cluster

```bash
# 1. Create a cluster via REST API
curl --location 'http://localhost/compute/cluster' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "cluster_name": "test-cluster",
    "tags": ["test"],
    "runtime": "Ray2.37.0-Py310-CPU",
    "inactive_time": 30,
    "head_node_config": {
        "cores": 4,
        "memory": 8
    },
    "worker_node_configs": [
        {
            "cores": 2,
            "memory": 4,
            "min_pods": 1,
            "max_pods": 2
        }
    ],
    "user": "test@example.com"
}'

# 2. Verify cluster in Kubernetes
kubectl get rayclusters -n ray

# 3. Access Jupyter
# Get Cluster Dashboards link via below API using cluster_id returned in create_cluster response
curl --location 'http://localhost/compute/cluster/{cluster_id}/dashboards'
# Access Jupyter notebook at the returned jupyter_lab_url

# 4. Run a job
# Submit job via Ray dashboard or SDK

# 5. Stop cluster
curl --location --request POST 'http://localhost/compute/cluster/stop-cluster/{cluster_id}' \
  --header 'msd-user: {"email": "test@example.com"}'

# 6. Verify cleanup
kubectl get rayclusters -n ray  # Should be deleted
```

#### Test Complete Workflow: Model Deployment via Hermes CLI

For complete Hermes CLI documentation, see [hermes-cli/CLI.md](hermes-cli/CLI.md)

```bash
# 1. Setup Hermes CLI
source hermes-cli/.venv/bin/activate

# 2. Configure authentication
export HERMES_USER_TOKEN=admin-token-default-change-in-production
hermes configure

# 3. Create environment (if not already created)
hermes create-environment \
  --name local \
  --domain-suffix .local \
  --cluster-name kind

# 4. Create serve
hermes create-serve \
  --name test-model \
  --type api \
  --space serve \
  --description "Test model deployment"

# 5. Deploy model
hermes deploy-model \
  --serve-name test-model \
  --artifact-version v1 \
  --model-uri mlflow-artifacts:/1/abc123/artifacts/model \
  --cores 2 \
  --memory 4 \
  --node-capacity spot \
  --min-replicas 1 \
  --max-replicas 2

# 6. Verify deployment in Kubernetes
kubectl get deployments -n serve
kubectl get pods -n serve
kubectl get ingresses -n serve

# 7. Test inference endpoint
curl -X POST http://localhost/serve/test-model/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [[1.0, 2.0, 3.0]]}'

# 8. Verify auto-scaling (optional)
kubectl get hpa -n serve

# 9. Cleanup (undeploy model)
hermes undeploy-model --serve-name test-model

# 10. Verify cleanup
kubectl get deployments -n serve  # test-model should be gone
```

---

## 📣 Communication Expectations

### Commit Messages

**Format**: `<type>(<scope>): <subject>`

**Good Examples**:
```
feat(compute): add GPU node support for Ray clusters
fix(feature-store): resolve timeout in Cassandra batch reads
docs(sdk): add examples for cluster auto-scaling
refactor(serve): simplify artifact deployment logic
test(chronos): add integration tests for event transformers
perf(feature-store): optimize feature retrieval query
```

**Bad Examples**:
```
✗ fixed bug
✗ updates
✗ WIP
✗ more changes
```

**Rules**:
- Subject line max 72 characters
- Use imperative mood ("add" not "added" or "adds")
- No period at the end of subject line
- Body wraps at 72 characters (if needed)
- Reference issues/PRs in body (`Closes #123`, `Relates to #456`)

---

### Pull Request Guidelines

**Title Format**: Same as commit messages
```
feat(compute): add GPU node support for Ray clusters
```

**Description Requirements**:
1. **What**: Describe the changes made
2. **Why**: Explain the motivation and context
3. **How**: Explain implementation approach (if non-obvious)
4. **Testing**: Describe how you tested the changes
5. **Breaking Changes**: Highlight any breaking changes
6. **Screenshots**: Include for UI changes

**Size Guidelines**:
- Aim for small, focused PRs (<500 lines changed)
- Split large features into multiple PRs
- Keep related changes together (don't mix features with refactoring)

**Draft PRs**:
- Use draft PRs for work-in-progress
- Request review only when ready for review
- Convert to ready when tests pass and you've self-reviewed

---

### Code Review Process

**As an Author**:
1. Self-review before requesting review
2. Ensure all checks pass (tests, linters)
3. Add reviewers (1-2 reviewers recommended)
4. Respond to feedback promptly
5. Mark conversations as resolved when addressed
6. Squash commits before merging (if requested)

**As a Reviewer**:
1. Review within 2 business days
2. Be respectful and constructive
3. Ask questions rather than making demands
4. Approve when satisfied
5. Request changes if necessary
6. Block if critical issues found

**Review Checklist**:
- [ ] Code follows style guidelines
- [ ] Logic is sound and correct
- [ ] Tests are adequate and pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance implications considered
- [ ] Error handling is appropriate
- [ ] Breaking changes are justified and documented

**Feedback Examples**:

**Good Feedback**:
```
Consider using a connection pool here to improve performance. 
What do you think about using the `mysql.connector.pooling` module?
```

**Poor Feedback**:
```
This is wrong. Use connection pooling.
```

---

### Issue Reporting

**Bug Reports** should include:
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Create cluster with config '...'
2. Start cluster
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment**
- Darwin version:
- Service affected:
- Kubernetes version:
- Browser (if UI bug):

**Logs**
```
<paste relevant logs>
```

**Screenshots**
If applicable, add screenshots.
```

**Feature Requests** should include:
```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How would you solve it?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Any other information.
```

---

## 🙋 Getting Help

### Resources

- **Documentation**: Check service-specific READMEs in each submodule
- **AI Prompts**: See `.prompts/` directory for detailed component documentation
- **Existing Issues**: Search GitHub issues for similar questions
- **Code Examples**: Check `examples/` directory
- **Hermes CLI**: See [hermes-cli/CLI.md](hermes-cli/CLI.md) for complete CLI documentation

### Asking Questions

**Good Questions**:
- Include context (what you're trying to do)
- Show what you've tried
- Include error messages and logs
- Specify your environment (local/dev/prod)

**Where to Ask**:
- GitHub Issues: For bugs and feature requests
- GitHub Discussions: For questions and general discussion
- Pull Request Comments: For specific code questions
- Internal Channels: [Specify your internal communication channels]

---

## 🎓 Learning Resources

### Understanding Darwin Architecture

1. Start with `README.md` for high-level overview
2. Read `.prompts/00-overview.md` for architecture details
3. Explore individual service READMEs:
   - `darwin-compute/README.md`
   - `feature-store/README.md`
   - `mlflow/README.md`
   - `ml-serve-app/README.md`
   - `chronos/README.md`
4. Review Hermes CLI documentation: `hermes-cli/CLI.md`

### Technology-Specific Resources

**Ray**:
- [Ray Documentation](https://docs.ray.io/)
- Ray version used: 2.37.0

**MLflow**:
- [MLflow Documentation](https://mlflow.org/docs/latest/index.html)
- MLflow version used: 2.12.2

**Kubernetes**:
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)

**FastAPI**:
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

## 📝 Additional Notes

### Backward Compatibility

When making changes to public APIs or SDKs:
1. Maintain backward compatibility whenever possible
2. Deprecate before removing (give users time to migrate)
3. Version APIs if breaking changes are necessary
4. Document migration path in release notes

### Performance Considerations

- Profile code before and after changes
- Use connection pooling for databases
- Implement caching where appropriate
- Consider impact on high-traffic endpoints
- Load test significant changes

### Documentation Standards

- Update README when adding features
- Add docstrings to all public functions/classes
- Include code examples in documentation
- Document configuration options
- Keep API documentation (Swagger) up to date

---

## ✅ Final Checklist

Before submitting your PR:

- [ ] Code follows style guidelines (linters pass)
- [ ] All tests pass (`pytest`, `mvn test`, `go test`)
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] PR description is complete
- [ ] No sensitive data committed
- [ ] Self-review completed
- [ ] Local deployment tested
- [ ] Integration with other services verified

---

Thank you for contributing to Darwin ML Platform! Your contributions help build a better ML infrastructure for everyone. 🚀
