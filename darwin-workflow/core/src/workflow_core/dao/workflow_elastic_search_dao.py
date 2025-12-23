from __future__ import annotations

import logging
import types
import typing as t
from typing import Optional
from typing import TypeVar

from elasticsearch import Elasticsearch
from workflow_core.models.generic_dao import Dao
from workflow_core.models.dao_response import DaoResponse
from workflow_core.models.identifier import Identifier
from workflow_model.meta_data import MetaData
from workflow_core.models.search_query import SearchQuery
from workflow_core.utils.utils import map_optional
from typeguard import typechecked

D = TypeVar('D', bound=MetaData)
Q = TypeVar('Q', bound=SearchQuery)
I = TypeVar('I', bound=Identifier)
Response = DaoResponse[D]
es_logger = logging.getLogger("elasticsearch")
es_logger.setLevel(logging.WARNING)

@typechecked
class WorklfowElasticSearchDao(Dao[D, I]):
    """Elasticsearch Implementation for the DAO"""
    elasticsearch_client: Elasticsearch
    index: str
    parser_func: types.FunctionType = None  # Parser function to convert a dictionary to the Entity D

    def __init__(self, db_path: str, index: str, parser_func: types.FunctionType, user: Optional[str] = "",
                 password: Optional[str] = ""):
        self.elasticsearch_client = Elasticsearch(
            db_path, 
            http_auth=(user, password),
            timeout=5,  # 5 second timeout for all operations
            max_retries=1,  # Only retry once
            retry_on_timeout=False  # Don't retry on timeout to fail fast
        )
        self.index = index
        if parser_func is None or not isinstance(parser_func, types.FunctionType):
            raise ValueError("Invalid `parser_func` found")
        self.parser_func = parser_func

    def create_indice(self, mapping: dict) -> Response:
        try:
            return DaoResponse.success_response(
                self.elasticsearch_client.indices.create(index=self.index, body=mapping))
        except Exception as e:
            return DaoResponse.error_response('CREATE_MAPPING', str(e))

    def create(self, data: D, identifier: t.Optional[I] = None) -> Response:
        try:
            id = map_optional(identifier, lambda i: i.get_unique_id())
            res = self.elasticsearch_client.index(index=self.index, body=data.to_dict(), id=id, refresh='true')
            return DaoResponse.success_response_with_message('CREATE', data, res['_id'])
        except Exception as e:
            return DaoResponse.error_response('CREATE', str(e))

    def read(self, identifier: I) -> Response:
        try:
            resp = self.elasticsearch_client.get(index=self.index, id=identifier.get_unique_id())
            result = self.parser_func(resp["_source"])
            return DaoResponse.success_response_with_message('READ', result, identifier)
        except Exception as e:
            return DaoResponse.error_response('READ', str(e))

    def update(self, data: D, identifier: I) -> Response:
        try:
            res = self.elasticsearch_client.index(index=self.index, body=data.to_dict(), refresh='true',
                                                  id=identifier.get_unique_id())
            return DaoResponse.success_response_with_message('UPDATE', data, res['_id'])
        except Exception as e:
            return DaoResponse.error_response('UPDATE', str(e))

    def delete(self, identifier: I) -> Response:
        try:
            res = self.elasticsearch_client.delete(index=self.index, id=identifier.get_unique_id())
            return DaoResponse.success_response('DELETE', res['_id'])
        except Exception as e:
            return DaoResponse.error_response('DELETE', str(e))

    def search(self, query: Q) -> Response:
        try:
            res = self.elasticsearch_client.search(index=self.index, body=query.get_query())
            return DaoResponse.success_response_with_message('SEARCH', [self.parser_func(x["_source"]) for x in
                                                                        res["hits"]["hits"]], query)
        except Exception as e:
            return DaoResponse.error_response('SEARCH', str(e))

    def aggregation_search(self, query: Q) -> Response:
        try:
            res = self.elasticsearch_client.search(index=self.index, body=query.get_query())
            return DaoResponse.success_response_with_message('SEARCH', res, query)
        except Exception as e:
            return DaoResponse.error_response('SEARCH', str(e))
