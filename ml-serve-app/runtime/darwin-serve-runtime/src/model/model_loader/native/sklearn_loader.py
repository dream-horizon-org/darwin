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
from typing import Optional

from .base_native_loader import BaseNativeLoader
from src.config.config import Config
from src.config.logger import logger
from src.model.predictable_model import SklearnModelWrapper


class SklearnNativeLoader(BaseNativeLoader):
    """
    Native loader for scikit-learn models.
    
    Loads models directly using joblib.load() or pickle.load(),
    providing direct access to sklearn model objects.
    
    Features:
    - Direct model loading from model.pkl
    - Schema extraction from MLmodel file (no model load needed)
    - Returns SklearnModelWrapper for predictions
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
        self._wrapper: Optional[SklearnModelWrapper] = None
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
    
    def load_model(self) -> SklearnModelWrapper:
        """
        Load the sklearn model and return a wrapper.
        
        Returns:
            SklearnModelWrapper that handles predictions
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
        
        # Create wrapper
        self._wrapper = SklearnModelWrapper(
            model=self._loaded_model,
            feature_order=self._feature_order,
            model_type=self._model_type,
        )
        
        logger.info(f"Created SklearnModelWrapper (type={self._model_type}, features={len(self._feature_order) if self._feature_order else 0})")
        return self._wrapper
    
    def reload_model(self) -> SklearnModelWrapper:
        """
        Reload the sklearn model.
        
        Returns:
            SklearnModelWrapper that handles predictions
        """
        logger.info("Reloading sklearn model...")
        return self.load_model()
