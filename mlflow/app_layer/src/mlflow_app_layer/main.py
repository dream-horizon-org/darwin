# Copyright 2018 Databricks, Inc.
# Modifications Copyright 2025 DS Horizon
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# This file is part of a modified version of MLflow, originally developed by
# Databricks, Inc. Modifications include custom authentication, authorization,
# and integration with the Darwin platform.

import os
from typing import Union

from fastapi import FastAPI, Request, Header
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from ddtrace import patch

from mlflow_app_layer.controllers.experiment import (
    create_experiment_controller,
    get_experiment_controller,
    update_experiment_controller,
    delete_experiment_controller,
)
from mlflow_app_layer.controllers.model import search_models_controller
from mlflow_app_layer.controllers.proxy import (
    get_experiments_ui_controller,
    get_favicon_controller,
    get_images_controller,
    get_static_files_controller,
    get_ajax_api_response_controller,
    post_ajax_api_response_controller,
    get_artifact_controller,
    get_artifacts_path_controller,
)
from mlflow_app_layer.controllers.user import create_user_controller
from mlflow_app_layer.controllers.run import (
    get_run_controller,
    delete_run_controller,
    create_run_controller,
    log_run_data_controller,
)
from mlflow_app_layer.models.run import CreateRunRequest, LogRunDataRequest
from mlflow_app_layer.constant.config import Config
from mlflow_app_layer.models.experiment import (
    CreateExperimentRequest,
    UpdateExperimentRequest,
)
from mlflow_app_layer.service.mlflow import MLFlow
from mlflow_app_layer.util.s3_utils import initialize_s3_bucket

patch(fastapi=True)
app = FastAPI()

config = Config()
mlflow_service = MLFlow()

# Initialize S3 bucket on startup
initialize_s3_bucket()


@app.get("/health")
def health():
    return {"status": "SUCCESS"}


@app.get("/experiments", response_class=HTMLResponse)
async def get_experiments(request: Request):
    return await get_experiments_ui_controller(request, config)


@app.get("/static-files/favicon.ico", response_class=FileResponse)
async def get_favicon(request: Request):
    return await get_favicon_controller(request, config)


@app.get("/static-files/static/media/{path:path}", response_class=FileResponse)
async def get_images(request: Request, path: str):
    return await get_images_controller(request, config, path)


@app.get("/static-files/{path:path}", response_class=FileResponse)
async def get_static_files(request: Request, path: str):
    return await get_static_files_controller(request, config, path)


@app.get("/ajax-api/{path:path}")
async def get_ajax_api_response(request: Request, path: str):
    return await get_ajax_api_response_controller(request, path, config)


@app.post("/ajax-api/{path:path}", response_class=JSONResponse)
async def post_ajax_api_response(request: Request, path: str):
    return await post_ajax_api_response_controller(request, path, config)


@app.get("/get-artifact")
async def get_artifact(request: Request):
    """
    Proxy endpoint for MLflow artifact downloads.
    Used by the MLflow UI to download artifact files.
    """
    return await get_artifact_controller(request, config)


@app.get("/artifacts/{path:path}")
async def get_artifacts_path(request: Request, path: str):
    """
    Proxy endpoint for MLflow artifact file serving.
    Used by the MLflow UI to display artifact content.
    """
    return await get_artifacts_path_controller(request, path, config)


@app.get("/v1/experiment/{experiment_id}")
async def get_experiment(
    experiment_id: str, email: Union[str, None] = Header(default=None)
):
    return await get_experiment_controller(experiment_id, config, email, mlflow_service)


@app.post("/v1/user")
async def create_user(request: Request):
    return await create_user_controller(request, config)


@app.post("/v1/experiment")
async def create_experiment(
    request: CreateExperimentRequest, email: Union[str, None] = Header(default=None)
):
    return await create_experiment_controller(request, config, email)


@app.put("/v1/experiment/{experiment_id}")
async def update_experiment(
    experiment_id: str,
    request: UpdateExperimentRequest,
    email: Union[str, None] = Header(default=None),
):
    return await update_experiment_controller(experiment_id, request, config, email)


@app.delete("/v1/experiment/{experiment_id}")
async def delete_experiment(
    experiment_id: str, email: Union[str, None] = Header(default=None)
):
    return await delete_experiment_controller(
        experiment_id, config, email, mlflow_service
    )


@app.get("/v1/models")
async def search_models(
    request: Request, email: Union[str, None] = Header(default=None)
):
    return await search_models_controller(request, config, email)


@app.get("/v1/experiment/{experiment_id}/run/{run_id}")
async def get_run(
    experiment_id: str, run_id: str, email: Union[str, None] = Header(default=None)
):
    return await get_run_controller(
        experiment_id, run_id, config, email, mlflow_service
    )


@app.delete("/v1/experiment/{experiment_id}/run/{run_id}")
async def delete_run(
    experiment_id: str, run_id: str, email: Union[str, None] = Header(default=None)
):
    return await delete_run_controller(
        experiment_id, run_id, config, email, mlflow_service
    )


@app.post("/v1/experiment/{experiment_id}/run")
async def create_run(
    experiment_id: str,
    request: CreateRunRequest,
    email: Union[str, None] = Header(default=None),
):
    return await create_run_controller(
        experiment_id, request, config, email, mlflow_service
    )


@app.post("/v1/run/{run_id}/log-data")
async def log_data(
    run_id: str,
    request: LogRunDataRequest,
    email: Union[str, None] = Header(default=None),
):
    return await log_run_data_controller(run_id, request, email, config)
