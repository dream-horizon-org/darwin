"""
Native boosting model loaders for XGBoost, LightGBM, and CatBoost.

These loaders directly load boosting models using their native APIs,
bypassing the MLflow pyfunc wrapper for better performance.

MLflow artifact structures:
    XGBoost:   model/model.xgb or model.json
    LightGBM:  model/model.lgb or model.txt
    CatBoost:  model/model.cb
"""

import os
from typing import Optional

from .base_native_loader import BaseNativeLoader
from src.config.config import Config
from src.config.logger import logger
from src.model.predictable_model import (
    XGBoostModelWrapper,
    LightGBMModelWrapper,
    CatBoostModelWrapper,
)


class XGBoostNativeLoader(BaseNativeLoader):
    """
    Native loader for XGBoost models.
    
    Loads models directly using xgb.Booster.load_model() or sklearn API,
    providing direct access to XGBoost model objects.
    
    Features:
    - Direct model loading from model.xgb/model.json
    - Schema extraction from MLmodel file
    - Returns XGBoostModelWrapper for predictions
    - DMatrix handling for optimal performance
    """
    
    # Possible model filenames used by MLflow xgboost flavor
    MODEL_FILENAMES = ["model.xgb", "model.json", "model.ubj", "model.bin"]
    
    def __init__(self, config: Config):
        """
        Initialize the XGBoost native loader.
        
        Args:
            config: Application configuration with model path
        """
        super().__init__(config)
        self._is_sklearn_api: bool = False
        self._wrapper: Optional[XGBoostModelWrapper] = None
        logger.info("XGBoostNativeLoader initialized")
    
    def _find_model_file(self, model_path: str) -> str:
        """Find the XGBoost model file in the model directory."""
        for filename in self.MODEL_FILENAMES:
            file_path = os.path.join(model_path, filename)
            if os.path.exists(file_path):
                return file_path
        
        raise FileNotFoundError(
            f"Could not find XGBoost model file in {model_path}. "
            f"Expected one of: {self.MODEL_FILENAMES}"
        )
    
    def load_model(self) -> XGBoostModelWrapper:
        """
        Load the XGBoost model and return a wrapper.
        
        Attempts to load as sklearn-style model first (XGBClassifier/XGBRegressor),
        falls back to raw Booster if that fails.
        
        Returns:
            XGBoostModelWrapper that handles predictions
        """
        import xgboost as xgb
        
        model_path = self.config.get_model_local_path
        if not model_path:
            raise ValueError("MODEL_LOCAL_PATH not set. Cannot load model natively.")
        
        model_file = self._find_model_file(model_path)
        logger.info(f"Loading XGBoost model from: {model_file}")
        
        # Try to load as sklearn-style model first
        try:
            # Check if there's a model.pkl (sklearn wrapper)
            pkl_path = os.path.join(model_path, "model.pkl")
            if os.path.exists(pkl_path):
                import joblib
                self._loaded_model = joblib.load(pkl_path)
                self._is_sklearn_api = True
                logger.info("XGBoost model loaded as sklearn API")
        except Exception:
            pass
        
        if not self._is_sklearn_api:
            # Load as raw Booster
            booster = xgb.Booster()
            booster.load_model(model_file)
            self._loaded_model = booster
            self._is_sklearn_api = False
            
            # Log feature names from the booster
            try:
                booster_feature_names = booster.feature_names
                logger.info(f"XGBoost Booster loaded successfully. Feature names: {booster_feature_names}")
            except Exception:
                logger.info("XGBoost Booster loaded successfully (no feature names available)")
        
        # Create wrapper
        self._wrapper = XGBoostModelWrapper(
            model=self._loaded_model,
            feature_order=self._feature_order,
            is_sklearn_api=self._is_sklearn_api,
        )
        
        logger.info(f"Created XGBoostModelWrapper (sklearn_api={self._is_sklearn_api}, features={len(self._feature_order) if self._feature_order else 0})")
        return self._wrapper
    
    def reload_model(self) -> XGBoostModelWrapper:
        """Reload the XGBoost model."""
        logger.info("Reloading XGBoost model...")
        return self.load_model()


class LightGBMNativeLoader(BaseNativeLoader):
    """
    Native loader for LightGBM models.
    
    Loads models directly using lgb.Booster(),
    providing direct access to LightGBM model objects.
    
    Features:
    - Direct model loading from model.lgb/model.txt
    - Schema extraction from MLmodel file
    - Returns LightGBMModelWrapper for predictions
    """
    
    MODEL_FILENAMES = ["model.lgb", "model.txt", "lgb_model.txt"]
    
    def __init__(self, config: Config):
        """Initialize the LightGBM native loader."""
        super().__init__(config)
        self._is_sklearn_api: bool = False
        self._wrapper: Optional[LightGBMModelWrapper] = None
        logger.info("LightGBMNativeLoader initialized")
    
    def _find_model_file(self, model_path: str) -> str:
        """Find the LightGBM model file in the model directory."""
        for filename in self.MODEL_FILENAMES:
            file_path = os.path.join(model_path, filename)
            if os.path.exists(file_path):
                return file_path
        
        raise FileNotFoundError(
            f"Could not find LightGBM model file in {model_path}. "
            f"Expected one of: {self.MODEL_FILENAMES}"
        )
    
    def load_model(self) -> LightGBMModelWrapper:
        """
        Load the LightGBM model and return a wrapper.
        
        Returns:
            LightGBMModelWrapper that handles predictions
        """
        import lightgbm as lgb
        
        model_path = self.config.get_model_local_path
        if not model_path:
            raise ValueError("MODEL_LOCAL_PATH not set. Cannot load model natively.")
        
        # Try sklearn-style model first
        try:
            pkl_path = os.path.join(model_path, "model.pkl")
            if os.path.exists(pkl_path):
                import joblib
                self._loaded_model = joblib.load(pkl_path)
                self._is_sklearn_api = True
                logger.info("LightGBM model loaded as sklearn API")
        except Exception:
            pass
        
        if not self._is_sklearn_api:
            # Load as Booster
            model_file = self._find_model_file(model_path)
            logger.info(f"Loading LightGBM model from: {model_file}")
            
            self._loaded_model = lgb.Booster(model_file=model_file)
            self._is_sklearn_api = False
            
            logger.info("LightGBM Booster loaded successfully")
        
        # Create wrapper
        self._wrapper = LightGBMModelWrapper(
            model=self._loaded_model,
            feature_order=self._feature_order,
            is_sklearn_api=self._is_sklearn_api,
        )
        
        logger.info(f"Created LightGBMModelWrapper (sklearn_api={self._is_sklearn_api})")
        return self._wrapper
    
    def reload_model(self) -> LightGBMModelWrapper:
        """Reload the LightGBM model."""
        logger.info("Reloading LightGBM model...")
        return self.load_model()


class CatBoostNativeLoader(BaseNativeLoader):
    """
    Native loader for CatBoost models.
    
    Loads models directly using CatBoost.load_model(),
    providing direct access to CatBoost model objects.
    
    Features:
    - Direct model loading from model.cb
    - Schema extraction from MLmodel file
    - Returns CatBoostModelWrapper for predictions
    - Automatic classifier/regressor detection
    """
    
    MODEL_FILENAMES = ["model.cb", "catboost_model.bin"]
    
    def __init__(self, config: Config):
        """Initialize the CatBoost native loader."""
        super().__init__(config)
        self._model_type: Optional[str] = None  # 'classifier' or 'regressor'
        self._wrapper: Optional[CatBoostModelWrapper] = None
        logger.info("CatBoostNativeLoader initialized")
    
    def _find_model_file(self, model_path: str) -> str:
        """Find the CatBoost model file in the model directory."""
        for filename in self.MODEL_FILENAMES:
            file_path = os.path.join(model_path, filename)
            if os.path.exists(file_path):
                return file_path
        
        raise FileNotFoundError(
            f"Could not find CatBoost model file in {model_path}. "
            f"Expected one of: {self.MODEL_FILENAMES}"
        )
    
    def _detect_model_type(self, model_path: str) -> str:
        """
        Detect if model is classifier or regressor from MLmodel file.
        
        Returns:
            'classifier' or 'regressor'
        """
        try:
            import yaml
            mlmodel_path = os.path.join(model_path, "MLmodel")
            if os.path.exists(mlmodel_path):
                with open(mlmodel_path, 'r') as f:
                    mlmodel = yaml.safe_load(f)
                
                catboost_flavor = mlmodel.get("flavors", {}).get("catboost", {})
                model_type = catboost_flavor.get("model_type", "classifier")
                return model_type
        except Exception:
            pass
        
        return "classifier"  # Default to classifier
    
    def load_model(self) -> CatBoostModelWrapper:
        """
        Load the CatBoost model and return a wrapper.
        
        Detects model type (classifier/regressor) and loads appropriately.
        
        Returns:
            CatBoostModelWrapper that handles predictions
        """
        from catboost import CatBoostClassifier, CatBoostRegressor
        
        model_path = self.config.get_model_local_path
        if not model_path:
            raise ValueError("MODEL_LOCAL_PATH not set. Cannot load model natively.")
        
        model_file = self._find_model_file(model_path)
        self._model_type = self._detect_model_type(model_path)
        
        logger.info(f"Loading CatBoost {self._model_type} from: {model_file}")
        
        if self._model_type == "regressor":
            self._loaded_model = CatBoostRegressor()
        else:
            self._loaded_model = CatBoostClassifier()
        
        self._loaded_model.load_model(model_file)
        
        logger.info(f"CatBoost {self._model_type} loaded successfully")
        
        # Create wrapper
        self._wrapper = CatBoostModelWrapper(
            model=self._loaded_model,
            feature_order=self._feature_order,
            model_type=self._model_type,
        )
        
        logger.info(f"Created CatBoostModelWrapper (type={self._model_type})")
        return self._wrapper
    
    def reload_model(self) -> CatBoostModelWrapper:
        """Reload the CatBoost model."""
        logger.info("Reloading CatBoost model...")
        return self.load_model()
