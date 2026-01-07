"""
Native TensorFlow/Keras model loader.

This loader directly loads TensorFlow models using tf.keras.models.load_model()
or tf.saved_model.load(), bypassing the MLflow pyfunc wrapper for better performance.

MLflow tensorflow artifact structure:
    model/
    ├── MLmodel             # YAML with flavor info and signature
    ├── data/
    │   └── model/          # SavedModel directory
    │       ├── saved_model.pb
    │       ├── variables/
    │       └── assets/
    ├── conda.yaml
    ├── requirements.txt
    └── input_example.json (optional)

For Keras models:
    model/
    ├── MLmodel
    ├── data/
    │   └── model.keras     # Keras native format (.keras)
    │   └── or model.h5     # Legacy HDF5 format
"""

import os
from typing import Optional

from .base_native_loader import BaseNativeLoader
from src.config.config import Config
from src.config.logger import logger
from src.model.predictable_model import TensorFlowModelWrapper


class TensorFlowNativeLoader(BaseNativeLoader):
    """
    Native loader for TensorFlow and Keras models.
    
    Loads models directly using TensorFlow's SavedModel format
    or Keras model loading APIs.
    
    Features:
    - Direct SavedModel loading (tf.saved_model.load)
    - Keras model loading (.keras, .h5)
    - Schema extraction from MLmodel file
    - TensorSpec expansion using input_example
    - Automatic signature detection from SavedModel
    - Returns TensorFlowModelWrapper for predictions
    """
    
    # Possible model locations
    KERAS_MODEL_PATHS = [
        "data/model.keras",
        "data/model.h5",
        "data/model",  # SavedModel format
        "model.keras",
        "model.h5",
        "model",
    ]
    
    def __init__(self, config: Config):
        """
        Initialize the TensorFlow native loader.
        
        Args:
            config: Application configuration with model path
        """
        super().__init__(config)
        self._model_format: str = "unknown"  # 'keras', 'savedmodel', 'h5'
        self._wrapper: Optional[TensorFlowModelWrapper] = None
        logger.info("TensorFlowNativeLoader initialized")
    
    def _find_model_path(self, base_path: str) -> str:
        """
        Find the TensorFlow/Keras model in the model directory.
        
        Returns:
            Path to the model file or directory
        """
        for rel_path in self.KERAS_MODEL_PATHS:
            full_path = os.path.join(base_path, rel_path)
            if os.path.exists(full_path):
                # Determine format
                if full_path.endswith('.keras'):
                    self._model_format = 'keras'
                elif full_path.endswith('.h5'):
                    self._model_format = 'h5'
                elif os.path.isdir(full_path):
                    # Check for saved_model.pb
                    if os.path.exists(os.path.join(full_path, "saved_model.pb")):
                        self._model_format = 'savedmodel'
                    else:
                        self._model_format = 'keras'
                return full_path
        
        raise FileNotFoundError(
            f"Could not find TensorFlow/Keras model in {base_path}. "
            f"Expected one of: {self.KERAS_MODEL_PATHS}"
        )
    
    def load_model(self) -> TensorFlowModelWrapper:
        """
        Load the TensorFlow/Keras model and return a wrapper.
        
        Attempts to load as Keras model first, falls back to SavedModel.
        
        Returns:
            TensorFlowModelWrapper that handles predictions
        """
        import tensorflow as tf
        
        model_path = self.config.get_model_local_path
        if not model_path:
            raise ValueError("MODEL_LOCAL_PATH not set. Cannot load model natively.")
        
        model_file = self._find_model_path(model_path)
        logger.info(f"Loading TensorFlow model from: {model_file} (format: {self._model_format})")
        
        try:
            if self._model_format in ['keras', 'h5']:
                # Load as Keras model
                self._loaded_model = tf.keras.models.load_model(model_file, compile=False)
                logger.info("TensorFlow model loaded via keras.models.load_model()")
            else:
                # Load as SavedModel
                # First try Keras loading (works for most cases)
                try:
                    self._loaded_model = tf.keras.models.load_model(model_file, compile=False)
                    logger.info("SavedModel loaded via keras.models.load_model()")
                except Exception:
                    # Fall back to raw SavedModel
                    self._loaded_model = tf.saved_model.load(model_file)
                    logger.info("Model loaded via tf.saved_model.load()")
            
            logger.info("TensorFlow model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load TensorFlow model: {e}")
            raise
        
        # Create wrapper
        self._wrapper = TensorFlowModelWrapper(
            model=self._loaded_model,
            feature_order=self._feature_order,
        )
        
        logger.info(f"Created TensorFlowModelWrapper (features={len(self._feature_order) if self._feature_order else 0})")
        return self._wrapper
    
    def reload_model(self) -> TensorFlowModelWrapper:
        """Reload the TensorFlow model."""
        logger.info("Reloading TensorFlow model...")
        return self.load_model()


class KerasNativeLoader(TensorFlowNativeLoader):
    """
    Native loader for Keras models.
    
    This is an alias for TensorFlowNativeLoader since Keras is now
    part of TensorFlow. Provided for clarity when the model is
    explicitly logged as 'keras' flavor.
    """
    
    def __init__(self, config: Config):
        """Initialize the Keras native loader."""
        super().__init__(config)
        logger.info("KerasNativeLoader initialized (using TensorFlow backend)")
