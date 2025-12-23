import os

def get_config():
    """
    Get configuration from environment variables.
    This function loads all required configuration values from environment variables.
    """
    return {
        'workflow_url': os.getenv('WORKFLOW_APP_LAYER_URL', 'http://localhost:8000'),
        'workflow_ui_base_url': os.getenv('WORKFLOW_UI_BASE_URL', 'http://localhost:8000/workflows'),
    }

# For backward compatibility - map all environments to use the same config function
CONFIGS_MAP = {
    'local': get_config(),
    'dev': get_config(),
    'stag': get_config(),
    'uat': get_config(),
    'prod': get_config(),
}

START_DATE = os.getenv("WORKFLOW_START_DATE", "2023-06-03T05:55:35Z")