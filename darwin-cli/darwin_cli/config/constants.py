import os

# Name of the process environment variable that SDKs may rely on
ENV_VAR = "ENV"
SUPPORTED_ENV = {"darwin-local"}
LOCAL_ENV = "darwin-local"
# Directory and YAML file used to store CLI configuration (current_env + env profiles)
CONFIG_DIR = os.path.join(os.path.expanduser("~"), ".darwin-cli")
ENV_FILE = os.path.join(CONFIG_DIR, "config.yaml")