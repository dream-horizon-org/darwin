"""SearchQuery model to replace mlp_commons.models.search_query"""
from abc import ABC, abstractmethod


class SearchQuery(ABC):
    """Base class for search queries"""
    
    @abstractmethod
    def get_query(self):
        """Get the query object"""
        pass

