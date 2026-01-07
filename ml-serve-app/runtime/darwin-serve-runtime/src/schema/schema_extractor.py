"""Extract schema information from MLflow model signatures."""

from collections import OrderedDict
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import pandas as pd

from src.utils.schema_utils import is_tensor_spec_schema, infer_mlflow_type


@dataclass
class ColumnSchema:
    """Schema for a single column/feature."""
    name: str
    type: str
    required: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "type": self.type,
            "required": self.required
        }


class SchemaExtractor:
    """Extract and parse schema from MLflow model metadata."""
    
    def __init__(self, mlflow_model: Any):
        """
        Initialize with an MLflow pyfunc model.
        
        Args:
            mlflow_model: Model loaded via mlflow.pyfunc.load_model()
        """
        self._model = mlflow_model
        self._signature = None
        self._input_example = None
        self._feature_order: Optional[List[str]] = None  # Store feature order for TensorSpec models
        self._is_tensor_spec = False  # Flag to indicate if model uses TensorSpec
        self._extract_metadata()
    
    def _extract_metadata(self) -> None:
        """Extract signature and input example from model metadata."""
        if hasattr(self._model, 'metadata') and self._model.metadata:
            metadata = self._model.metadata
            
            # Extract signature
            if hasattr(metadata, 'signature') and metadata.signature:
                self._signature = metadata.signature
            
            self._input_example = self._load_input_example()
    
    def _process_example(self, example: Any) -> Optional[Dict[str, Any]]:
        """Process an input example into a dict with feature order."""
        try:
            if isinstance(example, pd.DataFrame):
                # Store column order for TensorSpec models
                self._feature_order = example.columns.tolist()
                # Use OrderedDict to preserve column order in the example
                return OrderedDict(
                    (col, float(example.iloc[0][col]) if hasattr(example.iloc[0][col], 'item') else example.iloc[0][col]) 
                    for col in example.columns
                )
            elif hasattr(example, 'tolist'):
                # NumPy array - can't derive feature names from this
                return None
            elif isinstance(example, dict):
                # If already a dict, try to preserve order
                self._feature_order = list(example.keys())
                return example
            elif isinstance(example, list) and example and isinstance(example[0], dict):
                # List of dicts - use first one
                self._feature_order = list(example[0].keys())
                return example[0]
        except Exception as e:
            pass  # Silently handle processing errors
        return None
    
    def _load_input_example(self) -> Optional[Dict[str, Any]]:
        """Load input example from model artifacts and store feature order
        """
        # Try direct access to input_example attribute (MLflow 3.x)
        # In recent MLflow versions, the PyFuncModel has input_example as a property
        try:
            if hasattr(self._model, 'input_example'):
                example = self._model.input_example
                if example is not None:
                    result = self._process_example(example)
                    if result:
                        return result
        except Exception:
            pass
        
        return None
    
    @property
    def has_signature(self) -> bool:
        """Check if the model has a signature."""
        return self._signature is not None
    
    @property
    def signature(self) -> Any:
        """Get the raw MLflow signature object."""
        return self._signature
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """
        Get the input schema as a list of column definitions.
        
        For TensorSpec models (like TensorFlow), if an input_example with column names
        is available, use those as feature names instead of the tensor name.
        
        Returns:
            List of dicts with 'name', 'type', 'required' keys
        """
        if not self._signature or not self._signature.inputs:
            return []
        
        columns = []
        schema = self._signature.inputs
        
        # Handle different schema formats
        if hasattr(schema, 'to_dict'):
            schema_dict = schema.to_dict()
            
            # Check if this is a TensorSpec schema
            if is_tensor_spec_schema(schema_dict):
                self._is_tensor_spec = True
                
                # For TensorSpec, use input_example columns if available
                if self._input_example and self._feature_order:
                    for name in self._feature_order:
                        value = self._input_example.get(name)
                        columns.append(ColumnSchema(
                            name=name,
                            type=infer_mlflow_type(value),
                            required=True
                        ).to_dict())
                    return columns
            
            # Standard ColSpec handling (or TensorSpec fallback)
            if isinstance(schema_dict, list):
                for col in schema_dict:
                    col_type = col.get('type', 'object')
                    # Handle nested type info
                    if isinstance(col_type, dict):
                        col_type = col_type.get('type', 'object')
                    
                    columns.append(ColumnSchema(
                        name=col.get('name', 'unknown'),
                        type=str(col_type),
                        required=col.get('required', True)
                    ).to_dict())
        elif hasattr(schema, 'input_names'):
            # ColSpec schema
            for name in schema.input_names():
                col_type = schema.input_types().get(name, 'object')
                columns.append(ColumnSchema(
                    name=name,
                    type=str(col_type),
                    required=True
                ).to_dict())
        
        return columns
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """
        Get the output schema as a list of column definitions.
        
        Returns:
            List of dicts with 'name', 'type' keys
        """
        if not self._signature or not self._signature.outputs:
            return []
        
        columns = []
        schema = self._signature.outputs
        
        if hasattr(schema, 'to_dict'):
            schema_dict = schema.to_dict()
            if isinstance(schema_dict, list):
                for col in schema_dict:
                    col_type = col.get('type', 'object')
                    if isinstance(col_type, dict):
                        col_type = col_type.get('type', 'object')
                    
                    columns.append({
                        "name": col.get('name', 'prediction'),
                        "type": str(col_type)
                    })
            else:
                # Single output type
                columns.append({
                    "name": "prediction",
                    "type": str(schema_dict)
                })
        
        return columns
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """
        Get the input example if available.
        
        Returns:
            Dict of feature names to example values, or None
        """
        return self._input_example
    
    def get_feature_names(self) -> List[str]:
        """Get list of input feature names."""
        return [col["name"] for col in self.get_input_schema()]
    
    def get_feature_order(self) -> Optional[List[str]]:
        """
        Get the ordered list of feature names for TensorSpec models.
        
        This is used to convert feature dictionaries to ordered arrays
        for models that expect tensor input (like TensorFlow).
        
        Returns:
            List of feature names in order, or None if not available
        """
        # Ensure schema is processed first
        if not self._feature_order:
            self.get_input_schema()
        return self._feature_order
    
    @property
    def is_tensor_spec(self) -> bool:
        """Check if the model uses TensorSpec signature."""
        # Ensure schema is processed first
        if not self._is_tensor_spec:
            self.get_input_schema()
        return self._is_tensor_spec
    
    def get_full_schema(self) -> Dict[str, Any]:
        """
        Get complete schema information.
        
        Returns:
            Dict containing inputs, outputs, and input_example
        """
        return {
            "inputs": self.get_input_schema(),
            "outputs": self.get_output_schema(),
            "input_example": self.get_input_example()
        }

