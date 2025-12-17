import os

def get_config():
    """
    Get configuration from environment variables.
    This function loads all required configuration values from environment variables.
    """
    return {
        "commuter.configs": {
            "commuter.url": os.getenv("COMMUTER_URL", "http://localhost:8888/view"),
        },
        "airflow.configs": {
            "airflow.url": os.getenv("AIRFLOW_URL", "http://localhost:8080"),
            "airflow.auth": os.getenv("AIRFLOW_AUTH_TOKEN", ""),
        },
        "app-layer-url": os.getenv("WORKFLOW_APP_LAYER_URL", "http://localhost:8001"),
        "app-layer-url-public": os.getenv("WORKFLOW_APP_LAYER_PUBLIC_URL", "http://localhost:8001"),
        "compute-app-layer": os.getenv("COMPUTE_APP_LAYER_URL", "http://localhost:9000/cluster"),
        "compute.configs": {
            "compute.url": os.getenv("COMPUTE_SERVICE_URL", "http://localhost:9000")
        },
        "s3.bucket": os.getenv("S3_BUCKET_NAME", "workflow-artifacts"),
        "DARWIN_URL": os.getenv("WORKFLOW_UI_BASE_URL", "http://localhost:8001/workflows/"),
        "airflow-s3-folder": os.getenv("AIRFLOW_S3_FOLDER", "workflow/airflow_artifacts"),
        "default_callback_url": os.getenv("DEFAULT_CALLBACK_URL", "http://localhost:8001/events"),
        'darwin_events_url': os.getenv("EVENTS_SERVICE_URL", "http://localhost:8001"),
        "pelican_url": os.getenv("PELICAN_URL", "http://localhost:8002"),
        "slack.api.url": os.getenv("SLACK_API_URL", "https://slack.com/api/"),
        "datadog.api.url": os.getenv("DATADOG_API_URL", "https://api.datadoghq.com/api/v2/series"),
        "datadog.api.key": os.getenv("DATADOG_API_KEY", ""),
        "pypi.index.url": os.getenv("PYPI_INDEX_URL", ""),
        "pypi.trusted.host": os.getenv("PYPI_TRUSTED_HOST", ""),
    }

# For backward compatibility - map all environments to use the same config function
CONFIGS_MAP = {
    "dev": get_config(),
    "stag": get_config(),
    "uat": get_config(),
    "prod": get_config(),
    "local": get_config(),
    "darwin-local": get_config(),
}
