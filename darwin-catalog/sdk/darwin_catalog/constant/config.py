"""Configuration for Darwin Catalog SDK."""

import os
from typing import Optional
from darwin_catalog.constant.constants import CONFIGS_MAP

class Config:
    """Configuration class for Catalog SDK."""

    def __init__(self) -> None:
        self._env = os.environ.get("ENV", "darwin-local")
        self.config = CONFIGS_MAP[self._env]

    @property
    def env(self) -> str:
        return self._env

    @property
    def catalog_base_url(self) -> str:
        """Get the catalog service base URL based on environment."""
        return self.config["catalog_url"]

    @property
    def client_token(self) -> Optional[str]:
        """Get client token for authenticated requests."""
        return self.config["client_token"]

