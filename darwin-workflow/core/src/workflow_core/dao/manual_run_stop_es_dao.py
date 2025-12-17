from workflow_core.constants.configs import Config
from workflow_core.constants.constants import LATEST_TASK_RUN
from workflow_core.dao.workflow_elastic_search_dao import WorklfowElasticSearchDao
from workflow_model.workflow import LatestTaskRun


class LatestTaskRunElasticSearchConnection:
    def __init__(self, env: str):
        self.env = env
        _config = Config(env)
        index = LATEST_TASK_RUN
        self.es_dao = WorklfowElasticSearchDao(
            *Config(env).es_config(index, lambda raw_dict: LatestTaskRun(**raw_dict)))