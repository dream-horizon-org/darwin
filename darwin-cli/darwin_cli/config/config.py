import os
from typing import Any, Dict, Optional

import yaml
from typeguard import typechecked

from darwin_cli.config.constants import ENV_VAR, CONFIG_DIR, ENV_FILE


@typechecked
class Config:
    """Config class to manage CLI environment and confidential user config.

    All configuration is stored in a YAML file with the following shape:

    current_env: <env_name>
    env:
      <env_name>:
        <key1>: <val1>
        <key2>: <val2>
    """

    def __init__(self) -> None:
        self.env: Optional[str] = None

    def _load_yaml(self) -> Dict[str, Any]:
        """Load the YAML config file (if present)."""
        if not os.path.exists(ENV_FILE):
            return {}
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        if not isinstance(data, dict):
            return {}
        return data

    def _save_yaml(self, data: Dict[str, Any]) -> None:
        """Persist the YAML config file."""
        os.makedirs(CONFIG_DIR, exist_ok=True)
        with open(ENV_FILE, "w", encoding="utf-8") as f:
            yaml.safe_dump(data, f, sort_keys=True)

    @property
    def get_env(self) -> Optional[str]:
        """Return the current environment.

        Priority:
        1. Process environment variable ENV_VAR
        2. `current_env` from config YAML
        3. None if not set
        """
        data = self._load_yaml()
        current_env = data.get("current_env")
        return current_env if isinstance(current_env, str) else None

    def set_env(self, env: str) -> None:
        """Set and persist the environment in YAML and process env.

        This updates both the process ENV_VAR and writes the value
        to the YAML config file under `current_env`.
        """
        # Update process env for this invocation
        os.environ[ENV_VAR] = env

        # Update YAML structure
        data = self._load_yaml()
        data["current_env"] = env
        env_map = data.setdefault("env", {})
        if not isinstance(env_map, dict):
            env_map = {}
            data["env"] = env_map
        env_map.setdefault(env, {})  # ensure env section exists
        self._save_yaml(data)

        self.env = env

    def get_env_config(self, env: Optional[str] = None) -> Dict[str, Any]:
        """Return configuration dictionary for the given env from YAML only."""

        data = self._load_yaml()
        env_map = data.get("env", {}) if isinstance(data.get("env", {}), dict) else {}
        env_conf = env_map.get(env, {}) if isinstance(env_map.get(env, {}), dict) else {}

        result: Dict[str, Any] = {"env": env}
        result.update(env_conf)
        return result