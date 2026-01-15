from serve_app_layer import logger_config
# Import OpenTelemetry first
from serve_app_layer import otel_bootstrap

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from urllib.parse import quote
import shutil
from pathlib import Path
from typing import Optional
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from loguru import logger

# OpenTelemetry FastAPI instrumentation
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from serve_app_layer.utils.app_layer_utils import upload_dockerfile, is_docker_running
from serve_app_layer.models.response import (
    GetTaskLogsResponse,
    GetAllTasksResponse,
    GetImageResponse,
    GetBuildStatusResponse,
)
from serve_app_layer.constants.constants import log_file_root
from serve_core.build_image import Runtimes
from serve_core.client.mysql_client import MysqlClient
import threading
import time
import os
from contextlib import asynccontextmanager

ENV = os.getenv("ENV", "local")
runtime_core = Runtimes(env=ENV)

# --- Database client ---
db_client = MysqlClient()


# --- Lifespan handler ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up: Initializing database")
    await db_client.init_tortoise()
    logger.info("Database initialized successfully")

    logger.info("Starting background worker...")
    def start_background_process():
        while True:
            runtime_core.process_tasks()
            time.sleep(5)

    background_thread = threading.Thread(target=start_background_process, daemon=True)
    background_thread.start()
    logger.info("Background worker started successfully")

    yield  # 👈 app runs between startup & shutdown

    logger.info("Shutting down: Closing database connections")
    await db_client.close_tortoise()
    logger.info("Database connections closed")


# --- Create app instance ---
root_path = os.environ.get("ROOT_PATH", "")
app = FastAPI(lifespan=lifespan, root_path=root_path)

# --- Initialize MySQL client (non-async setup) ---
db_client.init_db(app)

# --- Mount static logs directory ---
try:
    app.mount("/static", StaticFiles(directory=log_file_root), name="logs")
except RuntimeError:
    os.makedirs(log_file_root, exist_ok=True)
    app.mount("/static", StaticFiles(directory=log_file_root), name="logs")


@app.get("/healthcheck")
@app.get("/health")
async def health_check():
    """
    Health check endpoint to ensure the service is running.
    Returns 503 if Docker is not available.
    """
    if not is_docker_running():
        raise HTTPException(
            status_code=503,
            detail={"status": "unavailable", "message": "Docker daemon is not running or not accessible"}
        )
    return {"status": "SUCCESS", "message": "OK"}


@app.post("/build_with_dockerfile")
async def build_image_with_dockerfile(
    app_name: str = Form(...),
    image_tag: str = Form(...),
    dockerfile: UploadFile = File(None),
    git_repo: str = Form(...),
    branch: Optional[str] = Form(None),
    app_dir: Optional[str] = Form(None),
):
    """
    Build a Docker image from a provided Dockerfile.

    :param app_name: Name of the application.
    :param image_tag: Tag for the Docker image.
    :param dockerfile: The Dockerfile for building the image.
    :param git_repo: Git repository URL.
    :param branch: Git branch name.
    :param app_dir: Optional. The directory containing the application source code.
    :return: Information about the build process.
    """
    try:
        if app_dir is None:
            app_dir = ""

        if branch is None:
            branch = ""

        if dockerfile is not None:
            dockerfile_contents = await dockerfile.read()
            dockerfile_s3_path = await upload_dockerfile(image_tag, app_name, ENV, dockerfile_contents)
        else:
            dockerfile_s3_path = ""
        task_id, logs_url = runtime_core.create_task(
            image_tag=image_tag,
            app_name=app_name,
            docker_file_path=dockerfile_s3_path,
            git_repo=git_repo,
            branch=branch,
            app_dir=app_dir,
        )
        message = "task has been added to queue"
        if dockerfile is not None:
            directory_path = f"{os.getcwd()}/{image_tag}"
            shutil.rmtree(directory_path)
        return GetImageResponse(status="SUCCESS", task_id=task_id, logs_url=logs_url, message=message)
    except Exception as e:
        return GetImageResponse(status="FAILED", task_id="", logs_url="", message=str(e))


@app.get("/task/logs")
async def get_task_logs(task_id: str):
    """
    Get the URL to access logs for a specific task.

    :param task_id: ID of the task.
    :return: URL to access logs.
    """
    try:
        logs_url = runtime_core.get_task_logs_url(task_id)
        return GetTaskLogsResponse(status="SUCCESS", logs_url=logs_url, message="")
    except Exception as e:
        return GetTaskLogsResponse(status="FAILED", logs_url="", message=str(e))


@app.get("/task/status")
async def get_status(task_id: str):
    """
    Get the status of a specific task.

    :param task_id: ID of the task.
    :return: Status of the task.
    """
    try:
        build_status = runtime_core.get_status(task_id)
        return GetBuildStatusResponse(status="SUCCESS", build_status=build_status, message="")
    except Exception as e:
        return GetBuildStatusResponse(status="FAILED", build_status="", message=str(e))


@app.get("/task")
async def get_all_tasks():
    """
    Get the list of all tasks.

    :return: List of task information.
    """
    try:
        tasks_list = runtime_core.get_tasks()
        return GetAllTasksResponse(status="SUCCESS", data=tasks_list, message="")
    except Exception as e:
        return GetAllTasksResponse(status="FAILED", data=[], message=str(e))


# Initialize OpenTelemetry instrumentation for FastAPI
if otel_bootstrap.otel_enabled:
    FastAPIInstrumentor.instrument_app(app)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0")
