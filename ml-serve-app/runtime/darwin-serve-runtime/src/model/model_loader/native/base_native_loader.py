"""
Base mixin class for native model loaders.

Provides shared functionality for:
- Schema extraction from MLmodel YAML files (via schema_utils)
- Input example loading
- TensorSpec schema expansion (for TensorFlow/PyTorch)
- Common prediction interface
"""

from typing import Any, Dict, List, Optional
from abc import ABC, abstractmethod

import numpy as np
import pandas as pd

from ..model_loader_interface import ModelLoaderInterface
from src.config.config import Config
from src.config.logger import logger
from src.utils.schema_utils import (
    load_schema_from_mlmodel,
    is_tensor_spec_schema,
    expand_tensor_schema,
)


class NativeLoaderMixin:
    """
    Mixin providing shared schema loading logic for native model loaders.
    
    All native loaders should inherit from this mixin to get consistent
    schema extraction from MLmodel files without loading the model.
    
    Uses shared utility functions from src.utils.schema_utils.
    """
    
    def __init__(self):
        """Initialize schema-related attributes."""
        self._file_schema: Optional[Dict[str, Any]] = None
        self._feature_order: Optional[List[str]] = None
        self._is_tensor_spec_flag: bool = False
    
    def _prepare_input_for_prediction(
        self, 
        input_data: Any, 
        feature_order: Optional[List[str]] = None
    ) -> np.ndarray:
        """
        Convert input data to numpy array suitable for native model prediction.
        
        Handles:
        - Dict → ordered numpy array (using feature_order)
        - DataFrame → numpy array
        - List of dicts → batch numpy array
        - Already numpy array → pass through
        
        Args:
            input_data: Input data in various formats
            feature_order: Optional list of feature names for ordering dict inputs
            
        Returns:
            numpy array suitable for model.predict()
        """
        if feature_order is None:
            feature_order = self._feature_order
        
        if isinstance(input_data, pd.DataFrame):
            if feature_order:
                # Reorder columns to match expected order
                input_data = input_data[feature_order]
            return input_data.values.astype(np.float64)
        
        elif isinstance(input_data, dict):
            if feature_order:
                ordered_values = [input_data[name] for name in feature_order]
                return np.array([ordered_values], dtype=np.float64)
            else:
                # No feature order - return values in dict order
                return np.array([list(input_data.values())], dtype=np.float64)
        
        elif isinstance(input_data, list):
            if input_data and isinstance(input_data[0], dict):
                # Batch of dicts
                if feature_order:
                    rows = [[d[name] for name in feature_order] for d in input_data]
                else:
                    rows = [list(d.values()) for d in input_data]
                return np.array(rows, dtype=np.float64)
            else:
                # Already a list of values
                return np.array(input_data, dtype=np.float64)
        
        elif isinstance(input_data, np.ndarray):
            return input_data.astype(np.float64)
        
        else:
            # Try to convert to numpy array
            return np.array(input_data, dtype=np.float64)


class BaseNativeLoader(NativeLoaderMixin, ModelLoaderInterface, ABC):
    """
    Abstract base class for all native model loaders.
    
    Combines the NativeLoaderMixin (schema loading) with ModelLoaderInterface
    and provides common initialization logic.
    """
    
    def __init__(self, config: Config):
        """
        Initialize the native loader.
        
        Args:
            config: Application configuration with model path
        """
        ModelLoaderInterface.__init__(self)
        NativeLoaderMixin.__init__(self)
        
        self.config = config
        self._loaded_model: Any = None
        
        # Pre-load schema from MLmodel file if local path available
        model_path = self.config.get_model_local_path
        if model_path:
            logger.info(f"Pre-loading schema from local model path: {model_path}")
            self._file_schema = load_schema_from_mlmodel(model_path)
            if self._file_schema:
                logger.info("Schema pre-loaded from MLmodel file")
                # Extract feature order from inputs (for ColSpec schemas)
                inputs = self._file_schema.get("inputs", [])
                if inputs and isinstance(inputs, list):
                    # Extract feature names from ColSpec inputs
                    self._feature_order = [col.get("name") for col in inputs if col.get("name")]
                    if self._feature_order:
                        logger.debug(f"Feature order from schema: {self._feature_order}")
            else:
                logger.debug("No schema found in MLmodel file")
    
    @abstractmethod
    def load_model(self) -> Any:
        """Load the model using native library. Must be implemented by subclasses."""
        pass
    
    @abstractmethod
    def reload_model(self) -> Any:
        """Reload the model. Must be implemented by subclasses."""
        pass
    
    @abstractmethod
    def predict(self, input_data: Any) -> Any:
        """
        Make prediction using the native model.
        
        Args:
            input_data: Input data (dict, DataFrame, or numpy array)
            
        Returns:
            Prediction result as dict with 'scores' key
        """
        pass
    
    @property
    def model(self) -> Any:
        """Get the loaded model."""
        return self._loaded_model
    
    def has_native_predict(self) -> bool:
        """Native loaders always have native predict implementation."""
        return True
    
    def has_signature(self) -> bool:
        """Check if the model has a signature (from file)."""
        if self._file_schema is not None:
            return bool(self._file_schema.get("inputs"))
        return False
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """
        Get the input schema from MLmodel file.
        
        For TensorSpec schemas, expands tensor name to individual feature names
        using the input_example if available.
        """
        if self._file_schema is None:
            return []
        
        inputs = self._file_schema.get("inputs", [])
        input_example = self._file_schema.get("input_example")
        
        # Check if this is a TensorSpec schema that should be expanded
        if inputs and input_example:
            if is_tensor_spec_schema(inputs):
                columns, feature_order = expand_tensor_schema(input_example)
                self._feature_order = feature_order
                self._is_tensor_spec_flag = True
                return columns
        
        return inputs
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """Get the output schema from MLmodel file."""
        if self._file_schema is None:
            return []
        return self._file_schema.get("outputs", [])
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """Get the input example from MLmodel file."""
        if self._file_schema is None:
            return None
        return self._file_schema.get("input_example")
    
    def get_feature_order(self) -> Optional[List[str]]:
        """Get the ordered list of feature names for TensorSpec models."""
        # Trigger schema processing if not done
        if self._feature_order is None and self._file_schema is not None:
            self.get_input_schema()
        return self._feature_order
    
    def is_tensor_spec(self) -> bool:
        """Check if the model uses TensorSpec signature."""
        # Trigger schema processing if not done
        if not self._is_tensor_spec_flag and self._file_schema is not None:
            self.get_input_schema()
        return self._is_tensor_spec_flag
    
    def get_full_schema(self) -> Dict[str, Any]:
        """Get the complete schema information."""
        return {
            "inputs": self.get_input_schema(),
            "outputs": self.get_output_schema(),
            "input_example": self.get_input_example(),
        }

