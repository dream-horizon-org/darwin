from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from .model_loader.model_loader_interface import ModelLoaderInterface
from src.config.logger import logger
from src.schema.schema_validator import SchemaValidator


class Model:
    def __init__(self, model_loader: ModelLoaderInterface):
        self._model_loader: ModelLoaderInterface = model_loader
        self.model: Any | None = None
        self._validator: Optional[SchemaValidator] = None
        self._uses_native_predict: bool = False

    def _ensure_model_loaded(self) -> None:
        if self.model is None:
            self.model = self._model_loader.load_model()
            # Check if we should use native prediction
            self._uses_native_predict = self._model_loader.has_native_predict()
            logger.info(f"Model loaded. Using native predict: {self._uses_native_predict}")
            # Initialize validator if schema is available
            if self.has_signature():
                input_schema = self._model_loader.get_input_schema()
                self._validator = SchemaValidator(input_schema)

    def has_signature(self) -> bool:
        """
        Check if the model has a signature available from the MLmodel file.
        """
        return self._model_loader.has_signature()
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """
        Get the input schema from the MLmodel file.
        """
        return self._model_loader.get_input_schema()
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """
        Get the output schema from the MLmodel file.
        """
        return self._model_loader.get_output_schema()
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """
        Get the input example from the MLmodel file.
        """
        return self._model_loader.get_input_example()
    
    def get_full_schema(self) -> Dict[str, Any]:
        """
        Get the complete schema from the MLmodel file.
        """
        return self._model_loader.get_full_schema()
    
    def get_feature_order(self) -> Optional[List[str]]:
        """
        Get the ordered list of feature names for TensorSpec models.
        
        Returns:
            List of feature names in order, or None if not available
        """
        return getattr(self._model_loader, 'get_feature_order', lambda: None)()
    
    def is_tensor_spec(self) -> bool:
        """
        Check if the model uses TensorSpec signature.
        """
        return getattr(self._model_loader, 'is_tensor_spec', lambda: False)()
    
    def validate_features(self, features: Dict[str, Any]) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Validate features against the model schema.
        
        Args:
            features: Dictionary of feature names to values
            
        Returns:
            Tuple of (is_valid, list of error dicts)
        """
        self._ensure_model_loaded()
        
        if self._validator is None:
            # No schema available, validation passes
            return True, []
        
        is_valid, errors = self._validator.validate(features)
        return is_valid, [e.to_dict() for e in errors]

    async def predict(self, input_data: Any) -> Any:
        self._ensure_model_loaded()
        return await self.inference(input_data)

    async def inference(
        self,
        input_data: Any,
    ) -> dict:
        """
        Inference for a model with features provided as a dictionary.

        For native loaders:
        - Delegates to loader.predict() which handles input conversion internally

        For pyfunc loaders:
        - TensorSpec models: convert feature dict/DataFrame → ordered numpy array
        - ColSpec models: wrap dict in list for MLflow's prediction API

        Args:
          input_data: Dictionary of feature names to values, DataFrame, or array.

        Returns:
          {
            "scores": List[float] or single prediction value
          }
        """
        self._ensure_model_loaded()
        
        try:
            # Use native prediction if available
            if self._uses_native_predict:
                return await self._native_inference(input_data)
            else:
                return await self._pyfunc_inference(input_data)
                
        except KeyError as e:
            # Missing feature in input
            feature_order = self.get_feature_order()
            logger.error(
                f"Inference failed: Missing feature {str(e)}",
                expected_features=feature_order if feature_order else 'N/A',
                provided_features=list(input_data.keys()) if isinstance(input_data, dict) else 'N/A',
            )
            raise ValueError(f"Missing required feature: {str(e)}")
        except Exception as e:
            logger.exception(
                f"Inference failed: {type(e).__name__}: {str(e)}",
                input_data_type=str(type(input_data)),
                uses_native=self._uses_native_predict,
            )
            raise
    
    async def _native_inference(self, input_data: Any) -> dict:
        """
        Perform inference using the native loader's predict method.
        
        Native loaders handle input conversion internally.
        """
        logger.debug("Using native prediction")
        
        # Convert DataFrame to dict for consistent handling
        if isinstance(input_data, pd.DataFrame):
            if len(input_data) == 1:
                # Single row - convert to dict
                input_data = input_data.iloc[0].to_dict()
            else:
                # Multiple rows - convert to list of dicts
                input_data = input_data.to_dict('records')
        
        # Call native predict (synchronous - loaders don't use async)
        result = self._model_loader.predict(input_data)
        
        return result
    
    async def _pyfunc_inference(self, input_data: Any) -> dict:
        """
        Perform inference using MLflow pyfunc model.predict().
        
        Handles TensorSpec vs ColSpec input conversion.
        """
        logger.debug("Using pyfunc prediction")
        
        # Check if this is a TensorSpec model (needs array input)
        feature_order = self.get_feature_order()
        is_tensor = self.is_tensor_spec()
        
        if is_tensor and feature_order:
            # TensorSpec model: convert feature dict/DataFrame → ordered numpy array
            if isinstance(input_data, pd.DataFrame):
                # DataFrame input (from _prepare_model_input in main.py)
                # Reorder columns to match feature_order and convert to array
                input_data = input_data[feature_order]
                array_data = input_data.values.astype(np.float64)
            elif isinstance(input_data, dict):
                # Dict input: convert to ordered array
                ordered_values = [input_data[name] for name in feature_order]
                array_data = np.array([ordered_values], dtype=np.float64)
            elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
                # Batch of dicts
                rows = [[d[name] for name in feature_order] for d in input_data]
                array_data = np.array(rows, dtype=np.float64)
            else:
                # Already an array or other format
                array_data = input_data
            
            mlflow_input = array_data
            
        elif isinstance(input_data, dict):
            # ColSpec model: wrap dict in list for MLflow
            mlflow_input = [input_data]
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            # Batch prediction with list of dicts
            mlflow_input = input_data
        else:
            # Pass through (for arrays, DataFrames, etc.)
            mlflow_input = input_data
        
        prediction = self.model.predict(mlflow_input)
        
        # Ensure JSON-serializable response
        # Handle different return types: DataFrame, numpy array, list, etc.
        if isinstance(prediction, pd.DataFrame):
            # DataFrame: convert to list of dicts or values
            scores = prediction.values.flatten().tolist()
        elif hasattr(prediction, 'tolist'):
            # numpy array
            scores = prediction.tolist()
        else:
            # Already a list or scalar
            scores = prediction
            
        return {"scores": scores}
