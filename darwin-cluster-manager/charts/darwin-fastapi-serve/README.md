# Darwin FastAPI Serve (Helm Chart)

This chart is used by Darwin Cluster Manager to deploy **FastAPI-based API serves**.

It supports:

- Standard Kubernetes **RollingUpdate**
- Progressive delivery via **Flagger** for:
  - **Canary** (traffic shifting)
  - **Blue/Green** (traffic switching)

## Prerequisites (for CANARY / BLUE_GREEN)

Flagger requires a layer-7 traffic router. For this repo we standardize on:

- **ingress-nginx**
- **Flagger** with `meshProvider=nginx`

### Install ingress-nginx

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
kubectl create ns ingress-nginx
helm upgrade -i ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.metrics.enabled=true \
  --set controller.podAnnotations."prometheus\\.io/scrape"=true \
  --set controller.podAnnotations."prometheus\\.io/port"=10254
```

### Install Flagger (NGINX provider)

```bash
helm repo add flagger https://flagger.app
helm upgrade -i flagger flagger/flagger \
  --namespace ingress-nginx \
  --set prometheus.install=true \
  --set meshProvider=nginx
```

## Enabling strategies (via values)

### Rolling (default)

Set nothing; the chart deploys a standard Kubernetes `Deployment` with `RollingUpdate`.

Optional knobs:

- `rollingUpdate.maxSurge`
- `rollingUpdate.maxUnavailable`
- `progressDeadlineSeconds`

### Canary (Flagger)

```yaml
flagger:
  enabled: true
  provider: nginx
  type: canary
  interval: 1m
  threshold: 2
  maxWeight: 60
  stepWeight: 20
  metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
      interval: 1m
```

### Blue/Green (Flagger)

```yaml
flagger:
  enabled: true
  provider: nginx
  type: bluegreen
  interval: 1m
  threshold: 2
  iterations: 10
  metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
      interval: 1m
```
