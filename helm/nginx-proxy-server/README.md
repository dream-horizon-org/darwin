# Nginx Proxy Server Chart

A sophisticated Helm chart for deploying a high-performance nginx proxy server that provides dynamic routing to multiple Ray clusters using regex-based URL patterns.

## Overview

This chart creates a centralized nginx proxy that routes traffic to Ray clusters without requiring service discovery or manual configuration updates. It uses intelligent nginx regex patterns to dynamically route traffic based on URL structure.

## Features

- **🚀 Zero-Configuration Routing**: Automatically routes to Ray clusters based on URL patterns
- **⚡ High Performance**: Pure nginx regex routing with no sidecar containers
- **📊 Auto-Scaling**: Horizontal Pod Autoscaler with configurable metrics
- **🔒 Security**: Network policies, security contexts, and service accounts
- **🌐 Multi-Ingress**: Support for both internal and external ALB ingresses
- **🎯 Production Ready**: Health checks, resource limits, and monitoring

## Architecture

```
ALB (Load Balancer) 
    ↓
Nginx Proxy Server (3-10 replicas)
    ↓
Dynamic Regex Routing
    ↓
Ray Clusters (Any namespace, any name)
```

## URL Routing Pattern

The proxy uses a simple URL pattern that works with any Ray cluster:

```
/{kube_cluster_key}/{cluster_name}-{service}[/path]
```

### Examples

| URL                              | Target Service     |
|----------------------------------|--------------------|
| `/eks-2/test-jupyter`            | test Jupyter Lab   |
| `/eks-2/test-dashboard/`         | test Ray Dashboard |
| `/eks-2/test-metrics/dashboards` | test Grafana       |
| `/eks-2/test-sparkui/jobs`       | test Spark UI      |

### Supported Services

| Service | Port | Ray Service |
|---------|------|-------------|
| `jupyter` | 8888 | Jupyter Lab |
| `dashboard` | 8265 | Ray Dashboard |
| `sparkui` | 4040 | Spark UI |
| `vscode` | 3000 | VS Code Server |
| `metrics` | 3000 | Grafana (special routing) |
| `livy` | 8998 | Livy Server |
| `thrift` | 10000 | Thrift Server |
| `custom-1` | 8001 | Custom Service 1 |
| `custom-2` | 8002 | Custom Service 2 |
| `custom-3` | 8003 | Custom Service 3 |

## Installation

### Quick Start

```bash
# Install the nginx proxy server
helm install my-proxy ./charts/nginx-proxy-server

# Deploy Ray clusters (they will be automatically routed)
helm install cluster1 ./charts/ray-cluster --set cluster_name=cluster1
helm install cluster2 ./charts/ray-cluster --set cluster_name=cluster2
```

### Production Installation

```bash
helm install nginx-proxy ./charts/nginx-proxy-server \
  --set nginx.hpa.minReplicas=5 \
  --set nginx.hpa.maxReplicas=20 \
  --set nginx.resources.requests.cpu=500m \
  --set nginx.resources.requests.memory=512Mi \
  --set global.kube_cluster_key=eks-2
```

## Configuration

### Basic Configuration

```yaml
# values.yaml
nginx:
  enabled: true
  replicas: 3
  
  image:
    repository: nginx
    tag: "1.27.4"
    pullPolicy: IfNotPresent

  resources:
    requests:
      cpu: 200m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

global:
  kube_cluster_key: "eks-2"
  environment: "prod"
```

### Auto-Scaling Configuration

```yaml
nginx:
  hpa:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 75
    
    # Advanced HPA configuration
    behavior:
      scaleDown:
        stabilizationWindowSeconds: 300
        policies:
        - type: Percent
          value: 10
          periodSeconds: 60
      scaleUp:
        stabilizationWindowSeconds: 0
        policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
        selectPolicy: Max
```

### Service Configuration

```yaml
nginx:
  service:
    type: ClusterIP
    port: 80
    annotations:
      service.beta.kubernetes.io/aws-load-balancer-type: nlb
    
    # For LoadBalancer type
    # type: LoadBalancer
    # loadBalancerIP: "10.0.0.100"
    # loadBalancerSourceRanges:
    #   - "10.0.0.0/16"
```

### Ingress Configuration

```yaml
ingress:
  enabled: true
  internal:
    enabled: true
    annotations:
      alb.ingress.kubernetes.io/scheme: internal
      alb.ingress.kubernetes.io/target-type: ip
      alb.ingress.kubernetes.io/group.name: ray-clusters-internal
      alb.ingress.kubernetes.io/healthcheck-path: /
    ingressClassName: alb
    
    # Custom hosts configuration
    hosts:
      - host: ray-internal.company.com
        paths:
          - path: /
            pathType: Prefix

  external:
    enabled: true
    annotations:
      alb.ingress.kubernetes.io/scheme: internet-facing
      alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:region:account:certificate/cert-id
    hosts:
      - host: ray.company.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - hosts:
          - ray.company.com
        secretName: ray-tls
```

### Security Configuration

```yaml
nginx:
  securityContext:
    runAsNonRoot: true
    runAsUser: 101
    readOnlyRootFilesystem: true
    allowPrivilegeEscalation: false

networkPolicy:
  enabled: true
  egress:
    enabled: true
    to:
      - namespaceSelector:
          matchLabels:
            name: ray-clusters

serviceAccount:
  create: true
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::account:role/nginx-proxy-role
```

### Advanced Nginx Configuration

The nginx configuration supports advanced routing patterns through the `nginx-config.yaml` template. You can customize:

- **Dynamic upstream resolution** with Kubernetes DNS
- **Custom port mappings** for different services  
- **Path-based routing** with regex patterns
- **Header forwarding** for WebSocket support
- **Timeout configurations** for different services

## Monitoring and Observability

### Health Checks

The chart includes comprehensive health checks:

```yaml
nginx:
  livenessProbe:
    initialDelaySeconds: 30
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3

  readinessProbe:
    initialDelaySeconds: 5
    periodSeconds: 5
    timeoutSeconds: 3
    failureThreshold: 3
```

### Metrics and Monitoring

```yaml
# Add Prometheus annotations
nginx:
  podAnnotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9113"
    prometheus.io/path: "/metrics"

# Enable nginx-prometheus-exporter sidecar
nginx:
  extraContainers:
    - name: nginx-exporter
      image: nginx/nginx-prometheus-exporter:0.11.0
      args:
        - -nginx.scrape-uri=http://localhost/nginx_status
      ports:
        - containerPort: 9113
          name: metrics
```

## Ray Cluster Integration

### No Configuration Required

Ray clusters work automatically with the proxy:

```yaml
# ray-cluster values.yaml
cluster_name: my-awesome-cluster
kube_cluster_key: eks-2

# Disable individual nginx proxy
nginx:
  enabled: false
```

### Custom Service Patterns

For services with different naming patterns:

```nginx
# The nginx config supports these patterns:
# Standard: {cluster-name}-kuberay-head-svc
# Grafana: {cluster-name}-grafana (in prometheus namespace)
# Custom: Define your own patterns in nginx-config.yaml
```

## Production Examples

### High-Availability Setup

```yaml
# values-production.yaml
nginx:
  enabled: true
  replicas: 5
  
  hpa:
    enabled: true
    minReplicas: 5
    maxReplicas: 20
    targetCPUUtilizationPercentage: 60

  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi

  nodeSelector:
    node-type: compute
    
  tolerations:
    - key: "dedicated"
      operator: "Equal"
      value: "nginx"
      effect: "NoSchedule"

  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchExpressions:
              - key: app.kubernetes.io/name
                operator: In
                values:
                  - nginx-proxy-server
          topologyKey: kubernetes.io/hostname

global:
  kube_cluster_key: "prod-eks-2"
  environment: "production"

ingress:
  internal:
    enabled: true
    annotations:
      alb.ingress.kubernetes.io/ssl-redirect: "443"
      alb.ingress.kubernetes.io/healthcheck-interval-seconds: "30"
      alb.ingress.kubernetes.io/target-group-attributes: deregistration_delay.timeout_seconds=120
  
  external:
    enabled: true
    annotations:
      alb.ingress.kubernetes.io/ssl-redirect: "443"
      alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:123456789:certificate/abcd
```

### Multi-Cluster Setup

```yaml
# Different cluster keys for different environments
global:
  kube_cluster_key: "kind-0"  # Local Kind
  # kube_cluster_key: "eks-0"   # AWS
```

## Troubleshooting

### Check Nginx Status

```bash
# Check proxy pods
kubectl get pods -l app.kubernetes.io/name=nginx-proxy-server

# Check nginx configuration
kubectl exec -it <nginx-pod> -- nginx -t

# View current config
kubectl exec -it <nginx-pod> -- cat /etc/nginx/nginx.conf

# Check logs
kubectl logs -l app.kubernetes.io/name=nginx-proxy-server -f
```

### Test Routing

```bash
# Port forward to test locally
kubectl port-forward svc/nginx-proxy-server 8080:80

# Test routing
curl http://localhost:8080/eks-2/test-dashboard/
curl http://localhost:8080/eks-2/test-jupyter
```

### Common Issues

1. **502 Bad Gateway**: Check if target Ray cluster is running
2. **404 Not Found**: Verify cluster name and service path
3. **Connection Timeout**: Check network policies and DNS resolution

### Debug Ray Cluster Connectivity

```bash
# Check Ray cluster service
kubectl get svc -l app.kubernetes.io/component=ray-head

# Test direct connection
kubectl exec -it <nginx-pod> -- nslookup my-cluster-kuberay-head-svc

# Test port connectivity
kubectl exec -it <nginx-pod> -- nc -zv my-cluster-kuberay-head-svc.default.svc.cluster.local 8888
```

## Values Reference

| Parameter | Description | Default |
|-----------|-------------|---------|
| `nginx.enabled` | Enable nginx proxy | `true` |
| `nginx.replicas` | Number of nginx replicas | `3` |
| `nginx.image.repository` | Nginx image repository | `nginx` |
| `nginx.image.tag` | Nginx image tag | `"1.27.4"` |
| `nginx.resources.requests.cpu` | CPU request | `200m` |
| `nginx.resources.requests.memory` | Memory request | `256Mi` |
| `nginx.hpa.enabled` | Enable HPA | `true` |
| `nginx.hpa.minReplicas` | Minimum replicas | `3` |
| `nginx.hpa.maxReplicas` | Maximum replicas | `10` |
| `global.kube_cluster_key` | Cluster key for routing | `"eks-2"` |
| `ingress.enabled` | Enable ingress | `true` |
| `networkPolicy.enabled` | Enable network policy | `false` |
| `serviceAccount.create` | Create service account | `false` |

## Contributing

To extend the nginx proxy server:

1. **Add new service patterns** in `nginx-config.yaml`
2. **Update health checks** for new services
3. **Add monitoring** for new metrics
4. **Test routing** with different cluster patterns

## License

This chart is part of the Darwin cluster management system. 