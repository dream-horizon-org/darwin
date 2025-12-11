import os
from enum import Enum

CONFIGS_MAP = {
    "darwin-local": {
        "thanos_remote_write_url": "http://darwin-thanos:10902",
        "dcm_url": "http://darwin-cluster-manager:8080",
        "mysql_db": {
            "write_host": "darwin-mysql",
            "read_host": "darwin-mysql",
            "user": f'{os.getenv("VAULT_SERVICE_MYSQL_USERNAME")}',
            "password": f'{os.getenv("VAULT_SERVICE_MYSQL_PASSWORD")}',
            "database": f'{os.getenv("CONFIG_SERVICE_MYSQL_DATABASE")}',
            "pool_size": 1,
            "port": "3306",
        },
        "elasticsearch": {
            "host": "http://darwin-elasticsearch.darwin.svc.cluster.local:9200",
            "username": f'{os.getenv("VAULT_SERVICE_ES_USERNAME")}',
            "password": f'{os.getenv("VAULT_SERVICE_ES_PASSWORD")}',
        },
        "cloud_env": ["kind-0"],
        "kube_cluster": {"kind-0": "kind"},
        "internal_host_url": {"kind-0": "nginx-proxy-server.ray-system.svc.cluster.local"},
        "datadog_host_url": "d11stag.datadoghq.com",
        "datadog_dashboard_id": "abc-def-ghi",
        "jupyter_namespace": "ray",
        "jupyter_pods_threshold": 1,
        "jupyter_pods_max_idle_time": 5,
        "jupyter_pods_max_creation_time": 300,
        "init_script_path": "http://localhost/static/",
        "init_script_api": "http://darwin-compute.darwin.svc.cluster.local:8000/init-script-status",
        "host_url": "localhost",
        "spark_history_server": {
            "s3_events_path": "s3a://darwin/darwin/temp/spark_history_server",
            "efs_events_path": "fsx/spark/eventlogs",
        },
        "chronos_url": "http://darwin-chronos.darwin.svc.cluster.local:8000",
        "cci": {"s3_endpoint_url": "", "glue_endpoint_url": ""},
        "remote_command": {
            "status_report_api": f"http://darwin-compute.darwin.svc.cluster.local:8000/cluster/command/pod/status",
            "logs_s3_bucket": "darwin",
            "logs_s3_key": "mlp/logs/remote-command",
            "status_report_interval": 10,
        },
        "artifactory_path": "~/artifactory",
        "workspace_packages_bucket": "~/workspace-packages",
        "workspace_app_layer": "http://darwin-workspace.darwin.svc.clsuter.local:8000",
        "cpu_node_limits": {"cores": {"min": 1, "max": 90}, "memory": {"min": 1, "max": 736}},
        "s3": {
            "url": f'{os.getenv("AWS_ENDPOINT_URL_S3")}',
            "region": f'{os.getenv("AWS_DEFAULT_REGION")}',
            "access_key": f'{os.getenv("AWS_ACCESS_KEY_ID")}',
            "secret_access_key": f'{os.getenv("AWS_SECRET_ACCESS_KEY")}',
        },
    },
    "local": {
        "thanos_remote_write_url": "http://darwin-thanos-receive.com",  # placeholder
        "dcm_url": "localhost:8080",
        "mysql_db": {
            "write_host": "localhost",
            "read_host": "localhost",
            "user": "root",
            "password": "",
            "database": "main",
            "pool_size": 1,
            "port": "3306",
        },
        "elasticsearch": {
            "host": "http://localhost:9200",
            "username": f'{os.getenv("VAULT_SERVICE_ES_USERNAME")}',
            "password": f'{os.getenv("VAULT_SERVICE_ES_PASSWORD")}',
        },
        "cloud_env": ["eks-0"],
        "kube_cluster": {"eks-0": "darwin-stag-eks-cluster-0"},
        "internal_host_url": {"eks-0": "ray-nginx-eks-0.darwin.dream11-k8s.local"},
        "datadog_host_url": "d11stag.datadoghq.com",
        "datadog_dashboard_id": "abc-def-ghi",
        "jupyter_namespace": "ray",
        "jupyter_pods_threshold": 2,
        "jupyter_pods_max_idle_time": 5,
        "jupyter_pods_max_creation_time": 300,
        "init_script_path": "http://localhost:8000/static/",
        "init_script_api": "localhost:8000/init-script-status",
        "host_url": "darwin-local.dream11-local.com",
        "spark_history_server": {
            "s3_events_path": "s3a://s3-test-path/darwin/temp/spark_history_server",
            "efs_events_path": "fsx/spark/eventlogs",
        },
        "chronos_url": "",
        "cci": {"s3_endpoint_url": "", "glue_endpoint_url": ""},
        "remote_command": {
            "status_report_api": f"http://localhost:8000/cluster/command/pod/status",
            "logs_s3_bucket": "s3-test-path",
            "logs_s3_key": "mlp/logs/remote-command",
            "status_report_interval": 10,
        },
        "artifactory_path": "~/artifactory",
        "workspace_packages_bucket": "~/workspace-packages",
        "workspace_app_layer": "http://localhost:8000",
        "cpu_node_limits": {"cores": {"min": 1, "max": 90}, "memory": {"min": 1, "max": 736}},
    },
    "test": {
        "thanos_remote_write_url": "http://darwin-thanos-receive-test.dream11-test.local:10908/api/v1/receive",
        "dcm_url": f'darwin-clstr-mngr{os.getenv("TEAM_SUFFIX")}.dream11{os.getenv("VPC_SUFFIX")}.local',
        "mysql_db": {
            "write_host": "localhost",
            "read_host": "localhost",
            "user": f'{os.getenv("VAULT_SERVICE_MYSQL_USERNAME")}',
            "password": f'{os.getenv("VAULT_SERVICE_MYSQL_PASSWORD")}',
            "database": f'{os.getenv("CONFIG_SERVICE_MYSQL_DATABASE")}',
            "pool_size": 2,
            "port": "3306",
        },
        "elasticsearch": {"host": "localhost:9200"},
        "cloud_env": ["gcp", "eks-0"],
        "kube_cluster": {"gcp": "darwin-stag-cluster", "eks-0": "darwin-stag-eks-cluster-0"},
        "internal_host_url": {"gcp": "darwin-gcp.dream11.com", "eks-0": "test-internal-url"},
        "host_url": f"darwin{os.getenv('TEAM_SUFFIX')}.d11dev.com",
        "init_script_path": "http://localhost:8000/static/",
        "init_script_api": f"darwin-compute-test.dream11-test.local/init-script-status",
        "jupyter_namespace": "ray",
        "jupyter_pods_threshold": 2,
        "jupyter_pods_max_idle_time": 10,
        "spark_history_server": {
            "s3_events_path": "s3a://s3-test-path/darwin/temp/spark_history_server",
            "efs_events_path": "fsx/spark/eventlogs",
        },
        "chronos_url": "test_chronos_url.local",
        "cci": {"s3_endpoint_url": "", "glue_endpoint_url": ""},
        "gcp_project_id": "darwin-gcp-stag",
        "gcp_image_cache_id": "darwin-image-cached",
        "jupyter_pods_max_creation_time": 300,
        "remote_command": {
            "status_report_api": f"http://darwin-compute-test.dream11-test.local/cluster/command/pod/status",
            "logs_s3_bucket": "test-bucket",
            "logs_s3_key": "mlp/logs/remote-command",
            "status_report_interval": 10,
        },
        "artifactory_path": "s3://d11-mlstag/darwin_artifactory_stag",
        "workspace_packages_bucket": "s3://d11-mlstag/workspace_packages_stag",
        "workspace_app_layer": "http://localhost:8000",
        "cpu_node_limits": {"cores": {"min": 1, "max": 90}, "memory": {"min": 1, "max": 736}},
    },
}

CLUSTER_START_URL = "compute/v2/cluster/start"
CLUSTER_STOP_URL = "compute/v2/cluster/stop"
CLUSTER_RESTART_URL = "compute/v2/cluster/restart"
CLUSTER_CREATE_URL = "compute/v2/cluster"
CLUSTER_STATUS_URL = "compute/v2/cluster/status"
HOST_NAME_DARWIN = "darwin-cluster-manager-uat.dream11.local"
JUPYTER_START_URL = "/jupyter/start"
JUPYTER_RESTART = "/jupyter/restart"
JUPYTER_DELETE = "/jupyter/delete"
SPARK_HISTORY_SERVER_START = "/spark-history-server/start"
SPARK_HISTORY_SERVER_STOP = "/spark-history-server/stop"
CLUSTER_POD_STATUS_API = "/cluster/command/pod/status"

HTTP = "http://"
HTTPS = "https://"

ES_INDEX = "computea_v2"
TAGS_FIELD = "tags"
USER_FIELD = "user"

ALREADY_EXIST = "Cluster with same name already exist"
INVALID_USER_NAME = "Invalid username entered"

# TODO: Move to config constants
WORKSPACE_MOUNT_PATH = "/home/ray/fsx"
RSS_MOUNT_PATH = "/home/ray/rss"
ADDITIONAL_DISK_MOUNT_PATH = "/tmp/disk"

CLOUD_ENV_CONFIG_KEY_DEFAULT = "cloud_env"
CLOUD_ENV_CONFIG_KEY_JOB = "cloud_env_job"
CLOUD_ENV_CONFIG_KEY_REMOTE_KERNEL = "cloud_env_remotekernel"
CLOUD_ENV_CONFIG_KEY_SHS = "cloud_env_shs"

DEFAULT_NAMESPACE = "ray"

TEAM_SUFFIX = os.getenv("TEAM_SUFFIX")
VPC_SUFFIX = os.getenv("VPC_SUFFIX")

MAVEN_CENTRAL_BASE_URL = "https://search.maven.org/solrsearch/select"

DEFAULT_CLUSTER_EVENTS = {
    "POD_FAILED",
    "POD_FAILED_SCHEDULING",
    "POD_STARTED",
    "POD_EVICTED",
    "CLUSTER_CREATED",
    "CLUSTER_CREATION_FAILED",
    "CLUSTER_DELETED",
    "CLUSTER_DELETION_FAILED",
    "CLUSTER_UPDATED",
    "CLUSTER_UPDATION_FAILED",
    "CLUSTER_START_REQUEST_RECEIVED",
    "CLUSTER_START_FAILED",
    "CLUSTER_STOP_REQUEST_RECEIVED",
    "CLUSTER_STOPPED",
    "CLUSTER_TIMEOUT",
    "CLUSTER_STOP_FAILED",
    "CLUSTER_RESTART_REQUEST_RECEIVED",
    "CLUSTER_RESTART_FAILED",
    "HEAD_NODE_UP",
    "WORKER_NODES_UP",
    "JUPYTER_UP",
    "CLUSTER_READY",
    "AUTO_TERMINATED",
    "INIT_SCRIPT_EXECUTION_STARTED",
    "INIT_SCRIPT_EXECUTION_SUCCESSFUL",
    "INIT_SCRIPT_EXECUTION_FAILED",
    "INSTANCE_RUNNING",
    "INSTANCE_STOPPED",
    "SPOT_INTERRUPTION",
    "SPARK_CONNECT_PROCESS_STARTED",
    "SPARK_CONNECT_PROCESS_FAILED",
    "SPARK_CONNECT_PROCESS_COMPLETED",
    "SPARK_CONNECT_SERVER_CREATION_STARTED",
    "SPARK_CONNECT_SERVER_CREATION_SUCCESS",
    "SPARK_CONNECT_SERVER_CREATION_FAILED",
    "SPARK_CONNECT_SERVER_CREATION_SKIPPED",
    "SPARK_INIT_NOT_SUPPORTED",
    "SPARK_INIT_SUCCESS",
    "SPARK_INIT_SKIPPED",
    "SPARK_INIT_FAILED",
    "SPARK_CLIENT_INITIATED",
    "SPARK_CLIENT_INITIALIZATION_SKIPPED",
    "SPARK_CONNECT_CLIENT_INITIATED",
    "SPARK_CONNECT_INITIALIZED",
    "SPARK_CONNECT_INITIALIZE_FAILED",
    "SPARK_CONNECT_STOPPED",
    "SPARK_CONFIG_FETCH_FAILED",
    "COMPUTE_METADATA_FETCH_FAILED",
}


class KubeCluster(Enum):
    GCP = "gcp"
    AWS_0 = "eks-0"
    AWS_1 = "eks-1"
    AWS_2 = "eks-2"
    KIND_0 = "kind-0"


class ResourceType(Enum):
    ALL_PURPOSE_CLUSTER = "all-purpose-cluster"
    JOB_CLUSTER = "job-cluster"
    REMOTE_KERNEL = "remote-kernel"
    SPARK_HISTORY_SERVER = "spark-history-server"


class PredictionTables:
    # tables are named CMR values - like oneTwo => CMR = 1:2
    # the columns are instance type, cores, memory, on-demand price per hr, min. spot price per hr, respectively
    # source: https://instances.vantage.sh/
    oneOne = [["t3.small", 2, 2, 0.021, 0.006]]
    oneTwo = [
        ["c6g.medium", 1, 2, 0.034, 0.011],
        ["t3.medium", 2, 4, 0.042, 0.013],
        ["c5.xlarge", 4, 8, 0.17, 0.064],
        ["c5.2xlarge", 8, 16, 0.34, 0.123],
        ["c5.4xlarge", 16, 32, 0.68, 0.23],
        ["c6g.8xlarge", 32, 64, 1.088, 0.336],
        ["c5.9xlarge", 36, 72, 1.53, 0.502],
        ["c5.12xlarge", 48, 96, 2.04, 0.634],
        ["c6g.16xlarge", 64, 128, 2.176, 0.655],
        ["c5.18xlarge", 72, 144, 3.06, 1.05],
        ["c5.24xlarge", 96, 192, 4.08, 1.264],
    ]
    oneFour = [
        ["m5.large", 2, 8, 0.096, 0.033],
        ["m5.xlarge", 4, 16, 0.192, 0.063],
        ["m5.2xlarge", 8, 32, 0.384, 0.158],
        ["m5.4xlarge", 16, 64, 0.768, 0.271],
        ["m5.8xlarge", 32, 128, 1.536, 0.498],
        ["m5.12xlarge", 48, 192, 2.304, 0.744],
        ["m5.16xlarge", 64, 256, 3.072, 1.026],
        ["m5.24xlarge", 96, 384, 4.608, 1.483],
    ]
    oneEight = [
        ["r6g.medium", 1, 8, 0.05, 0.016],
        ["r5.large", 2, 16, 0.126, 0.041],
        ["r5.xlarge", 4, 32, 0.252, 0.084],
        ["r5.2xlarge", 8, 64, 0.504, 0.212],
        ["r5.4xlarge", 16, 128, 1.008, 0.376],
        ["r5.8xlarge", 32, 256, 2.016, 0.626],
        ["r5.12xlarge", 48, 384, 3.024, 1.014],
        ["r5.16xlarge", 64, 512, 4.032, 1.299],
        ["r5.24xlarge", 96, 768, 6.048, 1.987],
    ]
    gpuPricing = {
        "NVIDIA T4": {1: 0.752, 4: 3.912},  # g4dn.2xlarge (8vCPUs, 32GiB)  # g4dn.12xlarge (48vCPUs, 192GiB)
        "NVIDIA A10": {1: 1.212},  # g5.2xlarge (8vCPUs, 32GiB)
        "NVIDIA A100 40GB": {8: 32.77},  # p4d.24xlarge (96vCPU, 1152GiB)
        "NVIDIA A100 80GB": {8: 40.97},  # p4de.24xlarge (96vCPU, 1152GiB)
    }


JAVA_PACKAGE_DOWNLOAD_DIR = "/home/ray/darwin_pkgs/jars"
S3_PACKAGE_DOWNLOAD_DIR = "/home/ray/darwin_pkgs/s3"
PYTHON_PACKAGE_DOWNLOAD_DIR = "/home/ray/darwin_pkgs/python"


class RuntimeV2ValidTypes:
    CUSTOM = ["Created By Me", "Created By Others"]
    CPU = ["Ray Only", "Ray and Spark", "Others"]
    GPU = ["Ray Only", "Ray and Spark", "Others"]
