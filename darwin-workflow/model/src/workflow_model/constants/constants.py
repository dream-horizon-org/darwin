import os

INACTIVE = "inactive"
ACTIVE = "active"

STATUSES = ["active", "inactive", "created_artifact", "creating_artifact", "creation_failed", "updated_artifact",
            "updating_artifact", "updating_failed", "resuming", "pausing"]
DEFAULT_SCHEDULE = "0 0 31 2 *"
DEFAULT_INTEGER_VALUE = -1
BASIC = "basic"
CREATING_ARTIFACT = "creating_artifact"
DEFAULT_TIMEZONE = "UTC"
DEFAULT_DISPLAY_TIMEZONE = "IST"
GIT = "git"
WORKSPACE = "workspace"
JOB_CLUSTER = "job"
BASIC_CLUSTER = "basic"
FSX_BASE_PATH = os.getenv("FSX_BASE_PATH", "/var/www/fsx/workspace/")
FSX_BASE_PATH_DYNAMIC_TRUE = os.getenv("FSX_BASE_PATH_DYNAMIC", "/home/ray/fsx/workspace/")
