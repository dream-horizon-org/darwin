# -----------------------------------------------------------------------------
# EFS File System
# -----------------------------------------------------------------------------

resource "aws_efs_file_system" "darwin" {
  creation_token = "${var.project_name}-${var.environment}-efs"
  encrypted      = true

  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-efs"
  }
}

# -----------------------------------------------------------------------------
# Mount Targets – one per private subnet / AZ
# -----------------------------------------------------------------------------

resource "aws_efs_mount_target" "darwin" {
  count = length(var.private_subnet_ids)

  file_system_id  = aws_efs_file_system.darwin.id
  subnet_id       = var.private_subnet_ids[count.index]
  security_groups = [var.efs_security_group_id]
}

# -----------------------------------------------------------------------------
# Access Point for Workspace service
# -----------------------------------------------------------------------------

resource "aws_efs_access_point" "workspace" {
  file_system_id = aws_efs_file_system.darwin.id

  posix_user {
    gid = 1000
    uid = 1000
  }

  root_directory {
    path = "/workspace"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "755"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-workspace-ap"
  }
}
