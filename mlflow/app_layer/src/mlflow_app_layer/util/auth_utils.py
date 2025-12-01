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
# This file contains custom authentication utilities for Darwin platform.

from mlflow_app_layer.constant.config import Config
import base64

from mlflow_app_layer.util.logging_util import get_logger

logger = get_logger(__name__)


def get_authorization_header(config: Config):
    """
    Get authorization header from config credentials.
    Returns None if credentials are missing or invalid.
    """
    try:
        credentials = config.mlflow_admin_credentials()
        username = credentials.get("username")
        password = credentials.get("password")
        
        # Check if credentials are valid (not None or empty)
        if not username or not password or username == "None" or password == "None":
            logger.warning("MLflow admin credentials are missing or invalid. Skipping auth header.")
            return None
            
        logger.debug("Using MLflow admin credentials for authentication")
        basic_auth_str = ("%s:%s" % (username, password)).encode("utf-8")
        return "Basic " + base64.standard_b64encode(basic_auth_str).decode("utf-8")
    except Exception as e:
        logger.error("Error generating authorization header: %s", str(e))
        return None
