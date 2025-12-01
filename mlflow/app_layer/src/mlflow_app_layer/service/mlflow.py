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
# This file contains custom service layer for Darwin MLflow integration.

from typeguard import typechecked

from mlflow_app_layer.dao.auth_dao import AuthDao


@typechecked
class MLFlow:
    def __init__(self):
        self.dao = AuthDao()

    def get_experiment_user(self, experiment_id: int):
        return self.dao.get_experiment_user(experiment_id)
