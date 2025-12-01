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
# This file contains modifications to MLflow for Darwin platform integration.

from datetime import datetime

import requests
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from mlflow_app_layer.constant.config import Config
from mlflow_app_layer.models.run import CreateRunRequest, LogRunDataRequest
from mlflow_app_layer.service.mlflow import MLFlow
from mlflow_app_layer.util.logging_util import get_logger

logger = get_logger(__name__)


async def get_run_controller(
    experiment_id: str, run_id: str, config: Config, email: str, mlflow_service: MLFlow
):
    try:
        run_get_res = requests.get(
            f"{config.mlflow_app_layer_url}/api/2.0/mlflow/runs/get?run_id={run_id}",
            auth=(email, email),
        )
        run_data = run_get_res.json()
        logger.debug(f"Run get response: {run_data}")
        users_data = mlflow_service.get_experiment_user(int(experiment_id))
        user = None
        if (users_data is not None) and len(users_data) > 0:
            user = users_data[0]["username"]

        if run_get_res.status_code == 200:
            return JSONResponse(
                content={
                    "status": "SUCCESS",
                    "data": {
                        "run_name": run_data["run"]["info"]["run_name"],
                        "run_id": run_id,
                        "experiment_id": run_data["run"]["info"]["experiment_id"],
                        "run_status": run_data["run"]["info"]["status"],
                        "start_time": run_data["run"]["info"]["start_time"],
                        "end_time": (
                            run_data["run"]["info"]["end_time"]
                            if "end_time" in run_data["run"]["info"]
                            else None
                        ),
                        "artifact_uri": run_data["run"]["info"]["artifact_uri"],
                    },
                },
                status_code=200,
            )
        elif run_get_res.status_code == 400:
            raise HTTPException(
                status_code=400,
                detail=run_data["message"],
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Run get failed",
            )

    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=f"Run get failed due to: {e.__str__()}",
        )


async def delete_run_controller(
    experiment_id: str, run_id: str, config: Config, email: str, mlflow_service: MLFlow
):
    try:
        users_data = mlflow_service.get_experiment_user(int(experiment_id))
        if users_data is None:
            raise HTTPException(
                status_code=402,
                detail="User is not authorized to perform the action",
            )
        elif len(users_data) > 0:
            user = users_data[0]["username"]
            if user != email:
                raise HTTPException(
                    status_code=402,
                    detail="User is not authorized to perform the action",
                )

        run_delete_res = requests.post(
            f"{config.mlflow_app_layer_url}/api/2.0/mlflow/runs/delete",
            json={"run_id": run_id},
            auth=(email, email),
        )
        run_data = run_delete_res.json()
        logger.debug(f"Run delete response: {run_data}")

        if run_delete_res.status_code == 200:
            return JSONResponse(
                content={
                    "status": "SUCCESS",
                    "message": "Run deleted successfully",
                },
                status_code=200,
            )
        elif run_delete_res.status_code == 400:
            raise HTTPException(
                status_code=400,
                detail=run_data["message"],
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Run delete failed",
            )
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=f"Run delete failed due to: {e.__str__()}",
        )


async def create_run_controller(
    experiment_id: str,
    request: CreateRunRequest,
    config: Config,
    email: str,
    mlflow_service: MLFlow,
):
    try:
        create_request = {
            "experiment_id": experiment_id,
            "user_id": email,
            "run_name": request.run_name,
            "start_time": int(datetime.utcnow().timestamp() * 1e3),
            "tags": request.tags,
        }
        run_create_res = requests.post(
            f"{config.mlflow_app_layer_url}/api/2.0/mlflow/runs/create",
            json=create_request,
            auth=(email, email),
        )
        run_data = run_create_res.json()
        logger.debug(f"Run create response: {run_data}")

        if run_create_res.status_code == 200:
            return JSONResponse(
                content={
                    "status": "SUCCESS",
                    "data": {
                        "run_name": run_data["run"]["info"]["run_name"],
                        "run_id": run_data["run"]["info"]["run_id"],
                        "experiment_id": run_data["run"]["info"]["experiment_id"],
                        "run_status": run_data["run"]["info"]["status"],
                        "start_time": run_data["run"]["info"]["start_time"],
                        "artifact_uri": run_data["run"]["info"]["artifact_uri"],
                    },
                },
                status_code=201,
            )
        elif run_create_res.status_code == 400:
            raise HTTPException(
                status_code=400,
                detail=run_data["message"],
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Run create failed",
            )
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=f"Run create failed due to: {e.__str__()}",
        )


async def log_run_data_controller(
    run_id: str, request: LogRunDataRequest, email: str, config: Config
):
    try:
        if request.metrics:
            metrics_request = {
                "run_id": run_id,
                "key": request.metrics.key,
                "value": request.metrics.value,
                "timestamp": int(datetime.utcnow().timestamp() * 1e3),
            }
            logger.debug(f"Metrics log request: {metrics_request}")
            metrics_res = requests.post(
                f"{config.mlflow_app_layer_url}/api/2.0/mlflow/runs/log-metric",
                json=metrics_request,
                auth=(email, email),
            )
            metrics_data = metrics_res.json()
            logger.debug(f"Metrics log response: {metrics_res.status_code}")
            if metrics_res.status_code == 400:
                raise HTTPException(
                    status_code=400,
                    detail=metrics_data["message"],
                )
            elif metrics_res.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail="Logging Metrics data failed",
                )

        if request.params:
            params_request = {
                "run_id": run_id,
                "key": request.params.key,
                "value": request.params.value,
            }
            logger.debug(f"Params log request: {params_request}")
            params_res = requests.post(
                f"{config.mlflow_app_layer_url}/api/2.0/mlflow/runs/log-parameter",
                json=params_request,
                auth=(email, email),
            )
            logger.debug(f"Params log status code: {params_res.status_code}")
            params_data = params_res.json()
            logger.debug(f"Params log response: {params_data}")
            if params_res.status_code == 400:
                raise HTTPException(
                    status_code=400,
                    detail=params_data["message"],
                )
            elif params_res.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail="Logging Params data failed",
                )
        return JSONResponse(
            content={
                "status": "SUCCESS",
                "message": "Log data success",
            },
            status_code=200,
        )
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=f"Log data failed due to: {e.__str__()}",
        )
