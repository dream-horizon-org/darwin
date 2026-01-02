from opentelemetry.instrumentation.elasticsearch import ElasticsearchInstrumentor
from elasticsearch.client import Elasticsearch
from loguru import logger

from compute_core.constant.config import Config
from compute_core.dto.request.es_compute_cluster_definition import ESComputeDefinition
from compute_core.dto.request.es_query_entity import ESSearchQuery


class ESDao:
    elasticsearch_client: Elasticsearch
    index: str
    parser_func: callable  # Parser function to convert a dictionary to the Object

    # TODO: ElasticsearchInstrumentor().instrument() is called on every instantiation - should be called once at startup
    def __init__(self, env: str = None):
        ElasticsearchInstrumentor().instrument()
        config = Config(env).es_config()
        # TODO: Consider adding connection pooling and retry configuration for ES client
        self.elasticsearch_client = Elasticsearch(
            config.get("host"), http_auth=(config.get("username", ""), config.get("password", ""))
        )
        self.index = config.get("index")
        self.parser_func = lambda x: ESComputeDefinition.from_dict(x)

    def healthcheck(self):
        return self.elasticsearch_client.ping()

    # TODO: Add proper error handling and logging for ES query failures
    # TODO: aggregation query  response
    def aggregation_search(self, query: dict):
        query = ESSearchQuery(query)
        res = self.elasticsearch_client.search(index=self.index, body=query.get_query())
        return res

    def search(self, query: dict):
        query = ESSearchQuery(query)
        res = self.elasticsearch_client.search(index=self.index, body=query.get_query())
        data = [self.parser_func(x["_source"]) for x in res["hits"]["hits"]]
        return data

    def create(self, id: str, data: ESComputeDefinition):
        res = self.elasticsearch_client.index(index=self.index, body=data.to_dict(), id=id)
        logger.debug(f"Created ES data with id: {res['_id']}")
        return data

    def read(self, id: str) -> ESComputeDefinition:
        resp = self.elasticsearch_client.get(index=self.index, id=id)
        result = self.parser_func(resp["_source"])
        return result

    def update(self, id: str, data: ESComputeDefinition):
        res = self.elasticsearch_client.index(index=self.index, body=data.to_dict(), id=id, refresh=True)
        logger.debug(f"Updated ES data with id: {res['_id']}")
        return data

    def delete(self, id: str):
        res = self.elasticsearch_client.delete(index=self.index, id=id)
        return res["_id"]

    def create_indices_mapping(self, mapping: dict):
        res = self.elasticsearch_client.indices.create(index=self.index, body=mapping)
        return res
