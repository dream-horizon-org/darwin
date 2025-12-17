from workflow_core.constants.configs import Config
from workflow_core.constants.constants import JOB_CLUSTER_INDEX
from workflow_core.dao.workflow_elastic_search_dao import WorklfowElasticSearchDao
from workflow_core.entity.es_entities import ESIdentifier
from workflow_model.job_cluster import JobClusterDefinition


class JobClusElasticSearchConnection:
    def __init__(self, env: str):
        _config = Config(env)
        index = JOB_CLUSTER_INDEX
        self.es_dao = WorklfowElasticSearchDao(
            *Config(env).es_config(index, lambda raw_dict: JobClusterDefinition.from_dict(raw_dict)))

    def health_elasticsearch(self):
        return self.es_dao.elasticsearch_client.ping()

    def create(self, data: JobClusterDefinition):
        resp = self.es_dao.create(data, ESIdentifier(data.job_cluster_definition_id))
        return resp
