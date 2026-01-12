from typing_extensions import Literal
import os

# TODO: ENV_TYPE literal doesn't match actual environment handling logic (e.g., 'stag' maps to 'dev' in some places)
# TODO: Consider using an Enum instead of Literal for better IDE support and validation
ENV_TYPE = Literal["prod", "stag", "uat", "local", "dev", "darwin-local"]

# Elasticsearch indices
INDEX = os.getenv("ES_INDEX_WORKFLOW", "workflow_cud")
INDEX_TRACKING = os.getenv("ES_INDEX_TRACKING", "workflow_tracking")
JOB_CLUSTER_INDEX = os.getenv("ES_INDEX_JOB_CLUSTERS", "job_clusters")
WORKFLOW_CLUSTERS_INDEX = os.getenv("ES_INDEX_WORKFLOW_CLUSTERS", "workflow_clusters")
WORKFLOW_HISTORY_INDEX = os.getenv("ES_INDEX_WORKFLOW_HISTORY", "workflow_cud_history")
LATEST_TASK_RUN = os.getenv("ES_INDEX_LATEST_TASK_RUN", "latest_task_run")

# TODO: Status constants should be an Enum with clear state machine transitions documented
# TODO: Workflow status vs run status vs task status use overlapping constants - separate into distinct enums
# Status constants
ERROR = "error"
CLUSTER_NAME_ALREADY_EXISTS_ERROR = "Cluster name already exists"
DELETED = "deleted"
AIRFLOW_ENDPOINT = "/api/v1"
ACTIVE = "active"
INACTIVE = "inactive"
PAUSED = "paused"
QUEUED = "queued"
RUNNING = "running"
STOPPING = "stopping"
SKIPPED = "skipped"
SUCCESS = "success"
EXPIRED = "expired"
CREATED_ARTIFACT = "created_artifact"
CREATING_ARTIFACT = "creating_artifact"
CREATION_FAILED = "creation_failed"
UPDATED_ARTIFACT = "updated_artifact"
UPDATING_ARTIFACT = "updating_artifact"
UPDATE_FAILED = "updating_failed"
RESUMING = "resuming"
PAUSING = "pausing"
REPAIRING = "repairing"
FAIL = "failed"

# Authentication & Tokens
AUTH_TOKEN = os.getenv("AIRFLOW_AUTH_TOKEN", "")
ENV = os.getenv("ENV", "local")
GIT_TOKEN = os.getenv("GIT_TOKEN", "")
GIT_FC_TOKEN = os.getenv("GIT_FC_TOKEN", "")
GIT_OWNER = os.getenv("GIT_OWNER", "")

# Workflow types
NOTEBOOK = "notebook"
SCRIPT = "script"
SCHEDULED = "scheduled"
AUTOMATIC = "automatic"
MANUAL = "manual"
EXTERNAL = "external"
VALID = "valid"
INVALID = "invalid"

# Control operations
STOP_RUN = {"state": "failed"}
PAUSE_RUN = {"is_paused": True}
RESUME_RUN = {"is_paused": False}

# Cluster types
BASIC = "basic"
JOB = "job"
STRING = "string"
NAMESPACE = os.getenv("K8S_NAMESPACE", "default")
GIT = "git"
ZIP = "zip"
WORKSPACE = "workspace"
JOB_CLUSTER = "job"
BASIC_CLUSTER = "basic"

# Timeouts and limits
TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "600"))
MAX_ACTIVE_TASKS = int(os.getenv("MAX_ACTIVE_TASKS", "128"))

# File paths
FSX_BASE_PATH = os.getenv("FSX_BASE_PATH", "/var/www/fsx/workspace/")
FSX_BASE_PATH_DYNAMIC_TRUE = os.getenv("FSX_BASE_PATH_DYNAMIC", "/home/ray/fsx/workspace/")
AIRFLOW_LOGS_BASE_PATH = os.getenv("AIRFLOW_LOGS_BASE_PATH", "/root/airflow/fsx/workspace")
STATIC_FILES_ENDPOINT = "static"

# Slack configuration
SLACK_USERNAME = os.getenv("SLACK_USERNAME", "Workflow Alert")
SLACK_TOKEN = os.getenv("SLACK_TOKEN", "")
DEFAULT_CHANNEL = os.getenv("DEFAULT_SLACK_CHANNEL", "workflow-alerts")
DARWIN_DEFAULT_CHANNEL = os.getenv("DARWIN_DEFAULT_CHANNEL", DEFAULT_CHANNEL)
MAX_SLACK_CONTENT_LENGTH = 1900

# HTTP headers
headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
}

# Other constants
HTML = "html"
COMMUTER = "commuter"
msg = ''

# HTTP Basic Auth helper
# Parse AUTH_TOKEN if it's in "Basic <base64>" format, otherwise use as-is
def _parse_auth_token():
    """Parse AUTH_TOKEN and return a tuple (username, password) for HTTP basic auth"""
    import base64
    token = AUTH_TOKEN.strip()
    if token.startswith("Basic "):
        # Decode base64 token
        try:
            decoded = base64.b64decode(token[6:]).decode('utf-8')
            if ':' in decoded:
                username, password = decoded.split(':', 1)
                return (username, password)
        except Exception:
            pass
    # If token is in username:password format
    if ':' in token and not token.startswith("Basic "):
        username, password = token.split(':', 1)
        return (username, password)
    # Default: return None (no auth)
    return None

auth = _parse_auth_token()
