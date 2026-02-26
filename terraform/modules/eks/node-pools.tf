# =============================================================================
# Default Node Pool – operators and platform services
# =============================================================================

resource "aws_eks_node_group" "default" {
  cluster_name    = aws_eks_cluster.darwin.name
  node_group_name = "default"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids

  instance_types = var.default_instance_types
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = var.default_desired_size
    min_size     = var.default_min_size
    max_size     = var.default_max_size
  }

  labels = {
    "darwin.io/nodepool" = "default"
    "darwin.io/workload" = "platform"
  }

  tags = {
    Name = "${var.cluster_name}-default"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_read_only,
  ]
}

# =============================================================================
# Ray Node Pool – Ray clusters (training / compute)
# =============================================================================

resource "aws_eks_node_group" "ray" {
  cluster_name    = aws_eks_cluster.darwin.name
  node_group_name = "ray"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids

  instance_types = var.ray_instance_types
  capacity_type  = var.ray_capacity_type

  scaling_config {
    desired_size = 0
    min_size     = 0
    max_size     = var.ray_max_size
  }

  labels = {
    "darwin.io/nodepool"          = "ray"
    "darwin.io/workload"          = "compute"
    "darwin.dream11.com/resource" = "ray-cluster"
  }

  taint {
    key    = "darwin.io/workload"
    value  = "compute"
    effect = "NO_SCHEDULE"
  }

  tags = {
    Name                                                    = "${var.cluster_name}-ray"
    "k8s.io/cluster-autoscaler/enabled"                     = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}"         = "owned"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_read_only,
  ]
}

# =============================================================================
# Serve Node Pool – model inference, Jupyter, Spark History Server
# =============================================================================

resource "aws_eks_node_group" "serve" {
  cluster_name    = aws_eks_cluster.darwin.name
  node_group_name = "serve"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.private_subnet_ids

  instance_types = var.serve_instance_types
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 0
    min_size     = 0
    max_size     = var.serve_max_size
  }

  labels = {
    "darwin.io/nodepool" = "serve"
    "darwin.io/workload" = "inference"
  }

  taint {
    key    = "darwin.io/workload"
    value  = "inference"
    effect = "NO_SCHEDULE"
  }

  tags = {
    Name                                                    = "${var.cluster_name}-serve"
    "k8s.io/cluster-autoscaler/enabled"                     = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}"         = "owned"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_read_only,
  ]
}
