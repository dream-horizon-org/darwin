from typing import Any, Dict, List, Optional, Tuple
from .model_loader.model_loader_interface import ModelLoaderInterface
from src.schema.schema_validator import SchemaValidator


class Model:
    def __init__(self, model_loader: ModelLoaderInterface):
        self._model_loader: ModelLoaderInterface = model_loader
        self.model: Any | None = None
        self._validator: Optional[SchemaValidator] = None

    def _ensure_model_loaded(self) -> None:
        if self.model is None:
            self.model = self._model_loader.load_model()
            # Initialize validator if schema is available
            if self.has_signature():
                input_schema = self._model_loader.get_input_schema()
                self._validator = SchemaValidator(input_schema)

    def has_signature(self) -> bool:
        """Check if the model has a signature."""
        self._ensure_model_loaded()
        return self._model_loader.has_signature()
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """Get the input schema of the model."""
        self._ensure_model_loaded()
        return self._model_loader.get_input_schema()
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """Get the output schema of the model."""
        self._ensure_model_loaded()
        return self._model_loader.get_output_schema()
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """Get the input example if available."""
        self._ensure_model_loaded()
        return self._model_loader.get_input_example()
    
    def get_full_schema(self) -> Dict[str, Any]:
        """Get the complete schema information."""
        self._ensure_model_loaded()
        return self._model_loader.get_full_schema()
    
    def validate_features(self, features: Dict[str, Any]) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Validate features against the model schema.
        
        Args:
            features: Dictionary of feature names to values
            
        Returns:
            Tuple of (is_valid, list of error dicts)
        """
        self._ensure_model_loaded()
        
        if self._validator is None:
            # No schema available, validation passes
            return True, []
        
        is_valid, errors = self._validator.validate(features)
        return is_valid, [e.to_dict() for e in errors]

    async def predict(self, input_data: Any) -> Any:
        self._ensure_model_loaded()
        return await self.inference(input_data)

    async def inference(
        self,
        input_data: Any,
    ) -> dict:
        """
        Inference for a model with features provided as a dictionary.

        Args:
          input_data: Dictionary of feature names to values, or list of lists.

        Returns:
          {
            "scores": List[float] or single prediction value
          }
        """
        self._ensure_model_loaded()
        prediction = self.model.predict(input_data)
        # Ensure JSON-serializable response
        try:
            scores = prediction.tolist()
        except AttributeError:
            scores = prediction
        return {"scores": scores}




