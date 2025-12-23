from workflow_core.constants.configs import Config
from workflow_core.constants.constants import INDEX, INDEX_TRACKING, WORKFLOW_HISTORY_INDEX
from workflow_core.dao.workflow_elastic_search_dao import WorklfowElasticSearchDao
from workflow_model.workflow import Workflow, RecentlyVisitedDto, VersionedWorkflow


class ElasticSearchConnection:
    def __init__(self, env: str):
        self.env = env
        _config = Config(env)
        index = INDEX
        self.es_dao = WorklfowElasticSearchDao(*Config(env).es_config(index, lambda raw_dict: Workflow(**raw_dict)))

    def health_elasticsearch(self):
        try:
            return self.es_dao.elasticsearch_client.ping()
        except Exception as e:
            import logging
            logger = logging.getLogger('main')
            logger.error(f"Elasticsearch health check failed: {e}")
            return False


class RecentlyVisitedConnection:
    def __init__(self, env: str):
        self.env = env
        _config = Config(env)
        index = INDEX_TRACKING
        self.es_dao = WorklfowElasticSearchDao(
            *Config(env).es_config(index, lambda raw_dict: RecentlyVisitedDto(**raw_dict)))


class WorkflowHistoryElasticSearchConnection:
    def __init__(self, env: str):
        self.env = env
        _config = Config(env)
        index = WORKFLOW_HISTORY_INDEX
        self.es_dao = WorklfowElasticSearchDao(
            *Config(env).es_config(index, lambda raw_dict: VersionedWorkflow(**raw_dict)))