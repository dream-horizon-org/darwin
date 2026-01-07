"""
Predictable Model Protocol and Wrappers.

This module defines the PredictableModel protocol and concrete implementations
for different model types. This separates prediction logic from loading logic.

Loaders are responsible for loading models, while Wrappers are responsible
for making predictions.
"""

from typing import Any, Dict, List, Optional, Protocol, runtime_checkable

import numpy as np
import pandas as pd

from src.config.logger import logger


@runtime_checkable
class PredictableModel(Protocol):
    """
    Protocol for models that can make predictions.
    
    All model wrappers must implement this interface.
    The predict() method handles input conversion and returns
    a standardized output format.
    """
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction on input data.
        
        Args:
            input_data: Input data (dict, DataFrame, list, or numpy array)
            
        Returns:
            Dict with prediction results (e.g., {"scores": [...]})
        """
        ...


class PyfuncModelWrapper:
    """
    Wrapper for MLflow pyfunc models.
    
    Handles input conversion for both TensorSpec and ColSpec schemas,
    then delegates to the pyfunc model's predict() method.
    """
    
    def __init__(
        self,
        model: Any,
        feature_order: Optional[List[str]] = None,
        is_tensor_spec: bool = False,
    ):
        """
        Initialize the pyfunc model wrapper.
        
        Args:
            model: Loaded MLflow pyfunc model
            feature_order: Ordered list of feature names (for TensorSpec)
            is_tensor_spec: Whether the model uses TensorSpec signature
        """
        self._model = model
        self._feature_order = feature_order
        self._is_tensor_spec = is_tensor_spec
    
    @property
    def raw_model(self) -> Any:
        """Get the underlying pyfunc model."""
        return self._model
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction using MLflow pyfunc model.predict().
        
        Handles TensorSpec vs ColSpec input conversion.
        
        Args:
            input_data: Dict, DataFrame, list of dicts, or array
            
        Returns:
            Dict with 'scores' key containing predictions
        """
        mlflow_input = self._prepare_input(input_data)
        prediction = self._model.predict(mlflow_input)
        return self._format_output(prediction)
    
    def _prepare_input(self, input_data: Any) -> Any:
        """
        Prepare input data for MLflow pyfunc prediction.
        
        TensorSpec models need numpy arrays with correct feature order.
        ColSpec models need list of dicts.
        """
        if self._is_tensor_spec and self._feature_order:
            return self._prepare_tensor_input(input_data)
        else:
            return self._prepare_colspec_input(input_data)
    
    def _prepare_tensor_input(self, input_data: Any) -> np.ndarray:
        """Convert input to ordered numpy array for TensorSpec models."""
        feature_order = self._feature_order
        
        if isinstance(input_data, pd.DataFrame):
            input_data = input_data[feature_order]
            return input_data.values.astype(np.float64)
        
        elif isinstance(input_data, dict):
            ordered_values = [input_data[name] for name in feature_order]
            return np.array([ordered_values], dtype=np.float64)
        
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            rows = [[d[name] for name in feature_order] for d in input_data]
            return np.array(rows, dtype=np.float64)
        
        else:
            # Already an array or other format
            return input_data
    
    def _prepare_colspec_input(self, input_data: Any) -> Any:
        """Prepare input for ColSpec models."""
        if isinstance(input_data, dict):
            return [input_data]
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            return input_data
        else:
            # Pass through (arrays, DataFrames, etc.)
            return input_data
    
    def _format_output(self, prediction: Any) -> Dict[str, Any]:
        """Convert prediction to standardized output format."""
        if isinstance(prediction, pd.DataFrame):
            scores = prediction.values.flatten().tolist()
        elif hasattr(prediction, 'tolist'):
            scores = prediction.tolist()
        else:
            scores = prediction
        
        return {"scores": scores}


class SklearnModelWrapper:
    """
    Wrapper for scikit-learn models.
    
    Handles classifiers (with predict_proba) and regressors (with predict).
    """
    
    def __init__(
        self,
        model: Any,
        feature_order: Optional[List[str]] = None,
        model_type: str = "regressor",
    ):
        """
        Initialize the sklearn model wrapper.
        
        Args:
            model: Loaded sklearn model (estimator)
            feature_order: Ordered list of feature names
            model_type: 'classifier' or 'regressor'
        """
        self._model = model
        self._feature_order = feature_order
        self._model_type = model_type
    
    @property
    def raw_model(self) -> Any:
        """Get the underlying sklearn model."""
        return self._model
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """
        Make prediction using sklearn model.
        
        For classifiers: returns predicted class and probabilities.
        For regressors: returns predicted values.
        """
        X = self._prepare_input(input_data)
        
        if self._model_type == 'classifier':
            return self._predict_classifier(X)
        else:
            return self._predict_regressor(X)
    
    def _prepare_input(self, input_data: Any) -> np.ndarray:
        """Prepare input data for sklearn prediction."""
        feature_order = self._feature_order
        
        if isinstance(input_data, pd.DataFrame):
            if feature_order:
                missing = set(feature_order) - set(input_data.columns)
                if missing:
                    raise ValueError(f"Missing features: {missing}")
                return input_data[feature_order].values
            return input_data.values
        
        elif isinstance(input_data, dict):
            if feature_order:
                values = [input_data[name] for name in feature_order]
                return np.array([values])
            return np.array([list(input_data.values())])
        
        elif isinstance(input_data, list):
            if input_data and isinstance(input_data[0], dict):
                if feature_order:
                    rows = [[d[name] for name in feature_order] for d in input_data]
                else:
                    rows = [list(d.values()) for d in input_data]
                return np.array(rows)
            return np.array(input_data)
        
        elif isinstance(input_data, np.ndarray):
            return input_data
        
        return np.array(input_data)
    
    def _predict_classifier(self, X: np.ndarray) -> Dict[str, Any]:
        """Predict for classification model."""
        predicted_classes = self._model.predict(X)
        predicted_classes = predicted_classes.tolist() if hasattr(predicted_classes, 'tolist') else predicted_classes
        
        if hasattr(self._model, 'predict_proba'):
            probabilities = self._model.predict_proba(X)
            probabilities = probabilities.tolist() if hasattr(probabilities, 'tolist') else probabilities
            return {
                "predicted_class": predicted_classes,
                "probabilities": probabilities
            }
        
        return {"predicted_class": predicted_classes}
    
    def _predict_regressor(self, X: np.ndarray) -> Dict[str, Any]:
        """Predict for regression model."""
        predictions = self._model.predict(X)
        scores = predictions.tolist() if hasattr(predictions, 'tolist') else predictions
        return {"scores": scores}


class XGBoostModelWrapper:
    """Wrapper for XGBoost models (Booster or sklearn API)."""
    
    def __init__(
        self,
        model: Any,
        feature_order: Optional[List[str]] = None,
        is_sklearn_api: bool = False,
    ):
        self._model = model
        self._feature_order = feature_order
        self._is_sklearn_api = is_sklearn_api
    
    @property
    def raw_model(self) -> Any:
        return self._model
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        import xgboost as xgb
        
        logger.debug(f"XGBoost predict: is_sklearn_api={self._is_sklearn_api}, feature_order={self._feature_order}")
        
        if not self._is_sklearn_api and self._feature_order:
            X = self._prepare_dataframe_input(input_data)
        else:
            X = self._prepare_array_input(input_data)
        
        if self._is_sklearn_api:
            return self._predict_sklearn_api(X)
        else:
            return self._predict_booster(X, xgb)
    
    def _prepare_dataframe_input(self, input_data: Any) -> pd.DataFrame:
        """Prepare input as DataFrame to preserve feature names for Booster."""
        if isinstance(input_data, dict):
            return pd.DataFrame([{k: input_data[k] for k in self._feature_order}])
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            return pd.DataFrame([{k: d[k] for k in self._feature_order} for d in input_data])
        elif isinstance(input_data, pd.DataFrame):
            return input_data[self._feature_order] if list(input_data.columns) != self._feature_order else input_data
        else:
            X_array = self._prepare_array_input(input_data)
            return pd.DataFrame(X_array, columns=self._feature_order)
    
    def _prepare_array_input(self, input_data: Any) -> np.ndarray:
        """Prepare input as numpy array."""
        if isinstance(input_data, pd.DataFrame):
            if self._feature_order:
                return input_data[self._feature_order].values.astype(np.float64)
            return input_data.values.astype(np.float64)
        elif isinstance(input_data, dict):
            if self._feature_order:
                values = [input_data[k] for k in self._feature_order]
            else:
                values = list(input_data.values())
            return np.array([values], dtype=np.float64)
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            if self._feature_order:
                rows = [[d[k] for k in self._feature_order] for d in input_data]
            else:
                rows = [list(d.values()) for d in input_data]
            return np.array(rows, dtype=np.float64)
        elif isinstance(input_data, np.ndarray):
            return input_data.astype(np.float64)
        return np.array(input_data, dtype=np.float64)
    
    def _predict_sklearn_api(self, X: Any) -> Dict[str, Any]:
        """Predict using sklearn-style API."""
        if hasattr(self._model, 'predict_proba'):
            predictions = self._model.predict_proba(X)
            if predictions.ndim == 2 and predictions.shape[1] == 2:
                scores = predictions[:, 1].tolist()
            else:
                scores = predictions.tolist()
        else:
            predictions = self._model.predict(X)
            scores = predictions.tolist()
        return {"scores": scores}
    
    def _predict_booster(self, X: pd.DataFrame, xgb) -> Dict[str, Any]:
        """Predict using raw Booster API."""
        logger.debug(f"Creating DMatrix from {type(X).__name__}")
        if isinstance(X, pd.DataFrame):
            logger.debug(f"DataFrame columns: {X.columns.tolist()}")
            dmatrix = xgb.DMatrix(X, feature_names=X.columns.tolist())
        else:
            dmatrix = xgb.DMatrix(X)
        predictions = self._model.predict(dmatrix)
        return {"scores": predictions.tolist()}


class LightGBMModelWrapper:
    """Wrapper for LightGBM models (Booster or sklearn API)."""
    
    def __init__(
        self,
        model: Any,
        feature_order: Optional[List[str]] = None,
        is_sklearn_api: bool = False,
    ):
        self._model = model
        self._feature_order = feature_order
        self._is_sklearn_api = is_sklearn_api
    
    @property
    def raw_model(self) -> Any:
        return self._model
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        X = self._prepare_input(input_data)
        
        if self._is_sklearn_api:
            if hasattr(self._model, 'predict_proba'):
                predictions = self._model.predict_proba(X)
                if predictions.ndim == 2 and predictions.shape[1] == 2:
                    scores = predictions[:, 1].tolist()
                else:
                    scores = predictions.tolist()
            else:
                predictions = self._model.predict(X)
                scores = predictions.tolist()
        else:
            predictions = self._model.predict(X)
            scores = predictions.tolist()
        
        return {"scores": scores}
    
    def _prepare_input(self, input_data: Any) -> np.ndarray:
        """Prepare input as numpy array."""
        feature_order = self._feature_order
        
        if isinstance(input_data, pd.DataFrame):
            if feature_order:
                return input_data[feature_order].values.astype(np.float64)
            return input_data.values.astype(np.float64)
        elif isinstance(input_data, dict):
            if feature_order:
                values = [input_data[k] for k in feature_order]
            else:
                values = list(input_data.values())
            return np.array([values], dtype=np.float64)
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            if feature_order:
                rows = [[d[k] for k in feature_order] for d in input_data]
            else:
                rows = [list(d.values()) for d in input_data]
            return np.array(rows, dtype=np.float64)
        elif isinstance(input_data, np.ndarray):
            return input_data.astype(np.float64)
        return np.array(input_data, dtype=np.float64)


class CatBoostModelWrapper:
    """Wrapper for CatBoost models."""
    
    def __init__(
        self,
        model: Any,
        feature_order: Optional[List[str]] = None,
        model_type: str = "classifier",
    ):
        self._model = model
        self._feature_order = feature_order
        self._model_type = model_type
    
    @property
    def raw_model(self) -> Any:
        return self._model
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        X = self._prepare_input(input_data)
        
        if self._model_type == "classifier":
            predictions = self._model.predict_proba(X)
            if predictions.ndim == 2 and predictions.shape[1] == 2:
                scores = predictions[:, 1].tolist()
            else:
                scores = predictions.tolist()
        else:
            predictions = self._model.predict(X)
            scores = predictions.tolist() if hasattr(predictions, 'tolist') else predictions
        
        return {"scores": scores}
    
    def _prepare_input(self, input_data: Any) -> np.ndarray:
        """Prepare input as numpy array."""
        feature_order = self._feature_order
        
        if isinstance(input_data, pd.DataFrame):
            if feature_order:
                return input_data[feature_order].values.astype(np.float64)
            return input_data.values.astype(np.float64)
        elif isinstance(input_data, dict):
            if feature_order:
                values = [input_data[k] for k in feature_order]
            else:
                values = list(input_data.values())
            return np.array([values], dtype=np.float64)
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            if feature_order:
                rows = [[d[k] for k in feature_order] for d in input_data]
            else:
                rows = [list(d.values()) for d in input_data]
            return np.array(rows, dtype=np.float64)
        elif isinstance(input_data, np.ndarray):
            return input_data.astype(np.float64)
        return np.array(input_data, dtype=np.float64)


class PyTorchModelWrapper:
    """Wrapper for PyTorch models."""
    
    def __init__(
        self,
        model: Any,
        feature_order: Optional[List[str]] = None,
        device: str = "cpu",
    ):
        self._model = model
        self._feature_order = feature_order
        self._device = device
    
    @property
    def raw_model(self) -> Any:
        return self._model
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        import torch
        
        X = self._prepare_input(input_data)
        tensor_input = torch.tensor(X, dtype=torch.float32, device=self._device)
        
        with torch.no_grad():
            output = self._model(tensor_input)
        
        # Convert to numpy/list
        if isinstance(output, torch.Tensor):
            predictions = output.cpu().numpy()
        elif isinstance(output, tuple):
            predictions = output[0].cpu().numpy()
        else:
            predictions = output
        
        scores = predictions.tolist() if hasattr(predictions, 'tolist') else predictions
        
        # Flatten single-element predictions
        if isinstance(scores, list) and len(scores) == 1:
            if isinstance(scores[0], list) and len(scores[0]) == 1:
                scores = [scores[0][0]]
        
        return {"scores": scores}
    
    def _prepare_input(self, input_data: Any) -> np.ndarray:
        """Prepare input as numpy array."""
        feature_order = self._feature_order
        
        if isinstance(input_data, pd.DataFrame):
            if feature_order:
                return input_data[feature_order].values.astype(np.float64)
            return input_data.values.astype(np.float64)
        elif isinstance(input_data, dict):
            if feature_order:
                values = [input_data[k] for k in feature_order]
            else:
                values = list(input_data.values())
            return np.array([values], dtype=np.float64)
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            if feature_order:
                rows = [[d[k] for k in feature_order] for d in input_data]
            else:
                rows = [list(d.values()) for d in input_data]
            return np.array(rows, dtype=np.float64)
        elif isinstance(input_data, np.ndarray):
            return input_data.astype(np.float64)
        return np.array(input_data, dtype=np.float64)


class TensorFlowModelWrapper:
    """Wrapper for TensorFlow/Keras models."""
    
    def __init__(
        self,
        model: Any,
        feature_order: Optional[List[str]] = None,
    ):
        self._model = model
        self._feature_order = feature_order
    
    @property
    def raw_model(self) -> Any:
        return self._model
    
    def predict(self, input_data: Any) -> Dict[str, Any]:
        import tensorflow as tf
        
        X = self._prepare_input(input_data)
        tensor_input = tf.convert_to_tensor(X, dtype=tf.float32)
        
        # Make prediction based on model type
        if hasattr(self._model, 'predict'):
            predictions = self._model.predict(tensor_input, verbose=0)
        elif hasattr(self._model, '__call__'):
            predictions = self._model(tensor_input)
            if isinstance(predictions, tf.Tensor):
                predictions = predictions.numpy()
        elif hasattr(self._model, 'signatures'):
            serving_fn = self._model.signatures.get('serving_default')
            if serving_fn:
                result = serving_fn(tensor_input)
                if isinstance(result, dict):
                    output_key = list(result.keys())[0]
                    predictions = result[output_key].numpy()
                else:
                    predictions = result.numpy()
            else:
                raise RuntimeError("SavedModel has no serving_default signature")
        else:
            raise RuntimeError(f"Model type {type(self._model)} not supported")
        
        scores = predictions.tolist() if hasattr(predictions, 'tolist') else predictions
        
        # Flatten nested lists for single predictions
        if isinstance(scores, list) and len(scores) == 1 and isinstance(scores[0], list):
            if len(scores[0]) == 1:
                scores = [scores[0][0]]
        
        return {"scores": scores}
    
    def _prepare_input(self, input_data: Any) -> np.ndarray:
        """Prepare input as numpy array."""
        feature_order = self._feature_order
        
        if isinstance(input_data, pd.DataFrame):
            if feature_order:
                return input_data[feature_order].values.astype(np.float64)
            return input_data.values.astype(np.float64)
        elif isinstance(input_data, dict):
            if feature_order:
                values = [input_data[k] for k in feature_order]
            else:
                values = list(input_data.values())
            return np.array([values], dtype=np.float64)
        elif isinstance(input_data, list) and input_data and isinstance(input_data[0], dict):
            if feature_order:
                rows = [[d[k] for k in feature_order] for d in input_data]
            else:
                rows = [list(d.values()) for d in input_data]
            return np.array(rows, dtype=np.float64)
        elif isinstance(input_data, np.ndarray):
            return input_data.astype(np.float64)
        return np.array(input_data, dtype=np.float64)

