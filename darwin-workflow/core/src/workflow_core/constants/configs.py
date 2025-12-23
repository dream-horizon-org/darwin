from typing import Callable

from workflow_core.constants.config_constants import CONFIGS_MAP


class Config:
    def __init__(self, env):
        self.env = env
        self._config = CONFIGS_MAP[self.env]

    def es_config(self, index: str, lambda_func: Callable):
        es_host = self._config['dataset.configs']['elastic-search.url']
        es_username = self._config['dataset.configs']['elastic-search.user']
        es_password = self._config['dataset.configs']['elastic-search.pwd']
        resp = (es_host, index, lambda_func, es_username, es_password,)
        return resp

    @property
    def get_airflow_url(self):
        return self._config['airflow.configs']['airflow.url']

    @property
    def get_airflow_auth(self):
        return self._config['airflow.configs']['airflow.auth']

    @property
    def get_commuter_url(self):
        return self._config['commuter.configs']['commuter.url']

    @property
    def get_compute_url(self):
        return self._config['compute.configs']['compute.url']

    @property
    def db_config(self) -> dict:
        mysql_db = self._config['airflow_mysql_db']
        return {
            'host': mysql_db['host'],
            'username': mysql_db['username'],
            'password': mysql_db['password'],
            'database': mysql_db['database'],
            'port': mysql_db['port']
        }

    @property
    def get_workflow_conn(self):
        workflow_db = self._config['workflow_db']
        return  (f"mysql://{workflow_db['username']}:{workflow_db['password']}@{workflow_db['host']}:{workflow_db['port']}/{workflow_db['database']}")

    @property
    def get_workflow_config(self) -> dict:
        workflow_db = self._config['workflow_db']
        return {
            'host': workflow_db['host'],
            'username': workflow_db['username'],
            'password': workflow_db['password'],
            'database': workflow_db['database'],
            'port': workflow_db['port']
        }

    @property
    def get_app_layer(self):
        return self._config['app-layer-url']

    @property
    def get_compute_app_layer(self):
        return self._config['compute-app-layer']

    @property
    def get_s3_bucket(self):
        return self._config['s3.bucket']

    @property
    def get_airflow_s3_folder(self):
        return self._config['airflow-s3-folder']

    @property
    def get_darwin_url(self):
        return self._config['DARWIN_URL']

    @property
    def get_default_callback_url(self):
        return self._config['default_callback_url']

    @property
    def get_app_layer_public(self):
        return self._config['app-layer-url-public']

    @property
    def get_darwin_events_url(self):
        return self._config['darwin_events_url']
