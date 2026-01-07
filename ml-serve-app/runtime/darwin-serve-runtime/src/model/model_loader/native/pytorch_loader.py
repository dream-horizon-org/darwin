"""
Native PyTorch model loader.

This loader directly loads PyTorch models using torch.load() or torch.jit.load(),
bypassing the MLflow pyfunc wrapper for better performance.

MLflow pytorch artifact structure:
    model/
    ├── MLmodel             # YAML with flavor info and signature
    ├── data/
    │   ├── model.pth       # Serialized PyTorch model state dict
    │   └── pickle_module_info.txt
    ├── conda.yaml
    ├── requirements.txt
    └── input_example.json (optional)
"""

import os
from typing import Optional

from .base_native_loader import BaseNativeLoader
from src.config.config import Config
from src.config.logger import logger
from src.model.predictable_model import PyTorchModelWrapper


class PyTorchNativeLoader(BaseNativeLoader):
    """
    Native loader for PyTorch models.
    
    Loads models directly using torch.load() for state dicts or
    torch.jit.load() for TorchScript models.
    
    Features:
    - Direct model loading from data/model.pth
    - TorchScript model support
    - Schema extraction from MLmodel file
    - TensorSpec expansion using input_example
    - Automatic GPU/CPU device handling
    - Returns PyTorchModelWrapper for predictions
    """
    
    # Possible model file locations
    MODEL_PATHS = [
        "data/model.pth",
        "data/model.pt",
        "model.pth",
        "model.pt",
    ]
    
    def __init__(self, config: Config):
        """
        Initialize the PyTorch native loader.
        
        Args:
            config: Application configuration with model path
        """
        super().__init__(config)
        self._device: str = "cpu"  # Default to CPU for serving
        self._is_jit_model: bool = False
        self._wrapper: Optional[PyTorchModelWrapper] = None
        logger.info("PyTorchNativeLoader initialized")
    
    def _find_model_file(self, model_path: str) -> str:
        """Find the PyTorch model file in the model directory."""
        for rel_path in self.MODEL_PATHS:
            file_path = os.path.join(model_path, rel_path)
            if os.path.exists(file_path):
                return file_path
        
        # Check for TorchScript model
        for ext in [".pt", ".pth"]:
            jit_path = os.path.join(model_path, f"model{ext}")
            if os.path.exists(jit_path):
                return jit_path
        
        raise FileNotFoundError(
            f"Could not find PyTorch model file in {model_path}. "
            f"Expected one of: {self.MODEL_PATHS}"
        )
    
    def load_model(self) -> PyTorchModelWrapper:
        """
        Load the PyTorch model and return a wrapper.
        
        Attempts to load as TorchScript first (preferred for serving),
        falls back to pickle-based loading.
        
        Returns:
            PyTorchModelWrapper that handles predictions
        """
        import torch
        
        model_path = self.config.get_model_local_path
        if not model_path:
            raise ValueError("MODEL_LOCAL_PATH not set. Cannot load model natively.")
        
        model_file = self._find_model_file(model_path)
        logger.info(f"Loading PyTorch model from: {model_file}")
        
        # Determine device
        self._device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self._device}")
        
        try:
            # Try TorchScript first (most portable)
            self._loaded_model = torch.jit.load(model_file, map_location=self._device)
            self._is_jit_model = True
            logger.info("PyTorch model loaded as TorchScript")
        except Exception as jit_error:
            # Fall back to pickle loading
            # Note: weights_only=False is required for MLflow models saved with cloudpickle
            # This is safe since we trust MLflow artifacts
            try:
                self._loaded_model = torch.load(
                    model_file, 
                    map_location=self._device,
                    weights_only=False  # Required for MLflow cloudpickle models
                )
                self._is_jit_model = False
                logger.info("PyTorch model loaded via torch.load()")
            except Exception as e:
                logger.error(f"Failed to load PyTorch model: {e}")
                raise RuntimeError(
                    f"Could not load PyTorch model. "
                    f"TorchScript error: {jit_error}. "
                    f"Pickle error: {e}"
                )
        
        # Ensure model is in eval mode
        if hasattr(self._loaded_model, 'eval'):
            self._loaded_model.eval()
        
        logger.info("PyTorch model loaded and set to eval mode")
        
        # Create wrapper
        self._wrapper = PyTorchModelWrapper(
            model=self._loaded_model,
            feature_order=self._feature_order,
            device=self._device,
        )
        
        logger.info(f"Created PyTorchModelWrapper (device={self._device}, features={len(self._feature_order) if self._feature_order else 0})")
        return self._wrapper
    
    def reload_model(self) -> PyTorchModelWrapper:
        """Reload the PyTorch model."""
        logger.info("Reloading PyTorch model...")
        return self.load_model()
