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

import json
from time import gmtime, strftime
from typing import Dict, Any
from fastapi import Request

from fastapi import HTTPException
from fastapi.responses import JSONResponse
import requests

from mlflow_app_layer.constant.config import Config
from mlflow_app_layer.util.logging_util import get_logger

logger = get_logger(__name__)


def process_filters(filters: Dict[str, Any]):
    try:
        processed_filters = {}
        for key, value in filters.items():
            if key == "name" and filters["name"]:
                processed_filters["filter"] = f"name like '%{filters['name']}%'"
            if key == "tags":
                tags = filters["tags"]
                for k, v in tags.items():
                    processed_filters[f"tags.{k}"] = v

        return processed_filters
    except Exception as e:
        logger.error("Error in process_filters: ", e)
        return {}


def convert_epoch_to_date(epoch):
    return strftime("%Y-%m-%d %H:%M:%S", gmtime(epoch / 1000))


def process_models_response(models_data):
    try:
        models = []
        for model in models_data["registered_models"]:
            processed_model = {"name": model["name"]}
            versions = []
            if "latest_versions" in model:
                for version in model["latest_versions"]:
                    versions.append(
                        {
                            "name": version["name"],
                            "version": version["version"],
                            "run_id": version["run_id"],
                            "source": version["source"],
                            "inputs": {},
                            "outputs": {},
                            "tags": version["tags"] if "tags" in version else {},
                            "created_at": convert_epoch_to_date(
                                version["creation_timestamp"]
                            ),
                        }
                    )
            processed_model["versions"] = versions
            models.append(processed_model)
        return models
    except Exception as e:
        logger.error("Error in process_models_response: ", e)
        return []


async def search_models_controller(request: Request, config: Config, email: str):
    try:
        filters = json.loads(request.query_params.get("filters", {}))
        page_token = request.query_params.get("page_token", None)
        page_size = int(request.query_params.get("page_size", 10))

        processed_filters = process_filters(filters)
        processed_filters["page_token"] = page_token
        processed_filters["page_size"] = page_size
        models_res = requests.get(
            f"{config.mlflow_app_layer_url}/api/2.0/mlflow/registered-models/search",
            params=processed_filters,
            auth=(email, email),
        )
        models_data = models_res.json()
        logger.info("Model search response: %s", models_data)

        if models_res.status_code == 200:
            return JSONResponse(
                content={
                    "status": "SUCCESS",
                    "next_page_token": (
                        models_data["next_page_token"]
                        if "next_page_token" in models_data
                        else None
                    ),
                    "data": process_models_response(models_data),
                },
                status_code=200,
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch models",
            )

    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch models",
        )
