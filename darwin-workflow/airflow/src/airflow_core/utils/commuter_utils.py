from airflow_core.constants.configs import Config


class CommuterUtils:
    def __init__(self, env: str):
        self._config = Config(env)
        self.commuter_url = self._config.get_commuter_url

    def get_commuter_link(
        self, dag_id: str, run_id: str, task_id: str, try_number=None
    ):
        if try_number:
            url = f"{self.commuter_url}/{dag_id}/{task_id}/{run_id}/try_{try_number}.ipynb"
        else:
            url = f"{self.commuter_url}/{dag_id}/{task_id}/{run_id}.ipynb"

        return url

    def get_commuter_link_from_suffix(self, suffix: str):
        url = f"{self.commuter_url}/{suffix}"
        return url
