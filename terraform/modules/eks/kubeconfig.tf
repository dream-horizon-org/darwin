# -----------------------------------------------------------------------------
# Generate kubeconfig and upload to S3 for DCM
# DCM expects path: mlp/cluster_manager/configs/<cluster_name>
# -----------------------------------------------------------------------------

locals {
  kubeconfig = <<-KUBECONFIG
    apiVersion: v1
    kind: Config
    clusters:
    - cluster:
        server: ${aws_eks_cluster.darwin.endpoint}
        certificate-authority-data: ${aws_eks_cluster.darwin.certificate_authority[0].data}
      name: ${aws_eks_cluster.darwin.name}
    contexts:
    - context:
        cluster: ${aws_eks_cluster.darwin.name}
        user: ${aws_eks_cluster.darwin.name}
      name: ${aws_eks_cluster.darwin.name}
    current-context: ${aws_eks_cluster.darwin.name}
    users:
    - name: ${aws_eks_cluster.darwin.name}
      user:
        exec:
          apiVersion: client.authentication.k8s.io/v1beta1
          command: aws
          args:
            - eks
            - get-token
            - --cluster-name
            - ${aws_eks_cluster.darwin.name}
            - --region
            - ${var.region}
  KUBECONFIG
}

resource "aws_s3_object" "kubeconfig" {
  bucket  = var.config_bucket_name
  key     = "mlp/cluster_manager/configs/${var.cluster_name}"
  content = local.kubeconfig

  server_side_encryption = "aws:kms"
}
