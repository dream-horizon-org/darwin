variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "domain" {
  description = "Base domain for ingress hosts (e.g. darwin.example.com)"
  type        = string
  default     = ""
}

# --- Chart versions ---
variable "argocd_version" {
  description = "ArgoCD Helm chart version"
  type        = string
  default     = "5.51.0"
}

variable "alb_controller_version" {
  description = "AWS Load Balancer Controller chart version"
  type        = string
  default     = "1.6.2"
}

variable "nginx_version" {
  description = "Nginx Ingress Controller chart version"
  type        = string
  default     = "4.9.0"
}

variable "kuberay_version" {
  description = "KubeRay Operator chart version"
  type        = string
  default     = "1.1.0"
}

variable "prometheus_version" {
  description = "Kube-Prometheus-Stack chart version"
  type        = string
  default     = "55.5.0"
}

variable "cert_manager_version" {
  description = "Cert-Manager chart version"
  type        = string
  default     = "1.13.3"
}

# --- IAM role ARNs (IRSA) ---
variable "alb_controller_role_arn" {
  description = "IAM role ARN for ALB controller service account"
  type        = string
  default     = ""
}

variable "dcm_role_arn" {
  description = "IAM role ARN for DCM service account (IRSA)"
  type        = string
}

variable "mlflow_role_arn" {
  description = "IAM role ARN for MLflow service account (IRSA)"
  type        = string
}

# --- Darwin chart values ---
variable "darwin_chart_path" {
  description = "Path to the Darwin umbrella Helm chart (local or OCI)"
  type        = string
  default     = "../../../helm/darwin"
}

variable "ecr_registry" {
  description = "ECR registry URL for Darwin images"
  type        = string
}

variable "rds_endpoint" {
  description = "RDS MySQL endpoint (host only, no port)"
  type        = string
}

variable "rds_username" {
  description = "RDS MySQL username"
  type        = string
  default     = "darwin"
}

variable "efs_id" {
  description = "EFS file system ID for workspace PV"
  type        = string
}

variable "workspace_access_point_id" {
  description = "EFS access point ID for workspace"
  type        = string
}
