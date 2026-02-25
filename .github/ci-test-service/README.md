# CI Test Service

A minimal FastAPI service used for infrastructure CI validation. This service is integrated into the Darwin deployment pipeline to validate that `init.sh`, `setup.sh`, and `start.sh` work correctly.

## Purpose

This service is deployed during the infrastructure CI pipeline to verify that:
1. Kind cluster creation works
2. Darwin build pipeline (`setup.sh` with `--config`) works
3. Docker image building via `image-builder.sh` works
4. Helm chart deployments work
5. Service health checks work

## Files

- `main.py` - Minimal FastAPI application with `/healthcheck` endpoint
- `Dockerfile` - Container definition (used by `deployer/images/Dockerfile`)
- `test-services.yaml` - Custom services configuration for CI testing
- `test-enabled-services.yaml` - Pre-configured enabled services for CI
- `.odin/ci-test-service/` - Build scripts following Darwin pattern:
  - `build.sh` - Copies source files to `target/ci-test-service/`
  - `setup.sh` - Installs Python dependencies during image build
  - `start.sh` - Entrypoint script to start the FastAPI service

## Local Testing

```bash
# Method 1: Using Darwin pipeline (recommended)
# This tests the full flow
cp .github/ci-test-service/test-enabled-services.yaml .setup/enabled-services.yaml
./setup.sh -y -d --config .github/ci-test-service/test-services.yaml

# Method 2: Direct docker build (quick test)
docker build -t ci-test-service:latest .github/ci-test-service/

# Run locally
docker run -p 8000:8000 ci-test-service:latest

# Test healthcheck
curl http://localhost:8000/healthcheck
# Expected: {"status": "SUCCESS", "message": "OK"}
```

## Deployment in CI

The infrastructure CI workflow (`infrastructure-ci.yml`):

1. **Setup Configuration**
   - Copies `test-enabled-services.yaml` to `.setup/enabled-services.yaml`

2. **Build via Darwin Pipeline**
   - Runs `./setup.sh -y -d --config .github/ci-test-service/test-services.yaml`
   - This uses `image-builder.sh` to build and push the image

3. **Assert Image Built**
   - Verifies `ci-test-service:latest` exists in Kind registry

4. **Deploy via Helm**
   - Uses `helm upgrade --install` with overrides to enable only ci-test-service
   - All other services are disabled via `--set services.services.<name>.enabled=false`

5. **Assert Pod Running**
   - Verifies pod with label `app.kubernetes.io/component=ci-test-service` is Running

6. **Assert Environment Variables**
   - Verifies env vars from `helm/darwin/charts/services/values.yaml` are set

7. **Verify Healthcheck**
   - Tests `/healthcheck` endpoint returns `{"status": "SUCCESS"}`

## Helm Chart Integration

The ci-test-service is defined in `helm/darwin/charts/services/values.yaml`:

```yaml
services:
  ci-test-service:
    enabled: false  # DISABLED BY DEFAULT - only enabled via CI overrides
    serviceName: darwin-ci-test-service
    image:
      registry: localhost:5000
      name: ci-test-service
      tag: latest
```

## Cleanup

After CI validation, cleanup is performed:

```bash
# Via Helm (proper Darwin way)
helm uninstall darwin -n darwin

# Image cleanup (in final-cleanup.yml)
docker image prune -af --filter "label=maintainer=darwin"
```

## Why This Design?

Previously, infrastructure CI used direct `docker build` and `kubectl apply`, which **bypassed** the Darwin deployment pipeline. This meant changes to `init.sh`, `setup.sh`, `start.sh`, or the Helm charts would not be validated.

The new design:
- Tests the actual build pipeline (`setup.sh` + `image-builder.sh`)
- Tests the actual deployment pipeline (Helm charts)
- Catches breaking changes in infrastructure scripts
- Uses the `darwin` namespace like production deployments
