import os
from configparser import ConfigParser

from darwin.util.utils import get_env


class ApplicationConfigClient:
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.config_parser = ConfigParser(allow_no_value=True)
        self.config_parser.optionxform = str  # Preserve the case of the keys
        self.config_parser.read(self.config_path)

    def get_compute_url(self) -> str:
        """
        Get the compute service URL.
        For LOCAL environment, DARWIN_COMPUTE_URL env var can override the default.
        """
        # Allow environment variable override for flexibility in local setups
        env_override = os.getenv("DARWIN_COMPUTE_URL")
        if env_override:
            return env_override
        return self.config_parser.get(get_env().name, "computeUrl")
