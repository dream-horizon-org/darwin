"""Mock SearchQuery for local development"""
from typing import Any, Dict, List, Optional


class SearchQuery:
    """Mock SearchQuery for database queries"""
    
    def __init__(
        self,
        filters: Optional[Dict[str, Any]] = None,
        sort: Optional[List[str]] = None,
        limit: int = 100,
        offset: int = 0,
        **kwargs
    ):
        self.filters = filters or {}
        self.sort = sort or []
        self.limit = limit
        self.offset = offset
        self.metadata = kwargs
        
    def add_filter(self, key: str, value: Any):
        """Add a filter"""
        self.filters[key] = value
        return self
    
    def add_sort(self, field: str, order: str = "asc"):
        """Add sort field"""
        self.sort.append(f"{field}:{order}")
        return self
    
    def set_limit(self, limit: int):
        """Set limit"""
        self.limit = limit
        return self
    
    def set_offset(self, offset: int):
        """Set offset"""
        self.offset = offset
        return self
    
    def get_filters(self) -> Dict[str, Any]:
        """Get filters"""
        return self.filters
    
    def get_sort(self) -> List[str]:
        """Get sort"""
        return self.sort
    
    def get_limit(self) -> int:
        """Get limit"""
        return self.limit
    
    def get_offset(self) -> int:
        """Get offset"""
        return self.offset
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "filters": self.filters,
            "sort": self.sort,
            "limit": self.limit,
            "offset": self.offset,
            **self.metadata
        }
    
    def __repr__(self):
        return f"SearchQuery(filters={self.filters}, limit={self.limit}, offset={self.offset})"







