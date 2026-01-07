import logging
import math
from typing import Optional

from ml_serve_core.client.mlflow_client import MLflowClient

logger = logging.getLogger(__name__)


class StrategySelector:
    """
    Pick storage strategy based on model size thresholds.
    
    Strategies:
    - emptydir: For small models (<1GB) or unknown size. Downloads to pod-local storage.
    - pvc: For medium/large models (>=1GB). Uses shared PVC cache for node-level caching.
    
    Thresholds:
    - SMALL_GB: Models smaller than this use emptydir (default: 1.0GB)
    - LARGE_GB: Models at or above this always use pvc (default: 5.0GB)
    - Mid-range (1-5GB): Currently defaults to pvc to optimize for pod churn
    """

    SMALL_GB = 1.0  # <1GB -> emptydir
    LARGE_GB = 5.0  # >=5GB -> pvc

    def select(self, model_size_bytes: Optional[int]) -> str:
        """
        Select optimal storage strategy based on model size.
        
        Args:
            model_size_bytes: Model size in bytes, or None if unknown
            
        Returns:
            Storage strategy: 'emptydir' or 'pvc'
        """
        if not model_size_bytes:
            return "emptydir"
        size_gb = model_size_bytes / (1024 ** 3)
        if size_gb < self.SMALL_GB:
            return "emptydir"
        if size_gb >= self.LARGE_GB:
            return "pvc"
        # mid-range: choose pvc to avoid repeated downloads on churn
        return "pvc"

    def format_size(self, model_size_bytes: Optional[int]) -> str:
        """Format byte size in human-readable format."""
        if not model_size_bytes:
            return "unknown"
        size = float(model_size_bytes)
        units = ["B", "KB", "MB", "GB", "TB"]
        idx = int(min(len(units) - 1, math.floor(math.log(size, 1024)))) if size > 0 else 0
        return f"{size / (1024 ** idx):.2f} {units[idx]}"


async def determine_storage_strategy(
    user_strategy: str,
    model_uri: str,
    mlflow_client: MLflowClient,
) -> str:
    """
    Determine the storage strategy for a model deployment.

    Args:
        user_strategy: One of "auto", "emptydir", or "pvc".
        model_uri: MLflow model URI to evaluate.
        mlflow_client: Initialized MLflowClient to use for size detection.

    Returns:
        Either "emptydir" or "pvc".

    Raises:
        ValueError: If the requested strategy is not supported.
    """
    selector = StrategySelector()
    if user_strategy == "auto":
        model_size_bytes = await mlflow_client.get_model_size(model_uri)
        storage_strategy = selector.select(model_size_bytes)
        model_size_str = selector.format_size(model_size_bytes) if model_size_bytes else "unknown"
        logger.info(f"Model size {model_size_str} recommends strategy: {storage_strategy}")
    else:
        storage_strategy = user_strategy
        logger.info(f"Using user-specified storage strategy: {storage_strategy}")

    if storage_strategy not in {"emptydir", "pvc"}:
        raise ValueError("Unsupported storage_strategy '{}'".format(storage_strategy))

    return storage_strategy
