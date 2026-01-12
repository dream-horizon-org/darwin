import uuid

from loguru import logger

from fastapi import FastAPI, Request
from fastapi_utils.tasks import repeat_every

from compute_app_layer import request_id_var
from compute_app_layer.routers import (
    default_router,
    spark_history_server_router,
    cluster_router,
    events_router,
    libraries_router,
    maven_router,
    runtime_v2_router,
)
from compute_app_layer.utils.tracing_utils import OpenTelemetryMiddleware
from compute_core.compute import Compute
from compute_core.constant.config import Config
from compute_script.main import run_job, manage_jupyter_pods, update_status_for_remote_command_execution
from compute_script.util.custom_metrics import CustomMetrics

# TODO: Consider adding lifespan context manager for proper startup/shutdown handling
app = FastAPI()

# Add OpenTelemetry middleware FIRST (executes last in the middleware chain)
app.add_middleware(OpenTelemetryMiddleware)

# TODO: Move instrumentation setup to a dedicated module for cleaner initialization
# Auto-instrument FastAPI and ASGI
try:
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.instrumentation.requests import RequestsInstrumentor

    FastAPIInstrumentor.instrument_app(app)
    RequestsInstrumentor().instrument()
except ImportError as e:
    # Safe if you chose not to install instrumentation packages
    logger.warning(f"Some OpenTelemetry instrumentation packages not available: {e}")

# Include API Routers
app.include_router(default_router.router)
app.include_router(spark_history_server_router.router)
app.include_router(cluster_router.router)
app.include_router(events_router.router)
app.include_router(libraries_router.router)
app.include_router(maven_router.router)
app.include_router(runtime_v2_router.router)

# TODO: These global instances should use dependency injection pattern via FastAPI's Depends
config = Config()
compute = Compute()
custom_metric_util = CustomMetrics()


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    # Generate or retrieve a unique request_id
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    # Set the request_id for the current context
    token = request_id_var.set(request_id)
    try:
        response = await call_next(request)
        # Add the request_id to the response headers
        response.headers["X-Request-ID"] = request_id
    finally:
        # Reset the context variable to its previous state
        request_id_var.reset(token)
    return response


# TODO: Polling interval of 2 seconds is aggressive - consider making it configurable
@app.on_event("startup")
@repeat_every(seconds=2)
def status_poller_job():
    # Generate a unique identifier
    # TODO: Variable naming - use snake_case (uuid_str instead of uuId)
    uuId = str(uuid.uuid4())
    token = request_id_var.set(uuId)
    try:
        logger.info("Running status poller job")
        run_job(custom_metric_util)
    finally:
        request_id_var.reset(token)


@app.on_event("startup")
@repeat_every(seconds=10)
def jupyter_pod_jobs():
    # Generate a unique identifier
    uuId = str(uuid.uuid4())
    token = request_id_var.set(uuId)
    try:
        logger.info("Running jupyter pod jobs")
        manage_jupyter_pods(compute, config)
    finally:
        request_id_var.reset(token)


@app.on_event("startup")
@repeat_every(seconds=5)
def update_status_for_remote_command_execution_job():
    # Generate a unique identifier
    request_id = str(uuid.uuid4())
    token = request_id_var.set(request_id)
    try:
        logger.info("Running status poller for remote command execution job")
        update_status_for_remote_command_execution(compute, config)
    finally:
        request_id_var.reset(token)
