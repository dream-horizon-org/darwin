"""Data processing utilities for MLflow model input preparation."""

from typing import Any, Dict, List
import pandas as pd

from src.config.constants import MLFLOW_TO_NUMPY_DTYPE_MAP


def prepare_model_input_dataframe(
    features: Dict[str, Any], 
    schema: List[Dict[str, Any]]
) -> pd.DataFrame:
    """
    Convert features dict to a pandas DataFrame with dtypes matching the model schema.
    
    This function creates a DataFrame with correct dtypes based on the model's
    logged signature, so users don't need to worry about type conversions.
    
    Args:
        features: Dictionary of feature names to values
        schema: List of column definitions with 'name' and 'type'
        
    Returns:
        pandas DataFrame with correct dtypes ready for MLflow prediction
        
    Example:
        >>> schema = [
        ...     {"name": "age", "type": "long"},
        ...     {"name": "income", "type": "double"}
        ... ]
        >>> features = {"age": 25, "income": 50000.0}
        >>> df = prepare_model_input_dataframe(features, schema)
        >>> df.dtypes["age"]
        dtype('int64')
    """
    # Create mapping of column names to their expected types
    schema_map = {col["name"]: col["type"] for col in schema}
    
    # Create DataFrame with single row
    df = pd.DataFrame([features])
    
    # Convert each column to the dtype expected by the model schema
    for col_name in df.columns:
        schema_type = schema_map.get(col_name)
        if schema_type and schema_type in MLFLOW_TO_NUMPY_DTYPE_MAP:
            try:
                df[col_name] = df[col_name].astype(
                    MLFLOW_TO_NUMPY_DTYPE_MAP[schema_type]
                )
            except (ValueError, TypeError):
                # If conversion fails, let MLflow provide a clear error message
                pass
    
    return df

