from typeguard import typechecked

from darwin_workflow.constant.constants import CONFIGS_MAP


@typechecked
class Config:
    """
    Config class to get the configuration based on environment
    """
    def __init__(self, env: str):
        self.env = env
        self._config = CONFIGS_MAP[self.env]

    @property
    def get_workflow_url(self):
        return self._config['workflow_url']

    @property
    def get_workflow_ui_base_url(self):
        return self._config['workflow_ui_base_url']
