"""
MLflow PyFunc Model Loader.

This loader uses MLflow's pyfunc interface to load models, providing a unified
API for all MLflow-supported model flavors. It handles schema extraction from
both the MLmodel file and the loaded model.
"""

import os
from typing import Any, Dict, List, Optional

import mlflow

from .model_loader_interface import ModelLoaderInterface
from src.config.config import Config
from src.config.logger import logger
from src.schema.schema_extractor import SchemaExtractor
from src.utils.schema_utils import (
    load_schema_from_mlmodel,
    is_tensor_spec_schema,
    expand_tensor_schema,
)


class MLFlowPyfuncLoader(ModelLoaderInterface):
    """
    Model loader that uses MLflow pyfunc.load_model() for all model flavors.
    
    This provides a unified interface for loading any MLflow-supported model type
    including sklearn, XGBoost, LightGBM, CatBoost, PyTorch, TensorFlow, etc.
    
    Features:
    - Pre-loads schema from MLmodel file without loading the model
    - Supports both local paths and remote MLflow URIs
    - Extracts input examples and signatures for API discovery
    """
    
    def __init__(self, config: Config):
        """
        Initialize the loader with configuration.
        
        Args:
            config: Application configuration with model URI/path and MLflow settings
        """
        super().__init__()
        self.mlflow = mlflow
        self.config = config
        self._loaded_model: Any = None
        self._schema_extractor: Optional[SchemaExtractor] = None
        self._file_schema: Optional[Dict[str, Any]] = None
        self._feature_order: Optional[List[str]] = None  # For TensorSpec models
        self._is_tensor_spec_flag: bool = False  # Flag for TensorSpec detection
        
        # Configure MLflow tracking
        if self.config.get_mlflow_tracking_username:
            os.environ["MLFLOW_TRACKING_USERNAME"] = self.config.get_mlflow_tracking_username
        
        if self.config.get_mlflow_tracking_password:
            os.environ["MLFLOW_TRACKING_PASSWORD"] = self.config.get_mlflow_tracking_password
        
        if self.config.get_mlflow_tracking_uri:
            mlflow.set_tracking_uri(uri=self.config.get_mlflow_tracking_uri)
        
        # Pre-load schema from MLmodel file if local path available
        if self.config.get_model_local_path:
            logger.info(f"Pre-loading schema from local model path: {self.config.get_model_local_path}")
            self._file_schema = load_schema_from_mlmodel(self.config.get_model_local_path)
            if self._file_schema:
                logger.info("Schema pre-loaded from MLmodel file (no model deserialization needed)")
            else:
                logger.debug("No schema found in MLmodel file, will extract on model load")
    
    def load_model(self) -> Any:
        """
        Load the MLflow model using pyfunc.load_model().
        
        Prefers local path if available (from init container pre-download),
        otherwise uses the configured MLflow model URI.
        
        Returns:
            Loaded MLflow pyfunc model
        """
        model_uri = self.config.get_model_local_path or self.config.get_model_uri
        logger.info(f"Loading MLflow model from: {model_uri}")
        self._loaded_model = self.mlflow.pyfunc.load_model(model_uri=model_uri)
        logger.info("Model loaded successfully, initializing schema extractor")
        self._schema_extractor = SchemaExtractor(self._loaded_model)
        return self._loaded_model

    def reload_model(self) -> Any:
        """
        Reload the MLflow model (e.g., after model update).
        
        Returns:
            Reloaded MLflow pyfunc model
        """
        model_uri = self.config.get_model_local_path or self.config.get_model_uri
        logger.info(f"Reloading MLflow model from: {model_uri}")
        self._loaded_model = self.mlflow.pyfunc.load_model(model_uri=model_uri)
        self._schema_extractor = SchemaExtractor(self._loaded_model)
        return self._loaded_model
    
    @property
    def schema_extractor(self) -> Optional[SchemaExtractor]:
        """Get the schema extractor for the loaded model."""
        return self._schema_extractor
    
    def has_signature(self) -> bool:
        """Check if the model has a signature (from file or loaded model)."""
        if self._file_schema is not None:
            return bool(self._file_schema.get("inputs"))
        if self._schema_extractor is None:
            return False
        return self._schema_extractor.has_signature
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """Get the input schema (from file or loaded model).
        
        For TensorSpec schemas, expands tensor name to individual feature names
        using the input_example if available.
        """
        if self._file_schema is not None:
            inputs = self._file_schema.get("inputs", [])
            input_example = self._file_schema.get("input_example")
            
            # Check if this is a TensorSpec schema that should be expanded
            if inputs and input_example:
                if is_tensor_spec_schema(inputs):
                    # Expand TensorSpec to individual feature names from input_example
                    columns, feature_order = expand_tensor_schema(input_example)
                    self._feature_order = feature_order
                    self._is_tensor_spec_flag = True
                    return columns
            
            return inputs
        if self._schema_extractor is None:
            return []
        return self._schema_extractor.get_input_schema()
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """Get the output schema (from file or loaded model)."""
        if self._file_schema is not None:
            return self._file_schema.get("outputs", [])
        if self._schema_extractor is None:
            return []
        return self._schema_extractor.get_output_schema()
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """Get the input example (from file or loaded model)."""
        if self._file_schema is not None:
            return self._file_schema.get("input_example")
        if self._schema_extractor is None:
            return None
        return self._schema_extractor.get_input_example()
    
    def get_feature_order(self) -> Optional[List[str]]:
        """
        Get the ordered list of feature names for TensorSpec models.
        
        This is used to convert feature dictionaries to ordered arrays
        for models that expect tensor input (like TensorFlow).
        
        Returns:
            List of feature names in order, or None if not available
        """
        # Check if we have feature order from file-based schema
        if hasattr(self, '_feature_order') and self._feature_order:
            return self._feature_order
        
        # Trigger schema loading to populate _feature_order if file-based
        if self._file_schema is not None:
            self.get_input_schema()  # This populates _feature_order for TensorSpec
            if hasattr(self, '_feature_order') and self._feature_order:
                return self._feature_order
        
        if self._schema_extractor is None:
            return None
        return self._schema_extractor.get_feature_order()
    
    def is_tensor_spec(self) -> bool:
        """Check if the model uses TensorSpec signature."""
        # Check if we detected TensorSpec from file-based schema
        if hasattr(self, '_is_tensor_spec_flag') and self._is_tensor_spec_flag:
            return True
        
        # Trigger schema loading to check for TensorSpec if file-based
        if self._file_schema is not None:
            self.get_input_schema()  # This sets _is_tensor_spec_flag for TensorSpec
            if hasattr(self, '_is_tensor_spec_flag') and self._is_tensor_spec_flag:
                return True
        
        if self._schema_extractor is None:
            return False
        return self._schema_extractor.is_tensor_spec
    
    def get_full_schema(self) -> Dict[str, Any]:
        """Get the complete schema information (from file or loaded model).
        
        For TensorSpec schemas, the inputs are expanded to individual feature names.
        """
        if self._file_schema is not None:
            # Use get_input_schema() which expands TensorSpec to feature names
            return {
                "inputs": self.get_input_schema(),
                "outputs": self.get_output_schema(),
                "input_example": self.get_input_example(),
            }
        if self._schema_extractor is None:
            return {"inputs": [], "outputs": [], "input_example": None}
        return self._schema_extractor.get_full_schema()

