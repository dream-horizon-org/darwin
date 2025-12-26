"""
Factory for creating model loaders based on flavor detection.

This factory pattern provides native model loaders for specific ML frameworks
while maintaining backward compatibility with MLflow pyfunc loader as fallback.
"""

import os
from typing import Optional, Dict, Any, List

import yaml

from .model_loader_interface import ModelLoaderInterface
from src.config.config import Config
from src.config.constants import (
    DEFAULT_FLAVOR,
    FLAVOR_TO_LOADER,
    FLAVOR_TO_IMAGE_CATEGORY,
    FLAVOR_PRIORITY_ORDER,
)
from src.config.logger import logger


class ModelLoaderFactory:
    """
    Factory for creating model loaders based on detected or specified flavor.
    
    Native loaders are preferred for performance. Falls back to pyfunc for:
    - Unknown or custom flavors
    - Models without local path (remote loading)
    - When native loading fails
    
    Supported flavors and their native loaders:
    - sklearn: SklearnNativeLoader (joblib.load)
    - xgboost: XGBoostNativeLoader (xgb.Booster)
    - lightgbm: LightGBMNativeLoader (lgb.Booster)
    - catboost: CatBoostNativeLoader (CatBoost.load_model)
    - pytorch: PyTorchNativeLoader (torch.load / torch.jit.load)
    - tensorflow: TensorFlowNativeLoader (keras.models.load_model)
    - keras: KerasNativeLoader (keras.models.load_model)
    - python_function: MLFlowPyfuncLoader (fallback)
    """
    
    @classmethod
    def create(cls, config: Config) -> ModelLoaderInterface:
        """
        Create the appropriate model loader based on config and detected flavor.
        
        Preference:
        1. Native loader if flavor detected and local path available
        2. Pyfunc loader as fallback
        
        Args:
            config: Application configuration with model URI/path
            
        Returns:
            ModelLoaderInterface implementation
        """
        # Detect flavor from MLmodel file if available
        flavor = cls._detect_flavor(config)
        loader_type = FLAVOR_TO_LOADER.get(flavor, "pyfunc")
        
        logger.info(f"Detected model flavor: {flavor}, loader type: {loader_type}")
        
        # Check if we can use native loader (requires local model path)
        can_use_native = loader_type == "native" and config.get_model_local_path
        
        if can_use_native:
            try:
                return cls._create_native_loader(flavor, config)
            except Exception as e:
                logger.warning(f"Failed to create native loader for {flavor}: {e}. Falling back to pyfunc.")
        
        # Fallback to pyfunc loader
        logger.info(f"Using MLflow pyfunc loader for flavor: {flavor}")
        from .mlflow_pyfunc_loader import MLFlowPyfuncLoader
        return MLFlowPyfuncLoader(config)
    
    @classmethod
    def _create_native_loader(cls, flavor: str, config: Config) -> ModelLoaderInterface:
        """
        Create a native loader for the specified flavor.
        
        Args:
            flavor: Model flavor name
            config: Application configuration
            
        Returns:
            Native ModelLoaderInterface implementation
            
        Raises:
            ValueError: If flavor is not supported for native loading
        """
        if flavor == "sklearn":
            from .native.sklearn_loader import SklearnNativeLoader
            logger.info("Creating SklearnNativeLoader")
            return SklearnNativeLoader(config)
        
        elif flavor == "xgboost":
            from .native.boosting_loader import XGBoostNativeLoader
            logger.info("Creating XGBoostNativeLoader")
            return XGBoostNativeLoader(config)
        
        elif flavor == "lightgbm":
            from .native.boosting_loader import LightGBMNativeLoader
            logger.info("Creating LightGBMNativeLoader")
            return LightGBMNativeLoader(config)
        
        elif flavor == "catboost":
            from .native.boosting_loader import CatBoostNativeLoader
            logger.info("Creating CatBoostNativeLoader")
            return CatBoostNativeLoader(config)
        
        elif flavor == "pytorch":
            from .native.pytorch_loader import PyTorchNativeLoader
            logger.info("Creating PyTorchNativeLoader")
            return PyTorchNativeLoader(config)
        
        elif flavor in ("tensorflow", "keras"):
            from .native.tensorflow_loader import TensorFlowNativeLoader
            logger.info("Creating TensorFlowNativeLoader")
            return TensorFlowNativeLoader(config)
        
        else:
            raise ValueError(f"No native loader available for flavor: {flavor}")
    
    @classmethod
    def _detect_flavor(cls, config: Config) -> str:
        """
        Detect the primary model flavor from the MLmodel file.
        
        Args:
            config: Application configuration
            
        Returns:
            Detected flavor name, or 'python_function' as default
        """
        model_path = config.get_model_local_path
        
        if not model_path:
            logger.debug("No local model path, defaulting to python_function flavor")
            return "python_function"
        
        mlmodel_path = os.path.join(model_path, "MLmodel")
        
        if not os.path.exists(mlmodel_path):
            logger.debug(f"MLmodel file not found at {mlmodel_path}, defaulting to python_function")
            return "python_function"
        
        try:
            with open(mlmodel_path, 'r') as f:
                mlmodel = yaml.safe_load(f)
            
            flavors = mlmodel.get("flavors", {})
            
            # Use priority order from constants for flavor detection
            for flavor in FLAVOR_PRIORITY_ORDER:
                if flavor in flavors:
                    logger.debug(f"Detected flavor '{flavor}' from MLmodel file")
                    return flavor
            
            # Default to python_function if present
            if "python_function" in flavors:
                return "python_function"
            
            logger.warning(f"No recognized flavor in MLmodel: {list(flavors.keys())}")
            return "python_function"
            
        except Exception as e:
            logger.warning(f"Error reading MLmodel file: {e}, defaulting to python_function")
            return "python_function"
    
    @classmethod
    def get_flavor_category(cls, flavor: str) -> str:
        """
        Get the category (image type) for a given flavor.    
        """
        return FLAVOR_TO_IMAGE_CATEGORY.get(flavor, DEFAULT_FLAVOR)
    
    @classmethod
    def get_supported_flavors(cls) -> List[str]:
        """Get list of all supported flavors."""
        return list(FLAVOR_TO_LOADER.keys())
    
    @classmethod
    def get_native_flavors(cls) -> List[str]:
        """Get list of flavors with native loader support."""
        return [f for f, t in FLAVOR_TO_LOADER.items() if t == "native"]
    
    @classmethod
    def get_mlmodel_info(cls, model_path: str) -> Optional[Dict[str, Any]]:
        """
        Read and return the full MLmodel file contents.
        
        Args:
            model_path: Path to model directory
            
        Returns:
            Parsed MLmodel dict or None if not found
        """
        mlmodel_path = os.path.join(model_path, "MLmodel")
        
        if not os.path.exists(mlmodel_path):
            return None
        
        try:
            with open(mlmodel_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception:
            return None
