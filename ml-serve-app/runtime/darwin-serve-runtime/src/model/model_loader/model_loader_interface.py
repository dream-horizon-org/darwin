from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class ModelLoaderInterface(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def load_model(self) -> Any:
        """Load and return the model."""
        pass

    @abstractmethod
    def reload_model(self) -> Any:
        """Reload and return the model."""
        pass
    
    def has_signature(self) -> bool:
        """Check if the loaded model has a signature."""
        return False
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """Get the input schema of the loaded model."""
        return []
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """Get the output schema of the loaded model."""
        return []
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """Get the input example if available."""
        return None
    
    def get_full_schema(self) -> Dict[str, Any]:
        """Get the complete schema information."""
        return {"inputs": [], "outputs": [], "input_example": None}
