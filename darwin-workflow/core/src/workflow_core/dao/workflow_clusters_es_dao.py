from workflow_core.constants.configs import Config
from workflow_core.constants.constants import WORKFLOW_CLUSTERS_INDEX
from workflow_core.entity.es_entities import ESIdentifier
from workflow_core.dao.workflow_elastic_search_dao import WorklfowElasticSearchDao
from workflow_model.workflow import WorkflowTaskCluster, WorkflowTaskClusterV2


class WorkflowClusterElasticSearchConnection:
    def __init__(self, env: str):
        self.env = env
        _config = Config(env)
        index = WORKFLOW_CLUSTERS_INDEX
        self.es_dao = WorklfowElasticSearchDao(*Config(env).es_config(index, lambda raw_dict: WorkflowTaskClusterV2(**raw_dict)))

    def health_elasticsearch(self):
        return self.es_dao.elasticsearch_client.ping()

    def create(self, data: WorkflowTaskCluster):
        resp = self.es_dao.create(data, ESIdentifier(data.workflow_cluster_id))
        return resp

    def update(self, data: WorkflowTaskCluster, ):
        resp = self.es_dao.update(data, ESIdentifier(data.workflow_cluster_id))
        return resp
