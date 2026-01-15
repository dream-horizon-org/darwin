from fastapi import FastAPI, HTTPException, Path, Query, Header
from typing import Optional, Any, List, Dict
import logging
from src.app_layer.container import Container
from src.app_layer.api import endpoints
from ddtrace import patch
from ddtrace.runtime import RuntimeMetrics
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RuntimeMetrics.enable()
patch(fastapi=True)
# Initialize FastAPI app
app = FastAPI(
    title="{{ cookiecutter.repository_name }} model serve",
    description="{{ cookiecutter.repository_description }}",
)
app.include_router(endpoints.router)  # include the endpoints from the endpoints module
# Initialize container
container = Container()


@app.get("/healthcheck")
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "SUCCESS", "message": "OK"}
