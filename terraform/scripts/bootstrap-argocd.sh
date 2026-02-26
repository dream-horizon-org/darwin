#!/usr/bin/env bash
# =============================================================================
# Bootstrap ArgoCD – get initial admin password and print login instructions
# Usage: ./bootstrap-argocd.sh
# =============================================================================
set -euo pipefail

echo "Waiting for ArgoCD server pod to be ready ..."
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=argocd-server \
  -n argocd \
  --timeout=300s

ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d)

echo ""
echo "=== ArgoCD Initial Credentials ==="
echo "Username: admin"
echo "Password: $ARGOCD_PASSWORD"
echo ""
echo "Port-forward to access the UI:"
echo "  kubectl port-forward svc/argocd-server -n argocd 8443:443"
echo "  Open: https://localhost:8443"
echo ""
echo "CLI login:"
echo "  argocd login localhost:8443 --username admin --password '$ARGOCD_PASSWORD' --insecure"
