# =============================================================================
# 1. AWS Load Balancer Controller
# =============================================================================

resource "helm_release" "aws_lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = var.alb_controller_version
  namespace  = "kube-system"

  values = [
    <<-VALUES
    clusterName: ${var.cluster_name}
    serviceAccount:
      create: true
      name: aws-load-balancer-controller
      annotations:
        eks.amazonaws.com/role-arn: ${var.alb_controller_role_arn}
    VALUES
  ]
}

# =============================================================================
# 2. Nginx Ingress Controller
# =============================================================================

resource "helm_release" "nginx_ingress" {
  name             = "nginx-ingress"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  version          = var.nginx_version
  namespace        = "ingress-nginx"
  create_namespace = true

  values = [
    <<-VALUES
    controller:
      service:
        type: LoadBalancer
        annotations:
          service.beta.kubernetes.io/aws-load-balancer-type: "external"
          service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "ip"
          service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"

      nodeSelector:
        darwin.io/nodepool: default
    VALUES
  ]
}

# =============================================================================
# 3. KubeRay Operator
# =============================================================================

resource "helm_release" "kuberay" {
  name             = "kuberay-operator"
  repository       = "https://ray-project.github.io/kuberay-helm"
  chart            = "kuberay-operator"
  version          = var.kuberay_version
  namespace        = "ray-system"
  create_namespace = true

  values = [
    <<-VALUES
    nodeSelector:
      darwin.io/nodepool: default
    VALUES
  ]
}

# =============================================================================
# 4. Kube Prometheus Stack (Prometheus + Grafana)
# =============================================================================

resource "helm_release" "prometheus" {
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  version          = var.prometheus_version
  namespace        = "monitoring"
  create_namespace = true

  values = [
    <<-VALUES
    prometheus:
      prometheusSpec:
        nodeSelector:
          darwin.io/nodepool: default
        storageSpec:
          volumeClaimTemplate:
            spec:
              storageClassName: gp3
              resources:
                requests:
                  storage: 50Gi

    grafana:
      nodeSelector:
        darwin.io/nodepool: default
      persistence:
        enabled: true
        storageClassName: gp3
        size: 10Gi
      ingress:
        enabled: ${var.domain != "" ? "true" : "false"}
        ingressClassName: nginx
        hosts:
          - grafana.${var.domain}

    alertmanager:
      alertmanagerSpec:
        nodeSelector:
          darwin.io/nodepool: default
    VALUES
  ]
}

# =============================================================================
# 5. Cert Manager
# =============================================================================

resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  version          = var.cert_manager_version
  namespace        = "cert-manager"
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  values = [
    <<-VALUES
    nodeSelector:
      darwin.io/nodepool: default

    webhook:
      nodeSelector:
        darwin.io/nodepool: default

    cainjector:
      nodeSelector:
        darwin.io/nodepool: default
    VALUES
  ]
}
