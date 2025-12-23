"""
Centralized logging configuration for Darwin Serve Runtime.

Uses loguru for modern, structured logging with:
- stdout output (essential for Kubernetes log aggregation)
- Optional file output
- JSON format in production, human-readable in development
- Request ID context for distributed tracing

Usage:
    from src.config.logger import logger
    
    logger.info("Model loaded successfully")
    logger.error("Prediction failed", exc_info=True)
    logger.debug("Input features", features=features)
"""

import os
import sys
import json
from contextvars import ContextVar
from typing import Any, Dict

from loguru import logger

# Context variable for request tracing
request_id_var: ContextVar[str] = ContextVar("request_id", default="startup")

# Environment configuration
ENV = os.getenv("ENV", "local")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = os.getenv("LOG_FORMAT", "text")  # "text" or "json"
LOG_FILE = os.getenv("LOG_FILE", "")  # Optional file path
SERVICE_NAME = os.getenv("SERVICE_NAME", "darwin-serve-runtime")


def get_request_id() -> str:
    """Get current request ID from context."""
    return request_id_var.get()


def set_request_id(request_id: str) -> None:
    """Set request ID in context for current request."""
    request_id_var.set(request_id)


def json_serializer(record: Dict[str, Any]) -> str:
    """
    Serialize log record to JSON format.
    Suitable for production environments with log aggregation (ELK, Datadog, etc.)
    """
    subset = {
        "timestamp": record["time"].strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "level": record["level"].name,
        "message": record["message"],
        "service": SERVICE_NAME,
        "request_id": record["extra"].get("request_id", get_request_id()),
        "module": record["name"],
        "function": record["function"],
        "line": record["line"],
    }
    
    # Add exception info if present
    if record["exception"]:
        subset["exception"] = {
            "type": record["exception"].type.__name__ if record["exception"].type else None,
            "value": str(record["exception"].value) if record["exception"].value else None,
            "traceback": record["exception"].traceback if record["exception"].traceback else None,
        }
    
    # Add any extra fields
    for key, value in record["extra"].items():
        if key not in ("request_id",):
            try:
                json.dumps(value)  # Check if serializable
                subset[key] = value
            except (TypeError, ValueError):
                subset[key] = str(value)
    
    return json.dumps(subset)


def json_format(record: Dict[str, Any]) -> str:
    """Format function for JSON output."""
    record["extra"]["request_id"] = get_request_id()
    return json_serializer(record) + "\n"


def text_format(record: Dict[str, Any]) -> str:
    """
    Format function for human-readable text output.
    Suitable for local development.
    """
    record["extra"]["request_id"] = get_request_id()
    return (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{extra[request_id]: <12}</cyan> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>\n"
    )


def configure_logging() -> None:
    """
    Configure loguru logger with appropriate handlers.
    
    Call this once at application startup (before creating FastAPI app).
    """
    # Remove default handler
    logger.remove()
    
    # Determine format based on environment
    if LOG_FORMAT == "json" or ENV not in ("local", "development", "dev"):
        format_func = json_format
        colorize = False
    else:
        format_func = text_format
        colorize = True
    
    # Always add stdout handler (essential for Kubernetes)
    logger.add(
        sys.stdout,
        format=format_func,
        level=LOG_LEVEL,
        colorize=colorize,
        backtrace=True,
        diagnose=ENV in ("local", "development", "dev"),  # Only in dev
    )
    
    # Optionally add file handler
    if LOG_FILE:
        logger.add(
            LOG_FILE,
            format=json_format,  # Always JSON for files
            level=LOG_LEVEL,
            rotation="100 MB",
            retention="7 days",
            compression="gz",
            backtrace=True,
            diagnose=False,
        )
    
    # Log startup info
    logger.info(
        "Logging configured",
        env=ENV,
        level=LOG_LEVEL,
        format=LOG_FORMAT,
        file=LOG_FILE or "none",
    )


# Configure logging on module import
configure_logging()

# Export the configured logger
__all__ = ["logger", "get_request_id", "set_request_id", "request_id_var"]

