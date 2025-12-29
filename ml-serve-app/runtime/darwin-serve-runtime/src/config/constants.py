"""Application constants for Darwin serve runtime."""

from datetime import datetime
from typing import Any

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