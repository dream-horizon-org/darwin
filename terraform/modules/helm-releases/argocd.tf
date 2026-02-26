# -----------------------------------------------------------------------------
# ArgoCD
# -----------------------------------------------------------------------------

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd_version
  namespace        = "argocd"
  create_namespace = true

  values = [
    <<-VALUES
    server:
      ingress:
        enabled: ${var.domain != "" ? "true" : "false"}
        ingressClassName: nginx
        hosts:
          - argocd.${var.domain}
      nodeSelector:
        darwin.io/nodepool: default

    controller:
      nodeSelector:
        darwin.io/nodepool: default

    repoServer:
      nodeSelector:
        darwin.io/nodepool: default

    redis:
      nodeSelector:
        darwin.io/nodepool: default
    VALUES
  ]

  depends_on = [
    helm_release.nginx_ingress,
  ]
}
