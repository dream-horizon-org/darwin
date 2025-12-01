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

import requests
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from mlflow_app_layer.constant.config import Config
from mlflow_app_layer.models.experiment import (
    CreateExperimentRequest,
    UpdateExperimentRequest,
)
from mlflow_app_layer.service.mlflow import MLFlow
from mlflow_app_layer.util.logging_util import get_logger

logger = get_logger(__name__)


async def create_experiment_controller(
    request: CreateExperimentRequest, config: Config, email: str
):
    try:
        username = email
        experiment_name = request.experiment_name

        experiment_create_res = requests.post(
            f"{config.mlflow_app_layer_url}/api/2.0/mlflow/experiments/create",
            json={"name": experiment_name},
            auth=(username, username),
            timeout=30,
        )
        experiment_data = experiment_create_res.json()
        logger.info("Experiment creation response: %s", experiment_data)
        if experiment_create_res.status_code == 200:
            return JSONResponse(
                content={
                    "status": "SUCCESS",
                    "data": {
                        "experiment_id": experiment_data["experiment_id"],
                        "experiment_name": experiment_name,
                    },
                },
                status_code=200,
            )
        elif experiment_create_res.status_code == 400:
            raise HTTPException(
                status_code=400,
                detail=experiment_data["message"],
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Experiment creation failed",
            )

    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail="Experiment creation failed",
        )


async def get_experiment_controller(
    experiment_id: str, config: Config, email: str, mlflow_service: MLFlow
):
    try:
        experiment_get_res = requests.get(
            f"{config.mlflow_app_layer_url}/api/2.0/mlflow/experiments/get?experiment_id={experiment_id}",
            auth=(email, email),
            timeout=30,
        )
        experiment_data = experiment_get_res.json()

        users_data = mlflow_service.get_experiment_user(int(experiment_id))
        user = None
        if (users_data is not None) and len(users_data) > 0:
            user = users_data[0]["username"]

        if experiment_get_res.status_code == 200:
            return JSONResponse(
                content={
                    "status": "SUCCESS",
                    "data": {
                        "experiment_id": experiment_data["experiment"]["experiment_id"],
                        "experiment_name": experiment_data["experiment"]["name"],
                        "artifact_location": experiment_data["experiment"][
                            "artifact_location"
                        ],
                        "created_by": user,
                    },
                },
                status_code=200,
            )
        elif experiment_get_res.status_code == 400:
            raise HTTPException(
                status_code=400,
                detail=experiment_data["message"],
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Experiment get failed",
            )

    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail="Experiment get failed",
        )


async def update_experiment_controller(
    experiment_id: str, request: UpdateExperimentRequest, config: Config, email: str
):
    try:
        experiment_name = request.experiment_name
        experiment_update_res = requests.post(
            f"{config.mlflow_app_layer_url}/api/2.0/mlflow/experiments/update",
            json={"experiment_id": experiment_id, "new_name": experiment_name},
            auth=(email, email),
            timeout=30,
        )
        experiment_data = experiment_update_res.json()
        logger.info("Experiment update response: %s", experiment_data)
        if experiment_update_res.status_code == 200:
            return JSONResponse(
                content={
                    "status": "SUCCESS",
                    "data": {
                        "experiment_id": experiment_id,
                        "experiment_name": experiment_name,
                    },
                },
                status_code=200,
            )
        elif experiment_update_res.status_code == 404:
            raise HTTPException(
                status_code=400,
                detail=experiment_data["message"],
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Experiment update failed",
            )

    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail="Experiment update failed",
        )


async def delete_experiment_controller(
    experiment_id: str, config: Config, email: str, mlflow_service: MLFlow
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

        experiment_delete_res = requests.post(
            f"{config.mlflow_app_layer_url}/api/2.0/mlflow/experiments/delete",
            json={"experiment_id": experiment_id},
            auth=(email, email),
            timeout=30,
        )
        experiment_data = experiment_delete_res.json()

        logger.info("Experiment delete response: %s", experiment_data)
        if experiment_delete_res.status_code == 200:
            return JSONResponse(
                content={
                    "status": "SUCCESS",
                    "data": {
                        "experiment_id": experiment_id,
                    },
                },
                status_code=200,
            )
        elif experiment_delete_res.status_code == 404:
            raise HTTPException(
                status_code=400,
                detail=experiment_data["message"],
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Experiment delete failed",
            )

    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail="Experiment delete failed",
        )
