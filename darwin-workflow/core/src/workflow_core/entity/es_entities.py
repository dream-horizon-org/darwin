import json
from dataclasses import dataclass

from workflow_core.models.identifier import Identifier
from workflow_core.models.search_query import SearchQuery


@dataclass
class ESSearchQuery(SearchQuery):
    query: dict

    def get_query(self) -> any:
        return json.loads(json.dumps(self.query))


@dataclass
class ESIdentifier(Identifier):
    id: str

    def get_unique_id(self) -> str:
        return self.id
