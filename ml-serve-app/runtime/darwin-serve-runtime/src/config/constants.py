"""Application constants for Darwin serve runtime."""

from datetime import datetime
from typing import Any, Dict, List

# Application Constants
MAX_WORKERS = 10

# MLflow to Python Type Map
# Required for Pydantic dynamic model generation.
# Python doesn't understand MLflow type names like "double", "long", "integer".
# These are MLflow's naming conventions (from Java/Spark), not Python types.
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

# Default flavor used when detection fails
DEFAULT_FLAVOR = "sklearn"

# Model Flavor to Image Category Mapping
# This is the single source of truth for flavor categorization.
# Used by both cluster-manager (for image selection) and runtime (for loader selection).
#
# Design rationale:
# - Groups similar frameworks that share dependencies into categories
# - Each category has its own Docker image with optimized dependencies
# - sklearn is the lightest and used as default fallback
FLAVOR_TO_IMAGE_CATEGORY: Dict[str, str] = {
    # Scikit-learn
    "sklearn": "sklearn",
    
    # Boosting models (share similar APIs and dependencies)
    "xgboost": "boosting",
    "lightgbm": "boosting",
    "catboost": "boosting",
    
    # Deep learning - PyTorch ecosystem
    "pytorch": "pytorch",
    "torch": "pytorch",
    
    # Deep learning - TensorFlow/Keras ecosystem
    "tensorflow": "tensorflow",
    "keras": "tensorflow",
    "tf": "tensorflow",
    
    # Default fallback (sklearn image is lightest)
    "python_function": DEFAULT_FLAVOR,
}

# Flavor to Loader Type Mapping
# Determines which loader implementation to use for each flavor.
# 'native' = use framework-specific native loader (better performance)
# 'pyfunc' = use MLflow pyfunc loader (fallback/generic)
FLAVOR_TO_LOADER: Dict[str, str] = {
    "sklearn": "native",
    "xgboost": "native",
    "lightgbm": "native",
    "catboost": "native",
    "pytorch": "native",
    "tensorflow": "native",
    "keras": "native",
    "python_function": "pyfunc",  # Generic pyfunc models always use pyfunc
}

# Priority order for flavor detection from MLmodel file
# Check specific flavors first, then fall back to python_function
FLAVOR_PRIORITY_ORDER: List[str] = [
    "sklearn",
    "xgboost",
    "lightgbm",
    "catboost",
    "pytorch",
    "tensorflow",
    "keras",
]