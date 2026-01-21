import asyncio
# Import OpenTelemetry first
from ml_serve_app_layer import otel_bootstrap

from os import environ

from fastapi.exceptions import RequestValidationError
from fastapi_utils.tasks import repeat_every
from loguru import logger
from pydantic import ValidationError
from starlette.requests import Request
from starlette.responses import JSONResponse

from ml_serve_app_layer.rest import serve, artifact, environment, deployment
from ml_serve_app_layer.utils.response_util import Response
from ml_serve_core.artifact_status_poller import ArtifactStatusPoller
from ml_serve_core.client.mysql_client import MysqlClient
from ml_serve_core.constants.constants import ENV_ENVIRONMENT_VARIABLE
from fastapi import FastAPI, APIRouter, HTTPException

from ml_serve_core.service.user_service import UserService

# OpenTelemetry FastAPI instrumentation
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry import trace

db_client = MysqlClient()
root_path = environ.get("ROOT_PATH", "")
app = FastAPI(root_path=root_path)
env = environ.get(ENV_ENVIRONMENT_VARIABLE, "local")
db_client.init_db(app)

user_service = UserService()


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    A global HTTPException handler that returns a standardized JSON response.
    """
    # You can decide the shape of your JSON here:
    if exc.status_code == 404:
        return Response.not_found_error_response(exc.detail)
    elif exc.status_code == 400:
        return Response.bad_request_error_response(exc.detail)
    elif exc.status_code == 401:
        return Response.unauthorized_error_response(exc.detail)
    elif exc.status_code == 403:
        return Response.forbidden_error_response(exc.detail)
    elif exc.status_code == 409:
        return Response.conflict_error_response(exc.detail)
    elif exc.status_code >= 500:
        return Response.internal_server_error_response(exc.detail)
    return JSONResponse(content={"detail": exc.detail}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """
    A global ValidationError handler that returns a standardized JSON response.
    """
    return Response.bad_request_error_response(exc.errors())


@app.exception_handler(Exception)
async def validation_exception_handler(request: Request, exc: Exception):
    """
    A global Exception handler that returns a standardized JSON response.
    """
    return Response.internal_server_error_response(str(exc))


@app.on_event("startup")
async def init():
    await db_client.init_tortoise()
    # Bootstrap admin user from environment variable
    await user_service.bootstrap_admin_user()


@app.on_event("startup")
@repeat_every(seconds=2)
async def status_poller_job():
    logger.info("Running artifact poller job")
    artifact_status_poller = ArtifactStatusPoller()
    task = asyncio.create_task(artifact_status_poller.get_and_update_artifact_status())
    await task


@app.on_event("shutdown")
async def close():
    await db_client.close_tortoise()


router = APIRouter()


@router.get("/healthcheck")
@router.get("/health")
async def healthcheck():
    return {"status": "SUCCESS", "message": "OK"}


app.include_router(router)
app.include_router(serve.serve_router, prefix="/api/v1/serve")
app.include_router(artifact.artifact_router, prefix="/api/v1")
app.include_router(environment.environment_router, prefix="/api/v1")
app.include_router(deployment.deployment_router, prefix="/api/v1/serve")

# Initialize OpenTelemetry instrumentation for FastAPI after including all routers
# This ensures all routes are properly instrumented
if otel_bootstrap.otel_enabled:
    FastAPIInstrumentor.instrument_app(app)
