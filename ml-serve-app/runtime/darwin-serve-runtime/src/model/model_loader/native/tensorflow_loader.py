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
from typing import Any, Dict

import numpy as np
import pandas as pd

from .base_native_loader import BaseNativeLoader
from src.config.config import Config
from src.config.logger import logger


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
    - CPU/GPU device management
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
    
    def load_model(self) -> Any:
        """
        Load the TensorFlow/Keras model.
        
        Attempts to load as Keras model first, falls back to SavedModel.
        
        Returns:
            Loaded TensorFlow/Keras model
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
            return self._loaded_model
            
        except Exception as e:
            logger.error(f"Failed to load TensorFlow model: {e}")
            raise
    
    def reload_model(self) -> Any:
        """Reload the TensorFlow model."""
        logger.info("Reloading TensorFlow model...")
        return self.load_model()
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction using the native TensorFlow model.
        
        Handles both Keras models (with .predict()) and SavedModels
        (with __call__() or signature-based calling).
        
        Args:
            input_data: Input data (dict, DataFrame, or numpy array)
            
        Returns:
            Dict with 'scores' key containing predictions
        """
        import tensorflow as tf
        
        if self._loaded_model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Prepare input as numpy array
        X = self._prepare_input_for_prediction(input_data, self._feature_order)
        
        try:
            # Convert to TensorFlow tensor
            tensor_input = tf.convert_to_tensor(X, dtype=tf.float32)
            
            # Make prediction
            if hasattr(self._loaded_model, 'predict'):
                # Keras model with .predict()
                predictions = self._loaded_model.predict(tensor_input, verbose=0)
            elif hasattr(self._loaded_model, '__call__'):
                # Callable model (SavedModel or functional)
                predictions = self._loaded_model(tensor_input)
                if isinstance(predictions, tf.Tensor):
                    predictions = predictions.numpy()
            elif hasattr(self._loaded_model, 'signatures'):
                # SavedModel with signatures
                serving_fn = self._loaded_model.signatures.get('serving_default')
                if serving_fn:
                    result = serving_fn(tensor_input)
                    # Get the output tensor (might have various keys)
                    if isinstance(result, dict):
                        output_key = list(result.keys())[0]
                        predictions = result[output_key].numpy()
                    else:
                        predictions = result.numpy()
                else:
                    raise RuntimeError("SavedModel has no serving_default signature")
            else:
                raise RuntimeError(
                    f"Model type {type(self._loaded_model)} not supported for prediction"
                )
            
            # Convert to list
            if hasattr(predictions, 'tolist'):
                scores = predictions.tolist()
            else:
                scores = predictions
            
            # Flatten nested lists for single predictions
            if isinstance(scores, list):
                # Handle [[value]] -> [value]
                if len(scores) == 1 and isinstance(scores[0], list):
                    if len(scores[0]) == 1:
                        scores = [scores[0][0]]
            
            return {"scores": scores}
            
        except Exception as e:
            logger.exception(f"TensorFlow prediction failed: {e}")
            raise


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
