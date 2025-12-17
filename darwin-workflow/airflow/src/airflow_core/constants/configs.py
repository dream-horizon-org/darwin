from airflow_core.constants.config_constants import CONFIGS_MAP


class Config:
    def __init__(self, env):
        if env not in CONFIGS_MAP:
            raise ValueError(f"Invalid environment: {env}")

        self.env = env
        self._config = CONFIGS_MAP[self.env]

    @property
    def get_commuter_url(self):
        return self._config["commuter.configs"]["commuter.url"]

    @property
    def get_airflow_url(self):
        return self._config["airflow.configs"]["airflow.url"]

    @property
    def get_airflow_auth(self):
        return self._config["airflow.configs"]["airflow.auth"]

    @property
    def get_app_layer(self):
        return self._config["app-layer-url"]

    @property
    def get_compute_app_layer(self):
        return self._config["compute-app-layer"]

    @property
    def get_compute_url(self):
        return self._config["compute.configs"]["compute.url"]

    @property
    def get_s3_bucket(self):
        return self._config["s3.bucket"]

    @property
    def get_airflow_s3_folder(self):
        return self._config["airflow-s3-folder"]

    @property
    def get_darwin_url(self):
        return self._config["DARWIN_URL"]

    @property
    def get_default_callback_url(self):
        return self._config["default_callback_url"]

    @property
    def get_app_layer_public(self):
        return self._config["app-layer-url-public"]

    @property
    def get_darwin_events_url(self):
        return self._config["darwin_events_url"]

    @property
    def get_pelican_url(self):
        return self._config["pelican_url"]
