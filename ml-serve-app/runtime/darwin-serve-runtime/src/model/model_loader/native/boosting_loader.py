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
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd

from .base_native_loader import BaseNativeLoader
from src.config.config import Config
from src.config.logger import logger


class XGBoostNativeLoader(BaseNativeLoader):
    """
    Native loader for XGBoost models.
    
    Loads models directly using xgb.Booster.load_model() or sklearn API,
    providing direct access to XGBoost model objects.
    
    Features:
    - Direct model loading from model.xgb/model.json
    - Schema extraction from MLmodel file
    - Native predict support
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
    
    def load_model(self) -> Any:
        """
        Load the XGBoost model.
        
        Attempts to load as sklearn-style model first (XGBClassifier/XGBRegressor),
        falls back to raw Booster if that fails.
        
        Returns:
            Loaded XGBoost model
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
                return self._loaded_model
        except Exception:
            pass
        
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
        
        return self._loaded_model
    
    def reload_model(self) -> Any:
        """Reload the XGBoost model."""
        logger.info("Reloading XGBoost model...")
        return self.load_model()
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction using the native XGBoost model.
        
        Args:
            input_data: Input data (dict, DataFrame, or numpy array)
            
        Returns:
            Dict with 'scores' key containing predictions
        """
        import xgboost as xgb
        import pandas as pd
        
        if self._loaded_model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # For raw Booster API, we need to preserve feature names
        # Convert to DataFrame if we have feature order
        logger.debug(f"XGBoost predict: is_sklearn_api={self._is_sklearn_api}, feature_order={self._feature_order}")
        if not self._is_sklearn_api and self._feature_order:
            # Convert input to DataFrame to preserve feature names
            if isinstance(input_data, dict):
                # Ensure features are in the correct order
                X = pd.DataFrame([{k: input_data[k] for k in self._feature_order}])
            elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
                # Batch of dicts - ensure correct order
                X = pd.DataFrame([{k: d[k] for k in self._feature_order} for d in input_data])
            elif isinstance(input_data, pd.DataFrame):
                # Already a DataFrame - reorder columns if needed
                X = input_data[self._feature_order] if list(input_data.columns) != self._feature_order else input_data
            else:
                # Convert to array first, then to DataFrame with correct column names
                X_array = self._prepare_input(input_data)
                X = pd.DataFrame(X_array, columns=self._feature_order)
        else:
            # sklearn API or no feature order - use numpy array
            X = self._prepare_input(input_data)
        
        try:
            if self._is_sklearn_api:
                # sklearn API - use predict/predict_proba
                if hasattr(self._loaded_model, 'predict_proba'):
                    predictions = self._loaded_model.predict_proba(X)
                    if predictions.ndim == 2 and predictions.shape[1] == 2:
                        scores = predictions[:, 1].tolist()
                    else:
                        scores = predictions.tolist()
                else:
                    predictions = self._loaded_model.predict(X)
                    scores = predictions.tolist()
            else:
                # Raw Booster - need DMatrix with feature names
                # XGBoost DMatrix should automatically pick up column names from DataFrame
                # but we can also explicitly set feature_names if needed
                logger.debug(f"Creating DMatrix from {type(X).__name__}, is_dataframe={isinstance(X, pd.DataFrame)}")
                if isinstance(X, pd.DataFrame):
                    logger.debug(f"DataFrame columns: {X.columns.tolist()}")
                    dmatrix = xgb.DMatrix(X, feature_names=X.columns.tolist())
                else:
                    dmatrix = xgb.DMatrix(X)
                predictions = self._loaded_model.predict(dmatrix)
                scores = predictions.tolist()
            
            return {"scores": scores}
            
        except Exception as e:
            logger.exception(f"XGBoost prediction failed: {e}")
            raise
    
    def _prepare_input(self, input_data: Any) -> np.ndarray:
        """Prepare input data for XGBoost prediction."""
        return self._prepare_input_for_prediction(input_data, self._feature_order)


class LightGBMNativeLoader(BaseNativeLoader):
    """
    Native loader for LightGBM models.
    
    Loads models directly using lgb.Booster(),
    providing direct access to LightGBM model objects.
    
    Features:
    - Direct model loading from model.lgb/model.txt
    - Schema extraction from MLmodel file
    - Native predict support
    """
    
    MODEL_FILENAMES = ["model.lgb", "model.txt", "lgb_model.txt"]
    
    def __init__(self, config: Config):
        """Initialize the LightGBM native loader."""
        super().__init__(config)
        self._is_sklearn_api: bool = False
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
    
    def load_model(self) -> Any:
        """
        Load the LightGBM model.
        
        Returns:
            Loaded LightGBM model (Booster or sklearn-style)
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
                return self._loaded_model
        except Exception:
            pass
        
        # Load as Booster
        model_file = self._find_model_file(model_path)
        logger.info(f"Loading LightGBM model from: {model_file}")
        
        self._loaded_model = lgb.Booster(model_file=model_file)
        self._is_sklearn_api = False
        
        logger.info("LightGBM Booster loaded successfully")
        return self._loaded_model
    
    def reload_model(self) -> Any:
        """Reload the LightGBM model."""
        logger.info("Reloading LightGBM model...")
        return self.load_model()
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction using the native LightGBM model.
        
        Args:
            input_data: Input data (dict, DataFrame, or numpy array)
            
        Returns:
            Dict with 'scores' key containing predictions
        """
        if self._loaded_model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        X = self._prepare_input_for_prediction(input_data, self._feature_order)
        
        try:
            if self._is_sklearn_api:
                if hasattr(self._loaded_model, 'predict_proba'):
                    predictions = self._loaded_model.predict_proba(X)
                    if predictions.ndim == 2 and predictions.shape[1] == 2:
                        scores = predictions[:, 1].tolist()
                    else:
                        scores = predictions.tolist()
                else:
                    predictions = self._loaded_model.predict(X)
                    scores = predictions.tolist()
            else:
                # Raw Booster
                predictions = self._loaded_model.predict(X)
                scores = predictions.tolist()
            
            return {"scores": scores}
            
        except Exception as e:
            logger.exception(f"LightGBM prediction failed: {e}")
            raise


class CatBoostNativeLoader(BaseNativeLoader):
    """
    Native loader for CatBoost models.
    
    Loads models directly using CatBoost.load_model(),
    providing direct access to CatBoost model objects.
    
    Features:
    - Direct model loading from model.cb
    - Schema extraction from MLmodel file
    - Native predict support
    - Automatic classifier/regressor detection
    """
    
    MODEL_FILENAMES = ["model.cb", "catboost_model.bin"]
    
    def __init__(self, config: Config):
        """Initialize the CatBoost native loader."""
        super().__init__(config)
        self._model_type: Optional[str] = None  # 'classifier' or 'regressor'
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
    
    def load_model(self) -> Any:
        """
        Load the CatBoost model.
        
        Detects model type (classifier/regressor) and loads appropriately.
        
        Returns:
            Loaded CatBoost model
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
        return self._loaded_model
    
    def reload_model(self) -> Any:
        """Reload the CatBoost model."""
        logger.info("Reloading CatBoost model...")
        return self.load_model()
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction using the native CatBoost model.
        
        Args:
            input_data: Input data (dict, DataFrame, or numpy array)
            
        Returns:
            Dict with 'scores' key containing predictions
        """
        if self._loaded_model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        X = self._prepare_input_for_prediction(input_data, self._feature_order)
        
        try:
            if self._model_type == "classifier":
                predictions = self._loaded_model.predict_proba(X)
                if predictions.ndim == 2 and predictions.shape[1] == 2:
                    scores = predictions[:, 1].tolist()
                else:
                    scores = predictions.tolist()
            else:
                predictions = self._loaded_model.predict(X)
                scores = predictions.tolist() if hasattr(predictions, 'tolist') else predictions
            
            return {"scores": scores}
            
        except Exception as e:
            logger.exception(f"CatBoost prediction failed: {e}")
            raise
