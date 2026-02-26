output "argocd_namespace" {
  description = "Namespace where ArgoCD is deployed"
  value       = helm_release.argocd.namespace
}

output "nginx_ingress_namespace" {
  description = "Namespace where Nginx Ingress is deployed"
  value       = helm_release.nginx_ingress.namespace
}

output "kuberay_namespace" {
  description = "Namespace where KubeRay Operator is deployed"
  value       = helm_release.kuberay.namespace
}

output "monitoring_namespace" {
  description = "Namespace where Prometheus/Grafana are deployed"
  value       = helm_release.prometheus.namespace
}

output "darwin_namespace" {
  description = "Namespace where Darwin platform is deployed"
  value       = helm_release.darwin.namespace
}
