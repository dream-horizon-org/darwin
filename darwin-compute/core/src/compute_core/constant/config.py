import os
from typing import Optional

from typeguard import typechecked

from compute_core.constant.constants import CONFIGS_MAP, ES_INDEX, DEFAULT_NAMESPACE


@typechecked
class Config:
    """
    Config class to get the configuration based on environment
    """

    # TODO: Environment fallback logic (dev/stag/load -> stag) is implicit - document or make explicit
    def __init__(self, env: str = None):
        if not env:
            env = os.getenv("ENV", "stag")
            if env in ["dev", "stag", "load"]:
                env = "stag"
        self.env = env
        # TODO: Missing validation - will KeyError if env is not in CONFIGS_MAP
        self._config = CONFIGS_MAP[self.env]

    @property
    def dcm_url(self):
        return self._config["dcm_url"]

    @property
    def get_chronos_url(self):
        return self._config["chronos_url"]

    @property
    def host_url(self):
        return self._config["host_url"]

    @property
    def datadog_host_url(self):
        return self._config["datadog_host_url"]

    @property
    def datadog_dashboard_id(self):
        return self._config["datadog_dashboard_id"]

    def internal_host_url(self, cloud_env: str):
        return self._config["internal_host_url"][cloud_env]

    def get_init_script_path(self):
        return self._config["init_script_path"]

    def db_config(self) -> dict:
        """
        Returns the database configuration for both read and write databases
        """
        mysql_db = self._config["mysql_db"]
        return mysql_db

    def es_config(self):
        es_db = self._config["elasticsearch"]
        es_db["index"] = ES_INDEX
        return es_db

    def get_cloud_env(self, default_cloud_env: str, cloud_env: Optional[str] = None):
        if not cloud_env:
            cloud_env = default_cloud_env
        elif cloud_env not in self._config["cloud_env"]:
            raise ValueError("Invalid cloud environment")
        return cloud_env

    def get_kube_cluster(self, cloud_env: str):
        return self._config["kube_cluster"][cloud_env]

    @property
    def jupyter_namespace(self):
        return self._config["jupyter_namespace"]

    @property
    def jupyter_pods_threshold(self):
        return self._config["jupyter_pods_threshold"]

    @property
    def jupyter_pods_max_idle_time(self):
        return self._config["jupyter_pods_max_idle_time"]

    @property
    def jupyter_max_creation_time(self):
        return self._config["jupyter_pods_max_creation_time"]

    @property
    def get_slack_config(self):
        token = os.getenv("VAULT_SERVICE_SLACK_TOKEN", "")
        username = "darwin-bot"
        return token, username

    @property
    def cluster_create_retry_attempts(self):
        # TODO: Hardcoded value should be configurable via environment variable or config
        return 3

    @property
    def spark_history_server_config(self):
        return self._config["spark_history_server"]

    @property
    def default_namespace(self):
        return DEFAULT_NAMESPACE

    @property
    def gcp_project_id(self):
        return self._config["gcp_project_id"]

    @property
    def gcp_image_cache_id(self):
        return self._config["gcp_image_cache_id"]

    @property
    def get_cci_config(self):
        return self._config["cci"]

    @property
    def remote_command_config(self):
        return self._config["remote_command"]

    @property
    def get_artifactory_path(self):
        return self._config["artifactory_path"]

    @property
    def get_workspace_packages_bucket(self):
        return self._config["workspace_packages_bucket"]

    @property
    def get_workspace_app_layer_url(self):
        return self._config["workspace_app_layer"]

    @property
    def get_cpu_node_limits(self):
        return self._config["cpu_node_limits"]
