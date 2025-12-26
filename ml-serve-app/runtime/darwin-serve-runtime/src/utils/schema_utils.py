"""
Schema utility functions for MLflow model handling.

Provides shared functionality for:
- Loading schema from MLmodel YAML files
- Loading input examples from artifact files
- TensorSpec schema detection and expansion

These utilities are used by both native loaders and pyfunc loaders
to extract schema information without loading the model.
"""

import os
import json
from typing import Any, Dict, List, Optional, Tuple

import yaml

from src.config.logger import logger


def load_schema_from_mlmodel(model_path: str) -> Optional[Dict[str, Any]]:
    """
    Load schema directly from MLmodel YAML file without loading the model.
    
    This enables /schema API to work instantly without model deserialization.
    
    Args:
        model_path: Path to the model directory containing MLmodel file
        
    Returns:
        Schema dict with inputs, outputs, and input_example, or None if not found
    """
    try:
        mlmodel_path = os.path.join(model_path, "MLmodel")
        if not os.path.exists(mlmodel_path):
            logger.debug(f"MLmodel file not found at {mlmodel_path}")
            return None
        
        with open(mlmodel_path, 'r') as f:
            mlmodel = yaml.safe_load(f)
        
        signature = mlmodel.get("signature", {})
        if not signature:
            logger.debug("No signature found in MLmodel file")
            return None
        
        # Parse signature inputs/outputs from JSON strings
        inputs_str = signature.get("inputs", "[]")
        outputs_str = signature.get("outputs", "[]")
        
        inputs = json.loads(inputs_str) if isinstance(inputs_str, str) else inputs_str
        outputs = json.loads(outputs_str) if isinstance(outputs_str, str) else outputs_str
        
        # Load input example if available
        input_example = load_input_example_from_file(model_path, mlmodel)
        
        return {
            "inputs": inputs,
            "outputs": outputs,
            "input_example": input_example,
        }
    except Exception as e:
        logger.warning(f"Could not load schema from MLmodel file: {e}")
        return None


def load_input_example_from_file(
    model_path: str, mlmodel: Dict
) -> Optional[Dict[str, Any]]:
    """
    Load input example from artifact file.
    
    Handles multiple formats:
    - Pandas split format: {"columns": [...], "data": [[...]]}
    - Serving format: {"dataframe_split": {"columns": [...], "data": [[...]]}}
    
    Args:
        model_path: Path to the model directory
        mlmodel: Parsed MLmodel YAML content
        
    Returns:
        Input example as dict, or None if not found
    """
    try:
        example_info = mlmodel.get("saved_input_example_info", {})
        if not example_info:
            return None
        
        artifact_path = example_info.get("artifact_path")
        if not artifact_path:
            return None
        
        example_file = os.path.join(model_path, artifact_path)
        if not os.path.exists(example_file):
            return None
        
        with open(example_file, 'r') as f:
            example_data = json.load(f)
        
        # Handle pandas split format
        if isinstance(example_data, dict):
            if "columns" in example_data and "data" in example_data:
                # Pandas split format: {"columns": [...], "data": [[...]]}
                columns = example_data["columns"]
                data = example_data["data"][0] if example_data["data"] else []
                return dict(zip(columns, data))
            elif "dataframe_split" in example_data:
                # Serving format: {"dataframe_split": {"columns": [...], "data": [[...]]}}
                split = example_data["dataframe_split"]
                columns = split.get("columns", [])
                data = split.get("data", [[]])[0]
                return dict(zip(columns, data))
        return example_data
    except Exception as e:
        logger.debug(f"Could not load input example: {e}")
        return None


def infer_mlflow_type(value: Any) -> str:
    """
    Infer MLflow schema type from a Python value.
    
    Maps Python types to MLflow type names:
    - float -> "double"
    - int -> "long"
    - bool -> "boolean"
    - str -> "string"
    - other -> "double" (default for numeric)
    
    Args:
        value: Python value to infer type from
        
    Returns:
        MLflow type name string
    """
    if isinstance(value, float):
        return "double"
    elif isinstance(value, bool):
        # Note: bool check must come before int (bool is subclass of int)
        return "boolean"
    elif isinstance(value, int):
        return "long"
    elif isinstance(value, str):
        return "string"
    else:
        return "double"  # Default to double for numeric


def is_tensor_spec_schema(inputs: List[Dict]) -> bool:
    """
    Check if the input schema is a TensorSpec (tensor-based) schema.
    
    TensorSpec schemas are used by TensorFlow, PyTorch, and other deep learning
    frameworks. They define tensors with shape and dtype rather than individual
    column names like ColSpec.
    
    Args:
        inputs: List of input schema dicts from MLmodel signature
        
    Returns:
        True if schema is TensorSpec, False if ColSpec or unknown
    """
    if not inputs or not isinstance(inputs, list):
        return False
    
    first_col = inputs[0]
    col_type = first_col.get('type', '')
    
    # Check for 'tensor' in the type field (common case)
    if isinstance(col_type, str):
        col_type_lower = col_type.lower()
        if 'tensor' in col_type_lower:
            return True
        # Also check for dtype indicators like 'float64', 'float32', 'int64'
        if any(dt in col_type_lower for dt in ['float32', 'float64', 'int32', 'int64']):
            return True
    
    # Check for 'tensor-spec' anywhere in the dict representation
    first_col_str = str(first_col).lower()
    if 'tensor' in first_col_str:
        return True
    
    # Check if type is a dict with tensor info (MLflow tensor format)
    if isinstance(col_type, dict):
        if any(k in col_type for k in ['tensor-type', 'dtype', 'shape']):
            return True
    
    # Check for 'shape' key which indicates tensor schema
    if 'shape' in first_col:
        return True
    
    return False


def expand_tensor_schema(input_example: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Expand a TensorSpec schema to individual feature names using input_example.
    
    This transforms {"name": "dense_input", "type": "tensor"} into a list of
    individual feature columns derived from the input_example's keys.
    
    Args:
        input_example: Dict of feature names to example values
        
    Returns:
        Tuple of:
        - List of dicts with 'name', 'type', 'required' keys
        - List of feature names in order (feature_order)
    """
    columns = []
    feature_order = list(input_example.keys())
    
    for name, value in input_example.items():
        columns.append({
            "name": name,
            "type": infer_mlflow_type(value),
            "required": True
        })
    
    return columns, feature_order

