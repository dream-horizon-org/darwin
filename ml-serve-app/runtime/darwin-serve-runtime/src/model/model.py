from typing import Any, Dict, List, Optional, Tuple

from .model_loader.model_loader_interface import ModelLoaderInterface
from .predictable_model import PredictableModel
from src.config.logger import logger
from src.schema.schema_validator import SchemaValidator


class Model:
    def __init__(self, model_loader: ModelLoaderInterface):
        self._model_loader: ModelLoaderInterface = model_loader
        self._predictable: Optional[PredictableModel] = None
        self._validator: Optional[SchemaValidator] = None

    def _ensure_model_loaded(self) -> None:
        if self._predictable is None:
            self._predictable = self._model_loader.load_model()
            logger.info("Model loaded successfully")
            if self.has_signature():
                input_schema = self._model_loader.get_input_schema()
                self._validator = SchemaValidator(input_schema)

    def has_signature(self) -> bool:
        """
        Check if the model has a signature available from the MLmodel file.
        """
        return self._model_loader.has_signature()
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """
        Get the input schema from the MLmodel file.
        """
        return self._model_loader.get_input_schema()
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """
        Get the output schema from the MLmodel file.
        """
        return self._model_loader.get_output_schema()
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """
        Get the input example from the MLmodel file.
        """
        return self._model_loader.get_input_example()
    
    def get_full_schema(self) -> Dict[str, Any]:
        """
        Get the complete schema from the MLmodel file.
        """
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
        return self._predictable.predict(input_data)

    @property
    def model(self) -> Optional[PredictableModel]:
        """Get the loaded predictable model wrapper."""
        return self._predictable
    
    @property
    def raw_model(self) -> Any:
        """Get the underlying raw model from the wrapper."""
        if self._predictable is None:
            return None
        return getattr(self._predictable, 'raw_model', self._predictable)
