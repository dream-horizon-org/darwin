from airflow.models import Variable
from typing_extensions import Literal
import os

# Get Slack API URL from environment variable with fallback to default
SLACK_API_URL = os.getenv("SLACK_API_URL", "https://slack.com/api/")
# Get Slack token from Airflow Variables with fallback to environment variable
try:
    SLACK_TOKEN = Variable.get("SLACK_TOKEN", default_var=os.getenv("SLACK_TOKEN", ""))
except:
    SLACK_TOKEN = os.getenv("SLACK_TOKEN", "")

# Get environment from Airflow Variables with fallback to environment variable
try:
    ENV = Variable.get("ENV", default_var=os.getenv("ENV", "local"))
except:
    ENV = os.getenv("ENV", "local")

ENV_TYPE = Literal["prod", "stag", "uat", "local", "dev", "darwin-local"]
SLACK_USERNAME = os.getenv("SLACK_USERNAME", "Workflow Alert")
FSX_BASE_PATH_DYNAMIC_TRUE = os.getenv("FSX_BASE_PATH_DYNAMIC", "/home/ray/fsx/workspace/")
WORKSPACE = "workspace"
MAX_ACTIVE_TASKS = int(os.getenv("MAX_ACTIVE_TASKS", "128"))
FSX_BASE_PATH = os.getenv("FSX_BASE_PATH", "/var/www/fsx/workspace/")
AIRFLOW_LOGS_BASE_PATH = os.getenv("AIRFLOW_LOGS_BASE_PATH", "/root/airflow/fsx/workspace")

# Get default Slack channel from Airflow Variables with fallback to environment variable
try:
    DEFAULT_SLACK_CHANNEL = Variable.get("DEFAULT_SLACK_CHANNEL", default_var=os.getenv("DEFAULT_SLACK_CHANNEL", "workflow-alerts"))
except:
    DEFAULT_SLACK_CHANNEL = os.getenv("DEFAULT_SLACK_CHANNEL", "workflow-alerts")

BASIC = "basic"
JOB = "job"
NUM_HA_CLUSTERS = int(os.getenv("NUM_HA_CLUSTERS", "3"))
DEFAULT_CRON_TIMEZONE = os.getenv("DEFAULT_CRON_TIMEZONE", "UTC")
