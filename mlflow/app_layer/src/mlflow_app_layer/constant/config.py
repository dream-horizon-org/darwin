from __future__ import annotations

from typeguard import typechecked
from mlflow_app_layer.config.constants import CONFIG_MAP, ConfigMap


@typechecked
class Config:
    """
    Config class to get the configuration based on environment
    """

    def __init__(self):
        self._config: ConfigMap = CONFIG_MAP
        print(f"Config: {self._config}")

    @property
    def mlflow_ui_url(self) -> str:
        return self._config["MLFLOW_UI_URL"]

    @property
    def mlflow_app_layer_url(self) -> str:
        return self._config["MLFLOW_APP_LAYER_URL"]

    @property
    def mlflow_app_base_path(self) -> str:
        return self._config["MLFLOW_APP_BASE_PATH"]

    def mlflow_admin_credentials(self) -> dict[str, str]:
        return {
            "username": self._config["MLFLOW_ADMIN_USERNAME"],
            "password": self._config["MLFLOW_ADMIN_PASSWORD"],
        }

    def db_config(self) -> dict[str, str]:
        mysql_db = self._config["mysql_db"]
        return {
            "host": mysql_db["host"],
            "user": mysql_db["username"],
            "password": mysql_db["password"],
            "database": mysql_db["database"],
            "port": mysql_db["port"],
        }
