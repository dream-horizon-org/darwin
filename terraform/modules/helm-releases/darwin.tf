# =============================================================================
# EFS PersistentVolume + PVC for Workspace
# =============================================================================

resource "kubernetes_persistent_volume" "efs_workspace" {
  metadata {
    name = "darwin-workspace-efs-pv"
  }

  spec {
    capacity = {
      storage = "100Gi"
    }
    access_modes                     = ["ReadWriteMany"]
    persistent_volume_reclaim_policy = "Retain"
    storage_class_name               = "efs-sc"

    persistent_volume_source {
      csi {
        driver        = "efs.csi.aws.com"
        volume_handle = "${var.efs_id}::${var.workspace_access_point_id}"
      }
    }
  }
}

resource "kubernetes_persistent_volume_claim" "efs_workspace" {
  metadata {
    name      = "darwin-workspace-efs-pvc"
    namespace = "darwin"
  }

  spec {
    access_modes       = ["ReadWriteMany"]
    storage_class_name = "efs-sc"

    resources {
      requests = {
        storage = "100Gi"
      }
    }

    volume_name = kubernetes_persistent_volume.efs_workspace.metadata[0].name
  }
}

# =============================================================================
# Darwin Platform Helm Release
# =============================================================================

resource "helm_release" "darwin" {
  name             = "darwin"
  chart            = var.darwin_chart_path
  namespace        = "darwin"
  create_namespace = true

  values = [
    <<-VALUES
    global:
      imageRegistry: ${var.ecr_registry}
      namespace: darwin
      local-k8s: false

      database:
        mysql:
          host: ${var.rds_endpoint}
          port: 3306
          username: ${var.rds_username}

    # Disable in-cluster datastores (use AWS managed services)
    datastores:
      enabled: false
      mysql:
        enabled: false
      cassandra:
        enabled: false
      kafka:
        enabled: false
      zookeeper:
        enabled: false
      localstack:
        enabled: false
      opensearch:
        enabled: false

    services:
      enabled: true

      darwin-compute:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default

      darwin-cluster-manager:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: ${var.dcm_role_arn}

      darwin-mlflow:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: ${var.mlflow_role_arn}

      darwin-mlflow-app:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default

      ml-serve-app:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default

      artifact-builder:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default

      darwin-workspace:
        enabled: true
        nodeSelector:
          darwin.io/nodepool: default

      # Disabled for Phase 1
      darwin-catalog:
        enabled: false
      chronos:
        enabled: false
      chronos-consumer:
        enabled: false
      darwin-workflow:
        enabled: false
      darwin-ofs-v2:
        enabled: false
      darwin-ofs-v2-admin:
        enabled: false
      darwin-ofs-v2-consumer:
        enabled: false
    VALUES
  ]

  depends_on = [
    helm_release.kuberay,
    helm_release.nginx_ingress,
    helm_release.cert_manager,
    kubernetes_persistent_volume_claim.efs_workspace,
  ]
}
