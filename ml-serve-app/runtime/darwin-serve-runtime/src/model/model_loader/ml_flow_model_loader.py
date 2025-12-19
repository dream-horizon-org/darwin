import os
from typing import Any, Dict, List, Optional

import mlflow

from .model_loader_interface import ModelLoaderInterface
from src.config.config import Config
from src.schema.schema_extractor import SchemaExtractor


class MLFlowModelLoader(ModelLoaderInterface):
    def __init__(self, config: Config):
        # Initialize the model URI and MLflow configuration
        self.mlflow = mlflow
        self.config = config
        self._loaded_model: Any = None
        self._schema_extractor: Optional[SchemaExtractor] = None
        
        if self.config.get_mlflow_tracking_username:
            os.environ["MLFLOW_TRACKING_USERNAME"] = self.config.get_mlflow_tracking_username
        
        if self.config.get_mlflow_tracking_password:
            os.environ["MLFLOW_TRACKING_PASSWORD"] = self.config.get_mlflow_tracking_password
        
        if self.config.get_mlflow_tracking_uri:
            mlflow.set_tracking_uri(uri=self.config.get_mlflow_tracking_uri)

    def load_model(self):
        """Load the MLflow model from the specified URI."""
        self._loaded_model = self.mlflow.pyfunc.load_model(model_uri=self.config.get_model_uri)
        # Initialize schema extractor with the loaded model
        self._schema_extractor = SchemaExtractor(self._loaded_model)
        return self._loaded_model

    def reload_model(self):
        """Reload the MLflow model from the specified URI."""
        self._loaded_model = self.mlflow.pyfunc.load_model(model_uri=self.config.get_model_uri)
        # Re-initialize schema extractor
        self._schema_extractor = SchemaExtractor(self._loaded_model)
        return self._loaded_model
    
    @property
    def schema_extractor(self) -> Optional[SchemaExtractor]:
        """Get the schema extractor for the loaded model."""
        return self._schema_extractor
    
    def has_signature(self) -> bool:
        """Check if the loaded model has a signature."""
        if self._schema_extractor is None:
            return False
        return self._schema_extractor.has_signature
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """Get the input schema of the loaded model."""
        if self._schema_extractor is None:
            return []
        return self._schema_extractor.get_input_schema()
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """Get the output schema of the loaded model."""
        if self._schema_extractor is None:
            return []
        return self._schema_extractor.get_output_schema()
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """Get the input example if available."""
        if self._schema_extractor is None:
            return None
        return self._schema_extractor.get_input_example()
    
    def get_full_schema(self) -> Dict[str, Any]:
        """Get the complete schema information."""
        if self._schema_extractor is None:
            return {"inputs": [], "outputs": [], "input_example": None}
        return self._schema_extractor.get_full_schema()
