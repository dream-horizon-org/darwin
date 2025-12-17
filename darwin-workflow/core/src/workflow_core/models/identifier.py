"""Identifier model to replace mlp_commons.models.identifier"""
from abc import ABC, abstractmethod


class Identifier(ABC):
    """Base class for identifiers"""
    
    @abstractmethod
    def get_unique_id(self) -> str:
        """Get the unique identifier"""
        pass

