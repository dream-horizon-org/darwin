"""
Native scikit-learn model loader.

This loader directly loads sklearn models using joblib/pickle,
bypassing the MLflow pyfunc wrapper for better performance.

MLflow sklearn artifact structure:
    model/
    ├── MLmodel          # YAML with flavor info and signature
    ├── model.pkl        # Serialized sklearn model (joblib)
    ├── conda.yaml       # Conda environment
    ├── requirements.txt # Pip requirements
    └── input_example.json (optional)
"""

import os
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd

from .base_native_loader import BaseNativeLoader
from src.config.config import Config
from src.config.logger import logger


class SklearnNativeLoader(BaseNativeLoader):
    """
    Native loader for scikit-learn models.
    
    Loads models directly using joblib.load() or pickle.load(),
    providing direct access to sklearn model objects.
    
    Features:
    - Direct model loading from model.pkl
    - Schema extraction from MLmodel file (no model load needed)
    - Native predict/predict_proba support
    - Handles both classifiers and regressors
    """
    
    # Default model filename used by MLflow sklearn flavor
    MODEL_FILENAME = "model.pkl"
    
    def __init__(self, config: Config):
        """
        Initialize the sklearn native loader.
        
        Args:
            config: Application configuration with model path
        """
        super().__init__(config)
        self._model_type: Optional[str] = None  # 'classifier' or 'regressor'
        logger.info("SklearnNativeLoader initialized")
    
    def _find_model_file(self, model_path: str) -> str:
        """
        Find the sklearn model file in the model directory.
        
        MLflow sklearn flavor typically saves as 'model.pkl'.
        
        Args:
            model_path: Path to the model directory
            
        Returns:
            Full path to the model file
            
        Raises:
            FileNotFoundError: If model file not found
        """
        # Try standard MLflow sklearn filename
        pkl_path = os.path.join(model_path, self.MODEL_FILENAME)
        if os.path.exists(pkl_path):
            return pkl_path
        
        # Try alternative names
        alternatives = ["model.joblib", "model.pickle", "sklearn_model.pkl"]
        for alt in alternatives:
            alt_path = os.path.join(model_path, alt)
            if os.path.exists(alt_path):
                return alt_path
        
        raise FileNotFoundError(
            f"Could not find sklearn model file in {model_path}. "
            f"Expected: {self.MODEL_FILENAME}"
        )
    
    def load_model(self) -> Any:
        """
        Load the sklearn model using joblib.
        
        Returns:
            Loaded sklearn model (estimator)
        """
        import joblib
        
        model_path = self.config.get_model_local_path
        if not model_path:
            raise ValueError("MODEL_LOCAL_PATH not set. Cannot load model natively.")
        
        model_file = self._find_model_file(model_path)
        logger.info(f"Loading sklearn model from: {model_file}")
        
        self._loaded_model = joblib.load(model_file)
        
        # Detect model type (classifier vs regressor)
        if hasattr(self._loaded_model, 'predict_proba'):
            self._model_type = 'classifier'
        elif hasattr(self._loaded_model, 'predict'):
            self._model_type = 'regressor'
        else:
            self._model_type = 'unknown'
        
        logger.info(f"Sklearn model loaded successfully (type: {self._model_type})")
        return self._loaded_model
    
    def reload_model(self) -> Any:
        """
        Reload the sklearn model.
        
        Returns:
            Reloaded sklearn model
        """
        logger.info("Reloading sklearn model...")
        return self.load_model()
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction using the native sklearn model.
        
        For classifiers: returns both predicted class and probabilities.
        For regressors: returns predicted values.
        
        Args:
            input_data: Input data (dict, DataFrame, or numpy array)
            
        Returns:
            Dict with predictions:
            - For classifiers: {"predicted_class": [...], "probabilities": [[...]]}
            - For regressors: {"scores": [...]}
        """
        if self._loaded_model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Prepare input
        X = self._prepare_sklearn_input(input_data)
        
        try:
            # For classifiers, return both class and probabilities
            if self._model_type == 'classifier':
                # Get predicted class labels
                predicted_classes = self._loaded_model.predict(X)
                predicted_classes = predicted_classes.tolist() if hasattr(predicted_classes, 'tolist') else predicted_classes
                
                # Get probabilities if available
                if hasattr(self._loaded_model, 'predict_proba'):
                    probabilities = self._loaded_model.predict_proba(X)
                    probabilities = probabilities.tolist() if hasattr(probabilities, 'tolist') else probabilities
                    
                    return {
                        "predicted_class": predicted_classes,
                        "probabilities": probabilities
                    }
                else:
                    # Classifier without predict_proba (e.g., some linear models)
                    return {"predicted_class": predicted_classes}
            else:
                # Regressor - return predictions as scores
                predictions = self._loaded_model.predict(X)
                scores = predictions.tolist() if hasattr(predictions, 'tolist') else predictions
                return {"scores": scores}
            
        except Exception as e:
            logger.exception(f"Sklearn prediction failed: {e}")
            raise
    
    def _prepare_sklearn_input(self, input_data: Any) -> np.ndarray:
        """
        Prepare input data for sklearn prediction.
        
        Sklearn models typically expect numpy arrays or DataFrames.
        
        Args:
            input_data: Input in various formats
            
        Returns:
            numpy array or DataFrame ready for sklearn.predict()
        """
        # If we have feature order from schema, use it
        feature_order = self._feature_order
        
        if isinstance(input_data, pd.DataFrame):
            if feature_order:
                # Ensure columns are in expected order
                missing = set(feature_order) - set(input_data.columns)
                if missing:
                    raise ValueError(f"Missing features: {missing}")
                return input_data[feature_order].values
            return input_data.values
        
        elif isinstance(input_data, dict):
            if feature_order:
                # Convert dict to ordered array
                try:
                    values = [input_data[name] for name in feature_order]
                    return np.array([values])
                except KeyError as e:
                    raise ValueError(f"Missing required feature: {e}")
            else:
                # No feature order - use dict order
                return np.array([list(input_data.values())])
        
        elif isinstance(input_data, list):
            if input_data and isinstance(input_data[0], dict):
                # Batch of dicts
                if feature_order:
                    rows = [[d[name] for name in feature_order] for d in input_data]
                else:
                    rows = [list(d.values()) for d in input_data]
                return np.array(rows)
            else:
                return np.array(input_data)
        
        elif isinstance(input_data, np.ndarray):
            return input_data
        
        else:
            return np.array(input_data)
