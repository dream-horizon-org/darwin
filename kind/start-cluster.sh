#!/bin/sh
set -e

CLUSTER_NAME=$CLUSTER_NAME
KIND_CONFIG=$KIND_CONFIG
KUBECONFIG=$KUBECONFIG

# #region agent log - debug kind detection
echo "DEBUG: Checking for kind binary..."
echo "DEBUG: Current PATH: $PATH"
echo "DEBUG: Which kind: $(which kind 2>&1 || echo 'not found via which')"
echo "DEBUG: Command -v kind: $(command -v kind 2>&1 || echo 'not found via command')"
echo "DEBUG: /usr/local/bin/kind exists: $(test -f /usr/local/bin/kind && echo 'yes' || echo 'no')"
if [ -f /usr/local/bin/kind ]; then
    echo "DEBUG: /usr/local/bin/kind is executable: $(test -x /usr/local/bin/kind && echo 'yes' || echo 'no')"
fi
# #endregion

if ! command -v kind >/dev/null 2>&1; then
    echo "kind could not be found, installing it"
    if command -v brew >/dev/null 2>&1; then
        brew install kind
    else
        # Install kind binary directly on Linux
        curl -Lo /tmp/kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
        chmod +x /tmp/kind
        sudo mv /tmp/kind /usr/local/bin/kind
    fi
fi

export KUBECONFIG=$KUBECONFIG

# Check if cluster exists
if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  echo "✅ kind cluster '${CLUSTER_NAME}' already exists"
else
  echo "🚀 Creating kind cluster '${CLUSTER_NAME}'..."
  
  if ! kind create cluster \
    --name "${CLUSTER_NAME}" \
    --config "${KIND_CONFIG}" \
    --kubeconfig "${KUBECONFIG}"; then
    echo "❌ Failed to create kind cluster"
    exit 1
  fi

  # Wait for cluster to be ready before installing components
  echo "⏳ Waiting for cluster to be ready..."
  export KUBECONFIG="${KUBECONFIG}"
  max_attempts=30
  attempt=0
  while [ $attempt -lt $max_attempts ]; do
    if kubectl get nodes >/dev/null 2>&1; then
      echo "✅ Cluster is ready"
      break
    fi
    echo "   Attempt $((attempt+1))/$max_attempts: Waiting for cluster API..."
    sleep 2
    attempt=$((attempt+1))
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Cluster did not become ready in time"
    exit 1
  fi

  # Install cert-manager with CRDs
  echo "📦 Installing cert-manager..."
  # Check if cert-manager is already installed
  if helm list -n cert-manager 2>/dev/null | grep -q cert-manager; then
    echo "✅ cert-manager is already installed"
  else
    echo "   Adding jetstack helm repo..."
    if ! helm repo add jetstack https://charts.jetstack.io; then
      echo "❌ Failed to add jetstack helm repo"
      exit 1
    fi
    
    echo "   Updating helm repos..."
    if ! helm repo update; then
      echo "❌ Failed to update helm repos"
      exit 1
    fi
    
    echo "   Installing cert-manager..."
    if ! helm install cert-manager jetstack/cert-manager \
      --namespace cert-manager \
      --create-namespace \
      --set crds.enabled=true \
      --wait \
      --timeout 5m; then
      echo "❌ Failed to install cert-manager"
      exit 1
    fi
    
    echo "✅ cert-manager installed successfully"
  fi

  # Install ingress-nginx for routing
  echo "📦 Installing ingress-nginx..."
  # Check if ingress-nginx is already installed
  if kubectl get namespace ingress-nginx >/dev/null 2>&1; then
    echo "✅ ingress-nginx is already installed"
  else
    echo "   Applying ingress-nginx manifests..."
    if ! kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/kind/deploy.yaml; then
      echo "❌ Failed to apply ingress-nginx manifests"
      exit 1
    fi
    
    echo "   Labeling node for ingress..."
    if ! kubectl label node kind-control-plane ingress-ready=true --overwrite; then
      echo "❌ Failed to label node for ingress"
      exit 1
    fi
    
    echo "⏳ Waiting for ingress-nginx to be ready..."
    if ! kubectl wait --namespace ingress-nginx \
      --for=condition=ready pod \
      --selector=app.kubernetes.io/component=controller \
      --timeout=300s; then
      echo "⚠️  ingress-nginx pods may not be ready yet, but continuing..."
    else
      echo "✅ ingress-nginx installed successfully"
    fi
  fi
fi

chmod 600 $KUBECONFIG 2>/dev/null || true

# Start kind-registry
echo "🚀 Starting kind-registry..."
# Get the project root directory (where config.env should be written)
# This script is in kind/, so go up one level to get project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_ENV="$PROJECT_ROOT/config.env"

if docker ps | grep -q "kind-registry"; then
  echo "✅ kind-registry is already running"
  REGISTRY_PORT=$(docker port kind-registry 5000/tcp | cut -d: -f2)
  echo "DOCKER_REGISTRY=127.0.0.1:$REGISTRY_PORT" >> "$CONFIG_ENV"
elif docker ps -a | grep -q "kind-registry"; then
  echo "   Found existing kind-registry container, starting it..."
  if ! docker start kind-registry; then
    echo "   Failed to start existing container, removing and recreating..."
    docker rm -f kind-registry || true
    if ! docker run -d --restart=always -p 0:5000 --network $CLUSTER_NAME --name kind-registry registry:2; then
      echo "❌ Failed to start kind-registry"
      exit 1
    fi
  fi
  REGISTRY_PORT=$(docker port kind-registry 5000/tcp | cut -d: -f2)
  echo "DOCKER_REGISTRY=127.0.0.1:$REGISTRY_PORT" >> "$CONFIG_ENV"
else
  echo "   Creating new kind-registry container..."
  if ! docker run -d --restart=always -p 0:5000 --network $CLUSTER_NAME --name kind-registry registry:2; then
    echo "❌ Failed to create kind-registry container"
    exit 1
  fi
  REGISTRY_PORT=$(docker port kind-registry 5000/tcp | cut -d: -f2)
  echo "DOCKER_REGISTRY=127.0.0.1:$REGISTRY_PORT" >> "$CONFIG_ENV"
fi
echo "✅ kind-registry is running on port $REGISTRY_PORT"