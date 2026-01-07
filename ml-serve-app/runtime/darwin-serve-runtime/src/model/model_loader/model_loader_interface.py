from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.model.predictable_model import PredictableModel


class ModelLoaderInterface(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def load_model(self) -> "PredictableModel":
        """Load and return a predictable model wrapper."""
        pass

    @abstractmethod
    def reload_model(self) -> "PredictableModel":
        """Reload and return a predictable model wrapper."""
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
