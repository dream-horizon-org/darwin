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
# This file contains proxy and UI serving logic for Darwin platform integration.

import os

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import requests
import io

from mlflow_app_layer.constant.config import Config
from mlflow_app_layer.util.auth_utils import get_authorization_header
from mlflow_app_layer.util.logging_util import get_logger

logger = get_logger(__name__)

cwd = os.getcwd()


def validate_path(path: str) -> str:
    # Prevent absolute paths or paths that try to escape the base directory
    if path.startswith("/") or path.startswith("..") or ".." in path.split("/"):
        raise HTTPException(status_code=400, detail="Invalid Path")
    return path

async def get_experiments_ui_controller(request: Request, config: Config):
    html_file_path = os.path.join(
        cwd, "app_layer", "src", "mlflow_app_layer", "static-files", "index.html"
    )
    logger.info("html_file_path: %s", html_file_path)
    with open(html_file_path, "r") as file:
        file_content = file.read()

    return file_content


async def get_favicon_controller(request: Request, config: Config):
    file_path = os.path.join(
        cwd, "app_layer", "src", "mlflow_app_layer", "static-files", "favicon.ico"
    )
    return FileResponse(file_path)


async def get_images_controller(request: Request, config: Config, path: str):
    validate_path(path)
    file_path = os.path.join(
        cwd,
        "app_layer",
        "src",
        "mlflow_app_layer",
        "static-files",
        "static",
        "media",
        path,
    )

    return FileResponse(file_path)


async def get_static_files_controller(request: Request, config: Config, path: str):
    validate_path(path)
    file_path = os.path.join(
        cwd, "app_layer", "src", "mlflow_app_layer", "static-files", path
    )

    return FileResponse(file_path)


async def get_ajax_api_response_controller(request: Request, path: str, config: Config):
    authorization_header = request.headers.get("Authorization")
    query_params = dict(request.query_params)

    if authorization_header is None:
        authorization_header = get_authorization_header(config)

    url = f"{config.mlflow_ui_url}/ajax-api/{path}"
    headers = {"Authorization": authorization_header}
    
    try:
        resp = requests.get(
            url,
            params=query_params,
            headers=headers,
            timeout=30,  # 30 second timeout
        )
        logger.debug("AJAX API GET response status: %s, url: %s", resp.status_code, resp.url)
        
        if resp.status_code == 400:
            logger.error("Bad request (400) for URL: %s, Response: %s", resp.url, resp.text)
        
        resp.raise_for_status()  # Raise an exception for bad status codes
        return JSONResponse(content=resp.json(), status_code=resp.status_code)
    except requests.exceptions.Timeout as exc:
        logger.error("Timeout while fetching AJAX API: %s/%s", config.mlflow_ui_url, path)
        raise HTTPException(
            status_code=504,
            detail=f"Request to MLflow UI timed out. Please check if {config.mlflow_ui_url} is accessible."
        ) from exc
    except requests.exceptions.ConnectionError as exc:
        logger.error("Connection error while fetching AJAX API: %s/%s - %s", config.mlflow_ui_url, path, str(exc))
        raise HTTPException(
            status_code=503,
            detail=f"Unable to connect to MLflow UI at {config.mlflow_ui_url}. Please check if the service is running."
        ) from exc
    except requests.exceptions.HTTPError as exc:
        logger.error("HTTP error while fetching AJAX API: %s/%s - Status: %s, Response: %s", 
                     config.mlflow_ui_url, path, resp.status_code if 'resp' in locals() else 'N/A',
                     resp.text if 'resp' in locals() else str(exc))
        raise HTTPException(
            status_code=resp.status_code if 'resp' in locals() else 502,
            detail=f"Error communicating with MLflow UI: {str(exc)}"
        ) from exc
    except requests.exceptions.RequestException as exc:
        logger.error("Request error while fetching AJAX API: %s/%s - %s", config.mlflow_ui_url, path, str(exc))
        raise HTTPException(
            status_code=502,
            detail=f"Error communicating with MLflow UI: {str(exc)}"
        ) from exc
    except Exception as exc:
        logger.error("Error while fetching AJAX API: %s/%s - %s", config.mlflow_ui_url, path, str(exc))
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with MLflow UI: {str(exc)}"
        ) from exc


async def post_ajax_api_response_controller(
    request: Request, path: str, config: Config
):
    authorization_header = request.headers.get("Authorization")
    query_params = dict(request.query_params)
    
    try:
        body = await request.json()
    except (ValueError, TypeError):
        body = None

    if authorization_header is None:
        authorization_header = get_authorization_header(config)

    url = f"{config.mlflow_ui_url}/ajax-api/{path}"
    headers = {"Authorization": authorization_header}
    
    try:
        resp = requests.post(
            url,
            params=query_params if query_params else None,
            headers=headers,
            json=body,
            timeout=30,  # 30 second timeout
        )
        logger.debug("AJAX API POST response status: %s, url: %s", resp.status_code, resp.url)
        
        if resp.status_code == 400:
            logger.error("Bad request (400) for URL: %s, Request body: %s, Response: %s", 
                        resp.url, body, resp.text)
        
        resp.raise_for_status()  # Raise an exception for bad status codes
        return JSONResponse(content=resp.json(), status_code=resp.status_code)
    except requests.exceptions.Timeout as exc:
        logger.error("Timeout while posting to AJAX API: %s/%s", config.mlflow_ui_url, path)
        raise HTTPException(
            status_code=504,
            detail=f"Request to MLflow UI timed out. Please check if {config.mlflow_ui_url} is accessible."
        ) from exc
    except requests.exceptions.ConnectionError as exc:
        logger.error("Connection error while posting to AJAX API: %s/%s - %s", config.mlflow_ui_url, path, str(exc))
        raise HTTPException(
            status_code=503,
            detail=f"Unable to connect to MLflow UI at {config.mlflow_ui_url}. Please check if the service is running."
        ) from exc
    except requests.exceptions.HTTPError as exc:
        logger.error("HTTP error while posting to AJAX API: %s/%s - Status: %s, Request body: %s, Response: %s",
                     config.mlflow_ui_url, path, resp.status_code if 'resp' in locals() else 'N/A',
                     body, resp.text if 'resp' in locals() else str(exc))
        raise HTTPException(
            status_code=resp.status_code if 'resp' in locals() else 502,
            detail=f"Error communicating with MLflow UI: {str(exc)}"
        ) from exc
    except requests.exceptions.RequestException as exc:
        logger.error("Request error while posting to AJAX API: %s/%s - %s", config.mlflow_ui_url, path, str(exc))
        raise HTTPException(
            status_code=502,
            detail=f"Error communicating with MLflow UI: {str(exc)}"
        ) from exc
    except Exception as exc:
        logger.error("Error while posting to AJAX API: %s/%s - %s", config.mlflow_ui_url, path, str(exc))
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with MLflow UI: {str(exc)}"
        ) from exc


async def get_artifact_controller(request: Request, config: Config):
    """
    Proxy requests to MLflow's /get-artifact endpoint for downloading artifacts.
    This endpoint is used by the MLflow UI to download artifact files.
    """
    authorization_header = request.headers.get("Authorization")
    query_params = dict(request.query_params)

    if authorization_header is None:
        authorization_header = get_authorization_header(config)

    url = f"{config.mlflow_ui_url}/get-artifact"
    headers = {"Authorization": authorization_header} if authorization_header else {}
    
    try:
        resp = requests.get(
            url,
            params=query_params,
            headers=headers,
            timeout=60,  # Longer timeout for artifact downloads
            stream=True,  # Stream large files
        )
        logger.debug("Artifact GET response status: %s, url: %s", resp.status_code, resp.url)
        
        resp.raise_for_status()
        
        # Determine content type from response headers
        content_type = resp.headers.get("Content-Type", "application/octet-stream")
        
        # Return the file response with proper headers
        return StreamingResponse(
            io.BytesIO(resp.content),
            media_type=content_type,
            headers={
                "Content-Disposition": resp.headers.get("Content-Disposition", ""),
                "Content-Length": resp.headers.get("Content-Length", str(len(resp.content))),
            }
        )
    except requests.exceptions.Timeout as exc:
        logger.error("Timeout while fetching artifact: %s", config.mlflow_ui_url)
        raise HTTPException(
            status_code=504,
            detail=f"Request to MLflow UI timed out. Please check if {config.mlflow_ui_url} is accessible."
        ) from exc
    except requests.exceptions.ConnectionError as exc:
        logger.error("Connection error while fetching artifact: %s - %s", config.mlflow_ui_url, str(exc))
        raise HTTPException(
            status_code=503,
            detail=f"Unable to connect to MLflow UI at {config.mlflow_ui_url}. Please check if the service is running."
        ) from exc
    except requests.exceptions.HTTPError as exc:
        logger.error("HTTP error while fetching artifact: %s - Status: %s, Response: %s",
                     config.mlflow_ui_url, resp.status_code if 'resp' in locals() else 'N/A',
                     resp.text[:500] if 'resp' in locals() else str(exc))
        raise HTTPException(
            status_code=resp.status_code if 'resp' in locals() else 502,
            detail=f"Error fetching artifact from MLflow UI: {str(exc)}"
        ) from exc
    except Exception as exc:
        logger.error("Error while fetching artifact: %s - %s", config.mlflow_ui_url, str(exc))
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching artifact: {str(exc)}"
        ) from exc


async def get_artifacts_path_controller(request: Request, path: str, config: Config):
    """
    Proxy requests to MLflow's /artifacts/{path} endpoint for serving artifact files.
    This endpoint is used by the MLflow UI to display artifact content.
    """
    authorization_header = request.headers.get("Authorization")
    query_params = dict(request.query_params)

    if authorization_header is None:
        authorization_header = get_authorization_header(config)

    url = f"{config.mlflow_ui_url}/artifacts/{path}"
    headers = {"Authorization": authorization_header} if authorization_header else {}
    
    try:
        resp = requests.get(
            url,
            params=query_params,
            headers=headers,
            timeout=60,  # Longer timeout for artifact downloads
            stream=True,  # Stream large files
        )
        logger.debug("Artifacts path GET response status: %s, url: %s", resp.status_code, resp.url)
        
        resp.raise_for_status()
        
        # Determine content type from response headers or file extension
        content_type = resp.headers.get("Content-Type", "application/octet-stream")
        
        # Return the file response with proper headers
        return StreamingResponse(
            io.BytesIO(resp.content),
            media_type=content_type,
            headers={
                "Content-Disposition": resp.headers.get("Content-Disposition", ""),
                "Content-Length": resp.headers.get("Content-Length", str(len(resp.content))),
            }
        )
    except requests.exceptions.Timeout as exc:
        logger.error("Timeout while fetching artifact path: %s/%s", config.mlflow_ui_url, path)
        raise HTTPException(
            status_code=504,
            detail=f"Request to MLflow UI timed out. Please check if {config.mlflow_ui_url} is accessible."
        ) from exc
    except requests.exceptions.ConnectionError as exc:
        logger.error("Connection error while fetching artifact path: %s/%s - %s", config.mlflow_ui_url, path, str(exc))
        raise HTTPException(
            status_code=503,
            detail=f"Unable to connect to MLflow UI at {config.mlflow_ui_url}. Please check if the service is running."
        ) from exc
    except requests.exceptions.HTTPError as exc:
        logger.error("HTTP error while fetching artifact path: %s/%s - Status: %s, Response: %s",
                     config.mlflow_ui_url, path, resp.status_code if 'resp' in locals() else 'N/A',
                     resp.text[:500] if 'resp' in locals() else str(exc))
        raise HTTPException(
            status_code=resp.status_code if 'resp' in locals() else 502,
            detail=f"Error fetching artifact from MLflow UI: {str(exc)}"
        ) from exc
    except Exception as exc:
        logger.error("Error while fetching artifact path: %s/%s - %s", config.mlflow_ui_url, path, str(exc))
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching artifact: {str(exc)}"
        ) from exc
