import os

DISK_TYPE = ["gp2"]
INSTANCE_ROLE = [
    {"instance_role_id": "1", "display_name": "darwin-ds-role", "service_account_name": "darwin-ds-role"},
    {
        "instance_role_id": "2",
        "display_name": "prod-finance-server-role",
        "service_account_name": "prod-finance-server-role",
    },
    {
        "instance_role_id": "3",
        "display_name": "emr-ec2-default-role",
        "service_account_name": "emr-ec2-default-role",
    },
    {
        "instance_role_id": "4",
        "display_name": "d11-prod-dspm-darwin-role",
        "service_account_name": "d11-prod-dspm-darwin-role",
    },
]

CPU_NODE_LIMITS= {"cores": {"min": 1, "max": 90}, "memory": {"min": 1, "max": 736} }

AZS = [{"az_id": "az_id", "display_name": "az_name"}]

NODE_CAPACITY_TYPE = ["ondemand", "spot"]

NODE_TYPE = ["general", "compute", "memory", "gpu", "disk"]
NODE_LABELS = {
    "general": "General Purpose",
    "compute": "Compute Intensive",
    "memory": "Memory Intensive",
    "disk": "Disk Intensive",
    "gpu": "GPU Accelerator",
}
K8S_LABEL_CHECK = r"^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$"
USER_CHECK = r"^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9](@[A-Za-z0-9.-]+\.[A-Za-z]{2,})?$"

REQUIRED_LABELS = ["project", "service", "squad", "environment"]
LABELS_SIZE_LIMIT = 25

DEFAULT_LABELS = {
    "project": "darwin",
    "service": "darwin",
    "squad": "data-science",
    "environment": os.getenv("ENV", "stag"),
}
