# Darwin CI Guidelines

This document outlines the CI/CD architecture, conventions, and best practices for the Darwin project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Workflow Structure](#workflow-structure)
3. [Docker Image Labeling](#docker-image-labeling)
4. [Caching Strategy](#caching-strategy)
5. [Cleanup Rules](#cleanup-rules)
6. [Adding New Service CIs](#adding-new-service-cis)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

Darwin CI uses a **two-tier architecture** with a **final cleanup workflow**:

### Tier 1: Infrastructure CI

Validates the core infrastructure scripts that all services depend on. **Runs first before any service CI.**

**Triggers:** Changes to:
- Infrastructure files: `init.sh`, `setup.sh`, `start.sh`, `services.yaml`, `kind/**`, `deployer/**`
- OR any service files: `ml-serve-app/**`, `artifact-builder/**`, etc.

**Purpose:**
- Lint shell scripts
- Validate Kind cluster creation
- Deploy a minimal test service (`ci-test-service`) to verify the cluster works
- Ensure infrastructure changes don't break service deployments

**Cleanup:** Only removes `ci-test-service` image.

### Tier 2: Service CI

Per-service pipelines that run in parallel **after Infrastructure CI passes**.

**Triggers:** Called via `workflow_call` from Infrastructure CI (only runs if service files changed AND infra passed)

**Purpose:**
- Linting
- Unit tests
- Deployment and healthcheck validation
- Integration tests

**Cleanup:** Each service only removes its own images and deployments.

### Final Cleanup

A separate workflow (`final-cleanup.yml`) that runs after all CIs complete.

**Purpose:**
- Prune ALL Darwin-labeled images
- Delete Kind cluster
- Clean up containers and volumes
- Clean up workspace directories

**Key:** Uses `if: always()` to ensure it runs even if previous jobs failed or were skipped.

### Flow Diagram

```
                    ┌─────────────────────────────────┐
                    │       PR Created/Updated        │
                    └─────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    infrastructure-ci.yml                        │
│            (ONLY workflow triggered by PR)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐                                           │
│  │  detect-changes  │ ← Uses dorny/paths-filter                 │
│  │  (paths-filter)  │   Outputs: ml_serve, artifact_builder     │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                           │
│  │   lint-scripts   │                                           │
│  │   validate-yaml  │                                           │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                           │
│  │   cluster-test   │ ← Validates Kind cluster works            │
│  └────────┬─────────┘                                           │
│           │                                                     │
│      ┌────┴────┐                                                │
│      ▼         ▼                                                │
│  SUCCESS     FAIL ────────────────────────────► (no service CIs)│
│      │                                                          │
│      ▼                                                          │
│  ┌──────────────────────────────────────────┐                   │
│  │  Service CIs (via workflow_call)         │                   │
│  │  Only called if their files changed      │                   │
│  ├──────────────────────────────────────────┤                   │
│  │ ml-serve-ci:                             │                   │
│  │   if: detect-changes.outputs.ml_serve    │                   │
│  │   uses: ./.github/workflows/ml-serve-ci  │                   │
│  │                                          │                   │
│  │ artifact-builder-ci:                     │                   │
│  │   if: detect-changes.outputs.artifact... │                   │
│  │   uses: ./.github/workflows/artifact...  │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────────┐
                    │  final-cleanup (via workflow_call)   | 
                    |        if: always()                  │
                    │ needs: [cluster-test, service-CIs...]│
                    ├──────────────────────────────────────┤
                    │ • Prune ALL Darwin images            │
                    │ • Delete Kind cluster                │
                    │ • Clean up volumes/containers        │
                    └──────────────────────────────────────┘
```

### Key Behavior

| Scenario | What Happens |
|----------|--------------|
| Infrastructure CI fails | Service CIs **never called** → Final cleanup runs |
| Only infra files changed | No service CIs called → Final cleanup runs |
| Only ml-serve files changed | Only ml-serve-ci called → Final cleanup runs |
| Both services changed | Both CIs run in **parallel** → Final cleanup runs |
| One service CI fails | Other service CI unaffected (parallel) → Final cleanup runs |

### Why This Design?

| Benefit | Explanation |
|---------|-------------|
| Single PR trigger | Only `infrastructure-ci.yml` listens to `pull_request` |
| No wasted runs | Service CIs never start if not needed |
| Clear dependencies | `needs: [cluster-test]` ensures infra passes first |
| Fast detection | `dorny/paths-filter` checks files without API calls |
| Parallel services | Service CIs run independently via `workflow_call` |

---

## Workflow Structure

### Naming Conventions

| Workflow Type | Naming Pattern | Example |
|---------------|----------------|---------|
| Infrastructure | `infrastructure-ci.yml` | `.github/workflows/infrastructure-ci.yml` |
| Service CI | `<service-name>-ci.yml` | `ml-serve-ci.yml`, `darwin-workflow-ci.yml` |
| Final Cleanup | `final-cleanup.yml` | `.github/workflows/final-cleanup.yml` |

### Standard CI Job Structure

Service CIs are reusable workflows called via `workflow_call`. They are simple and focused.

```yaml
name: <Service Name> - CI

on:
  workflow_call:  # Called by infrastructure-ci.yml
  workflow_dispatch:  # Manual trigger

jobs:
  lint:
    name: Linting
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Python/Java/Go
      - Run linter

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup language runtime
      - Install dependencies
      - Run tests

  deploy-and-healthcheck:
    name: Deployment & Health Check
    runs-on: [self-hosted, Linux, X64, darwin]
    needs: [lint, unit-tests]
    steps:
      - Setup cluster (reusable action)
      - Build and deploy service
      - Run healthcheck

  integration-tests:
    name: Integration Tests
    runs-on: [self-hosted, Linux, X64, darwin]
    needs: [deploy-and-healthcheck]
    steps:
      - Run integration test suite against deployed service

  cleanup:
    name: Cleanup
    runs-on: [self-hosted, Linux, X64, darwin]
    if: always()
    needs: [integration-tests]
    steps:
      - Service-specific cleanup (own images/deployment only)
```

**Note:** No `check-trigger` job needed! Infrastructure CI handles all gating logic.

### Cleanup Action Usage

Use the reusable cleanup action with `service_name` to clean up only the specific service:

```yaml
- name: Cleanup
  if: always()
  uses: ./.github/actions/cleanup
  with:
    service_name: "ml-serve-app"     # Only cleanup this service
    delete_cluster: "false"           # Don't delete cluster (final-cleanup will)
    delete_deployment: "true"         # Delete the k8s deployment
    prune_darwin_images: "true"       # Remove this service's image
    prune_volumes: "false"            # Don't prune volumes (final-cleanup will)
    prune_containers: "false"         # Don't prune containers (final-cleanup will)
    workspace_dir: ${{ github.workspace }}
```

---

## Docker Image Labeling

All Darwin-built images **MUST** have two labels for proper cleanup.

### Required Labels

```bash
--label "maintainer=darwin"
--label "darwin.service=<service-name>"
```

### Applied Labels Example

```bash
docker build \
    --label "maintainer=darwin" \
    --label "darwin.service=ml-serve-app" \
    -t ml-serve-app:latest \
    -f "$DOCKERFILE_PATH/Dockerfile" \
    "$DOCKERFILE_PATH"
```

The `maintainer=darwin` label is used for final cleanup (prune all Darwin images).
The `darwin.service=<service-name>` label enables service-specific cleanup.

---

## Caching Strategy

To avoid Docker Hub rate limits, we preserve base images across CI runs.

### Image Categories

| Image Type | Example | Labels | Cleanup Behavior |
|------------|---------|--------|------------------|
| Darwin apps | `ml-serve-app:latest` | `maintainer=darwin`, `darwin.service=ml-serve-app` | **Service cleanup:** Own image only. **Final cleanup:** Pruned. |
| CI test service | `ci-test-service:latest` | `maintainer=darwin`, `darwin.service=ci-test-service` | **Infra cleanup:** Pruned. **Final cleanup:** Pruned. |
| Base images | `python:3.9-slim`, `openjdk:11` | None | **Preserved** (cached) |
| Datastore images | `mysql:8.0`, `redis:7` | None | **Preserved** (cached) |
| Operator images | `kuberay/operator:v1.0.0` | None | **Preserved** (cached) |

### How It Works

1. **Build phase**: Darwin images are built with service-specific labels
2. **Service cleanup**: Each CI only removes its own images by name
3. **Final cleanup**: Prunes ALL `maintainer=darwin` labeled images
4. **Result**: No race conditions, base images preserved

---

## Cleanup Rules

### Why Service-Specific Cleanup?

When multiple service CIs run in parallel, they could interfere with each other if all tried to prune Darwin images at once. Service-specific cleanup prevents race conditions.

### Infrastructure CI Cleanup

Only removes the `ci-test-service` image:

```bash
# Remove ONLY ci-test-service images
docker rmi -f ci-test-service:latest || true
docker rmi -f localhost:5000/ci-test-service:latest || true
kubectl delete namespace ci-test --ignore-not-found=true
# Do NOT prune all Darwin images here
```

### Service CI Cleanup

Each service removes ONLY its own images and deployment:

```bash
# Example for ml-serve-app
docker rmi -f ml-serve-app:latest || true
docker rmi -f localhost:5000/ml-serve-app:latest || true
kubectl delete deployment darwin-ml-serve-app -n darwin --ignore-not-found=true
# Do NOT prune all Darwin images or delete cluster
```

### Final Cleanup (final-cleanup.yml)

Runs after any CI workflow completes, triggered by `workflow_run`:

```bash
# Prune ALL Darwin-labeled images
docker image prune -af --filter "label=maintainer=darwin"

# Delete Kind cluster if exists
kind delete cluster --name kind

# Clean up containers and volumes
docker container prune -f
docker volume prune -f

# Clean up workspace directories
sudo rm -rf kind/shared-storage
```

### Cleanup Summary

| Stage | Cleans Up | Deletes Cluster | Prunes All Darwin |
|-------|-----------|-----------------|-------------------|
| Infrastructure CI | `ci-test-service` only | No | No |
| Service CI | Own service image only | No | No |
| Final Cleanup | ALL Darwin images | Yes | Yes |

### Never Remove

- Base images without the `maintainer=darwin` label
- Images pulled from Docker Hub (datastores, operators)
- The Kind registry container (until final cleanup)

---

## Adding New Service CIs

When adding CI for a new service, follow these steps:

### 1. Create the Workflow File

Create `.github/workflows/<service-name>-ci.yml` as a **reusable workflow** using `workflow_call`:

```yaml
name: <Service Name> - CI

on:
  workflow_call:  # Called by infrastructure-ci.yml
  workflow_dispatch:  # Manual trigger

jobs:
  lint:
    # ... your lint job ...
  
  unit-tests:
    # ... your unit tests job ...
  
  deploy-and-healthcheck:
    needs: [lint, unit-tests]
    # ... your deploy job ...
  
  integration-tests:
    needs: [deploy-and-healthcheck]
    # ... your integration tests job ...
  
  cleanup:
    if: always()
    needs: [integration-tests]
    # ... your cleanup job ...
```

**Note:** No trigger logic needed! Infrastructure CI handles all gating.

### 2. Add Service to Infrastructure CI

Add your service to `infrastructure-ci.yml` in TWO places:

**a) Add to paths filter (triggers Infrastructure CI):**

```yaml
# In .github/workflows/infrastructure-ci.yml
on:
  pull_request:
    paths:
      # ... existing paths ...
      - "<service-directory>/**"
      - ".github/workflows/<service-name>-ci.yml"
```

**b) Add to detect-changes job:**

```yaml
  detect-changes:
    steps:
      - uses: dorny/paths-filter@v3
        with:
          filters: |
            # ... existing filters ...
            <service_name>:
              - <service-directory>/**
              - .github/workflows/<service-name>-ci.yml
```

**c) Add workflow_call job:**

```yaml
  <service-name>-ci:
    name: <Service Name> CI
    needs: [detect-changes, cluster-test]
    if: needs.detect-changes.outputs.<service_name> == 'true'
    uses: ./.github/workflows/<service-name>-ci.yml
    secrets: inherit
```

### 2. Add Docker Labels

Ensure the service's build includes BOTH labels:

```bash
--label "maintainer=darwin"
--label "darwin.service=<service-name>"
```

### 3. Use Service-Specific Cleanup

Add the cleanup step with your service name:

```yaml
- name: Cleanup
  if: always()
  uses: ./.github/actions/cleanup
  with:
    service_name: "<service-name>"
    delete_cluster: "false"
    delete_deployment: "true"
    prune_darwin_images: "true"
```

### 4. Add Healthcheck Endpoint

Ensure the service has a `/healthcheck` endpoint that returns:

```json
{"status": "SUCCESS", "message": "OK"}
```

### 5. Add Ingress Path

Add the service to the ingress configuration in `helm/darwin/charts/services/values.yaml`:

```yaml
paths:
  - path: "/<service-name>(/|$)(.*)"
    service: "<service-name>"
    port: 8000
```

### 6. Add to Final Cleanup Dependencies

Update `infrastructure-ci.yml` to include your service in the `final-cleanup` needs array:

```yaml
  final-cleanup:
    needs:
      - cluster-test
      - ml-serve-ci
      - artifact-builder-ci
      - <your-service>-ci  # ADD THIS
    if: always()
    uses: ./.github/workflows/final-cleanup.yml
```

> **Why is this required?** GitHub Actions has no "wait for all jobs" option. The `needs` array is the only way to ensure `final-cleanup` waits for your service CI before running. This is a one-time addition per service.

---

## Troubleshooting

### Docker Hub Rate Limit Errors

**Symptom:** `You have reached your unauthenticated pull rate limit`

**Solution:**
1. Ensure each CI only cleans its own service images
2. Verify final cleanup is using `--filter "label=maintainer=darwin"`
3. Check that base images aren't being pruned
4. Consider authenticating with Docker Hub

### Race Condition in Parallel CIs

**Symptom:** One CI fails because another deleted shared resources

**Solution:**
1. Ensure each service CI uses `service_name` in cleanup action
2. Set `delete_cluster: "false"` in service CIs
3. Only `final-cleanup.yml` should prune all images and delete cluster

### Kind Cluster Not Starting

**Symptom:** `kubectl get nodes` fails

**Solution:**
1. Check Docker is running: `docker ps`
2. Check for leftover clusters: `kind get clusters`
3. Delete and recreate: `kind delete cluster --name kind`

### Healthcheck Timeout

**Symptom:** CI fails waiting for healthcheck endpoint

**Solution:**
1. Check pod status: `kubectl get pods -n darwin`
2. Check pod logs: `kubectl logs -n darwin <pod-name>`
3. Verify ingress is running: `kubectl get pods -n ingress-nginx`

### Permission Denied on Cleanup

**Symptom:** `EACCES: permission denied, rmdir 'kind/shared-storage/...'`

**Solution:**
1. Add to cleanup step:
   ```bash
   sudo chmod -R u+w "$WORKSPACE_DIR/kind" 2>/dev/null || true
   sudo rm -rf "$WORKSPACE_DIR/kind/shared-storage" 2>/dev/null || true
   ```

---

## Self-Hosted Runner Requirements

The Darwin self-hosted runner must have:

- Docker installed and running
- `kind` CLI available
- `kubectl` CLI available
- `helm` CLI available
- `yq` CLI available
- Python 3.9+ (for Python services)
- Sufficient disk space (recommend 50GB+)
- Network access to Docker Hub (for base images)

---

*Last updated: January 2026*
