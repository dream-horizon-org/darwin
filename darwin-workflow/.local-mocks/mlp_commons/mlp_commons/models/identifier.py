"""Mock Identifier for local development"""
from typing import Optional


class Identifier:
    """Mock Identifier for entity identification"""
    
    def __init__(self, id: str = None, name: str = None, version: str = None, **kwargs):
        self.id = id
        self.name = name
        self.version = version
        self.metadata = kwargs
        
    def get_id(self) -> Optional[str]:
        """Get identifier"""
        return self.id
    
    def get_name(self) -> Optional[str]:
        """Get name"""
        return self.name
    
    def get_version(self) -> Optional[str]:
        """Get version"""
        return self.version
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            **self.metadata
        }
    
    def __repr__(self):
        return f"Identifier(id={self.id}, name={self.name}, version={self.version})"
    
    def __str__(self):
        return self.id or self.name or "unknown"







