"""Application constants including type mappings for MLflow schema handling."""

import numpy as np
from datetime import datetime
from typing import Any

# Application Constants
MAX_WORKERS = 10

# ============================================================================
# MLflow Type Mappings
# ============================================================================
# These mappings handle type conversions at different stages of the pipeline:
# 1. Schema extraction (normalization)
# 2. DataFrame conversion (numpy dtypes)
# 3. API validation (Python types)
# 4. OpenAPI documentation (JSON Schema types)

# Type Normalization Map
# Maps various MLflow type aliases to canonical MLflow type names
# Used during schema extraction to normalize type names from model signatures
MLFLOW_TYPE_NORMALIZATION_MAP = {
    "double": "double",
    "float": "float",
    "float64": "double",
    "float32": "float",
    "long": "long",
    "int64": "long",
    "integer": "integer",
    "int32": "integer",
    "int": "integer",
    "string": "string",
    "boolean": "boolean",
    "bool": "boolean",
    "binary": "binary",
    "datetime": "datetime",
    "object": "object",
    "tensor": "tensor",
}

# NumPy Dtype Map
# Maps MLflow types to NumPy/Pandas dtypes for DataFrame creation
# Used when preparing input data for MLflow model prediction
# MLflow type conventions:
#   "double" = float64 (sklearn, XGBoost default)
#   "float"  = float32 (PyTorch default)
#   "long"   = int64
#   "integer" = int32
MLFLOW_TO_NUMPY_DTYPE_MAP = {
    "double": np.float64,
    "float": np.float32,
    "long": np.int64,
    "integer": np.int32,
    "boolean": bool,
    "string": object,
    "binary": object,
    "datetime": object,
    "object": object,
}

# Python Type Map
# Maps MLflow types to Python types for Pydantic model generation
# Used for FastAPI request validation and type checking
MLFLOW_TO_PYTHON_TYPE_MAP = {
    "double": float,
    "float": float,
    "long": int,
    "integer": int,
    "string": str,
    "boolean": bool,
    "binary": bytes,
    "datetime": datetime,
    "object": Any,
}

# JSON Schema Type Map
# Maps MLflow types to JSON Schema types for OpenAPI documentation
# Used when generating API documentation and schema definitions
MLFLOW_TO_JSON_SCHEMA_TYPE_MAP = {
    "double": "number",
    "float": "number",
    "long": "integer",
    "integer": "integer",
    "string": "string",
    "boolean": "boolean",
    "binary": "string",  # Base64 encoded
    "datetime": "string",  # ISO format
    "object": "object",
}
