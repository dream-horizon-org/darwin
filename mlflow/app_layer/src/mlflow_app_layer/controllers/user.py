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
# This file contains custom user management for Darwin platform.

import json
import requests
from fastapi import Request
from fastapi.responses import JSONResponse

from mlflow_app_layer.constant.config import Config


async def create_user_controller(request: Request, config: Config):
    # TODO: for now mlflow doesn't have any auth support so skipping it.
    return JSONResponse(
            content={"status": "SUCCESS", "message": "User created successfully"},
            status_code=200,
        )
