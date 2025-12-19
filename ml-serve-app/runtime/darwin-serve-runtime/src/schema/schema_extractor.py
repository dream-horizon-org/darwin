"""Extract schema information from MLflow model signatures."""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
import pandas as pd


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
    
    # Map MLflow types to human-readable types
    MLFLOW_TYPE_MAP = {
        "double": "double",
        "float": "float",
        "long": "long",
        "integer": "integer",
        "int": "integer",
        "string": "string",
        "boolean": "boolean",
        "bool": "boolean",
        "binary": "binary",
        "datetime": "datetime",
        "object": "object",
    }
    
    def __init__(self, mlflow_model: Any):
        """
        Initialize with an MLflow pyfunc model.
        
        Args:
            mlflow_model: Model loaded via mlflow.pyfunc.load_model()
        """
        self._model = mlflow_model
        self._signature = None
        self._input_example = None
        self._extract_metadata()
    
    def _extract_metadata(self) -> None:
        """Extract signature and input example from model metadata."""
        if hasattr(self._model, 'metadata') and self._model.metadata:
            metadata = self._model.metadata
            
            # Extract signature
            if hasattr(metadata, 'signature') and metadata.signature:
                self._signature = metadata.signature
            
            # Extract input example (stored in saved_input_example_info)
            if hasattr(metadata, 'saved_input_example_info'):
                self._input_example = self._load_input_example()
    
    def _load_input_example(self) -> Optional[Dict[str, Any]]:
        """Load input example from model artifacts."""
        try:
            # MLflow stores input example in the model directory
            if hasattr(self._model, '_model_meta') and self._model._model_meta:
                example_info = self._model._model_meta.saved_input_example_info
                if example_info:
                    # The example is typically stored as a pandas DataFrame artifact
                    artifact_path = example_info.get('artifact_path')
                    if artifact_path and hasattr(self._model, '_model_impl'):
                        # Try to load from the model's artifact path
                        pass
        except Exception:
            pass
        
        # Fallback: try to get from metadata directly
        try:
            if hasattr(self._model, 'metadata'):
                metadata = self._model.metadata
                if hasattr(metadata, 'get_input_example'):
                    example = metadata.get_input_example()
                    if example is not None:
                        if isinstance(example, pd.DataFrame):
                            return example.iloc[0].to_dict()
                        elif isinstance(example, dict):
                            return example
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
            if isinstance(schema_dict, list):
                for col in schema_dict:
                    col_type = col.get('type', 'object')
                    # Handle nested type info
                    if isinstance(col_type, dict):
                        col_type = col_type.get('type', 'object')
                    
                    columns.append(ColumnSchema(
                        name=col.get('name', 'unknown'),
                        type=self.MLFLOW_TYPE_MAP.get(str(col_type), str(col_type)),
                        required=col.get('required', True)
                    ).to_dict())
        elif hasattr(schema, 'input_names'):
            # ColSpec schema
            for name in schema.input_names():
                col_type = schema.input_types().get(name, 'object')
                columns.append(ColumnSchema(
                    name=name,
                    type=self.MLFLOW_TYPE_MAP.get(str(col_type), str(col_type)),
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
                        "type": self.MLFLOW_TYPE_MAP.get(str(col_type), str(col_type))
                    })
            else:
                # Single output type
                columns.append({
                    "name": "prediction",
                    "type": self.MLFLOW_TYPE_MAP.get(str(schema_dict), str(schema_dict))
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

