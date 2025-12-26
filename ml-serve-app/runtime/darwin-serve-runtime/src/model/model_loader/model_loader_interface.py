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
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction using the loaded model.
        
        Native loaders implement this directly using framework-specific APIs.
        Pyfunc loaders may not implement this (return None to signal use model.predict).
        
        Args:
            input_data: Input data (dict, DataFrame, or numpy array)
            
        Returns:
            Dict with 'scores' key containing predictions, or None if not implemented
        """
        return None  # Signal to use model.predict() instead
    
    def has_native_predict(self) -> bool:
        """
        Check if this loader has a native predict implementation.
        
        Returns:
            True if predict() should be used, False to use model.predict()
        """
        return False
    
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
