"""Type conversion utilities for MLflow schema compatibility."""

import numpy as np
from typing import Any


def convert_to_schema_dtype(value: Any, mlflow_type: str) -> Any:
    """
    Convert a single value to the expected dtype based on MLflow schema type.
    
    MLflow's schema enforcement is strict and rejects type mismatches even when
    the conversion is mathematically safe (e.g., int64 → float64).
    This function converts values to match the expected schema type.
    
    Args:
        value: The input value to convert
        mlflow_type: The MLflow type name from the schema (e.g., "double", "long")
        
    Returns:
        The value converted to the appropriate Python type
        
    Examples:
        >>> convert_to_schema_dtype(3, "double")  # Returns 3.0
        >>> convert_to_schema_dtype(3.5, "long")  # Returns 3
        >>> convert_to_schema_dtype("hello", "string")  # Returns "hello"
    """
    if value is None:
        return value
    
    try:
        # Direct conversion based on MLflow type
        if mlflow_type in ("double", "float"):
            return float(value)
        elif mlflow_type in ("long", "integer"):
            return int(value)
        elif mlflow_type == "boolean":
            return bool(value)
        elif mlflow_type == "string":
            return str(value)
        else:
            # For binary, datetime, object, tensor - return as-is
            return value
    except (ValueError, TypeError):
        return value


