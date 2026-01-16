# CI Test Service

A minimal FastAPI service used for infrastructure CI validation.

## Purpose

This service is deployed during the infrastructure CI pipeline to verify that:
1. Kind cluster creation works
2. Docker image building works
3. Kubernetes deployments work
4. Service health checks work

## Files

- `main.py` - Minimal FastAPI application with `/healthcheck` endpoint
- `Dockerfile` - Container definition
- `deployment.yaml` - Kubernetes manifests (Deployment + Service)

## Local Testing

```bash
# Build the image
docker build -t ci-test-service:latest .

# Run locally
docker run -p 8000:8000 ci-test-service:latest

# Test healthcheck
curl http://localhost:8000/healthcheck
# Expected: {"status": "ok"}
```

## Deployment in CI

The infrastructure CI workflow:
1. Builds this image with `--label "maintainer=darwin"`
2. Pushes to the Kind local registry (`localhost:5000`)
3. Applies `deployment.yaml` to create the service
4. Verifies the healthcheck endpoint responds

## Cleanup

After CI validation, the service is removed:
```bash
kubectl delete namespace ci-test
```

The image is cleaned up with:
```bash
docker image prune -af --filter "label=maintainer=darwin"
```
