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

from setuptools import setup

package_name = "darwin-mlflow"
version = "2.0.3"

with open("requirements.txt") as f:
    required = f.read().splitlines()

setup(
    name=package_name,
    version=version,
    description="Darwin Mlflow SDK - A modified version of MLflow for Darwin platform integration",
    long_description="This package is based on MLflow (https://github.com/mlflow/mlflow), "
                     "originally developed by Databricks, Inc. and licensed under Apache 2.0. "
                     "See NOTICE file for attribution details.",
    license="Apache License 2.0",
    platforms="any",
    packages=["darwin_mlflow", "darwin_mlflow.constant"],
    classifiers=[
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "License :: OSI Approved :: Apache Software License",
    ],
    install_requires=required,
    python_requires=">=3.6",
    include_package_data=True,
    zip_safe=False,
    extras_require={"testing": ["mypy>=0.910", "flake8>=3.9"]},
    package_data={
        "darwin_mlflow": ["py.typed"],
    },
)
