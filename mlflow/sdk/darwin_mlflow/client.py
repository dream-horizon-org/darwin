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
# This file is part of the Darwin MLflow SDK, a wrapper around MLflow
# for integration with the Darwin platform.

import os

import mlflow
from mlflow import *
from mlflow.client import MlflowClient

from darwin_mlflow.constant.config import Config

os.environ["MLFLOW_TRACKING_USERNAME"] = os.environ["user"]
os.environ["MLFLOW_TRACKING_PASSWORD"] = os.environ["user"]

config = Config()
set_tracking_uri(config.get_mlflow_tracking_uri)
mlflow_client = MlflowClient(config.get_mlflow_tracking_uri)

