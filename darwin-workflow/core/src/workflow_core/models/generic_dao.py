"""Generic DAO interface to replace mlp_commons.dao.generic_dao"""
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional
from workflow_core.models.dao_response import DaoResponse
from workflow_core.models.identifier import Identifier
from workflow_core.models.search_query import SearchQuery
from workflow_model.meta_data import MetaData

D = TypeVar('D', bound=MetaData)
Q = TypeVar('Q', bound=SearchQuery)
I = TypeVar('I', bound=Identifier)


class Dao(ABC, Generic[D, I]):
    """Generic DAO interface"""
    
    @abstractmethod
    def create(self, data: D, identifier: Optional[I] = None) -> DaoResponse[D]:
        """Create a new entity"""
        pass
    
    @abstractmethod
    def read(self, identifier: I) -> DaoResponse[D]:
        """Read an entity by identifier"""
        pass
    
    @abstractmethod
    def update(self, data: D, identifier: I) -> DaoResponse[D]:
        """Update an entity"""
        pass
    
    @abstractmethod
    def delete(self, identifier: I) -> DaoResponse[D]:
        """Delete an entity"""
        pass
    
    @abstractmethod
    def search(self, query: Q) -> DaoResponse[list[D]]:
        """Search for entities"""
        pass

