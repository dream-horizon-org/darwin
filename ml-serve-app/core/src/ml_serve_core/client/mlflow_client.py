"""MLflow client for validating model URIs."""

import re
from typing import Tuple, Optional
from urllib.parse import quote

import aiohttp
from loguru import logger

from ml_serve_core.constants.constants import (
    MLFLOW_TRACKING_URI,
    MLFLOW_TRACKING_USERNAME,
    MLFLOW_TRACKING_PASSWORD
)


class MLflowClient:
    """Client for validating MLflow model URIs."""
    
    def __init__(self):
        self.tracking_uri = MLFLOW_TRACKING_URI
        self.username = MLFLOW_TRACKING_USERNAME
        self.password = MLFLOW_TRACKING_PASSWORD
    
    def _get_auth_headers(self) -> dict:
        """Get authentication headers if credentials are configured."""
        headers = {}
        if self.username and self.password:
            import base64
            credentials = base64.b64encode(f"{self.username}:{self.password}".encode()).decode()
            headers["Authorization"] = f"Basic {credentials}"
        return headers
    
    def _parse_model_uri(self, model_uri: str) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
        """
        Parse MLflow model URI to extract components.
        
        Supported formats:
        - mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/{path}
        - runs:/{run_id}/{artifact_path}
        - models:/{model_name}/{version_or_stage}
        
        Returns:
            Tuple of (identifier, artifact_path, uri_type, experiment_id)
            - For mlflow-artifacts: (run_id, artifact_path, "mlflow-artifacts", experiment_id)
            - For runs: (run_id, artifact_path, "runs", None)
            - For models: (model_name, version, "models", None)
        """
        if model_uri.startswith("mlflow-artifacts:/"):
            # Format: mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/{path}
            match = re.match(r"mlflow-artifacts:/(\d+)/([^/]+)/artifacts/(.+)", model_uri)
            if match:
                experiment_id, run_id, artifact_path = match.groups()
                return run_id, artifact_path, "mlflow-artifacts", experiment_id
            return None, None, None, None
        
        elif model_uri.startswith("runs:/"):
            # Format: runs:/{run_id}/{artifact_path}
            match = re.match(r"runs:/([^/]+)/(.+)", model_uri)
            if match:
                run_id, artifact_path = match.groups()
                return run_id, artifact_path, "runs", None
            return None, None, None, None
        
        elif model_uri.startswith("models:/"):
            # Format: models:/{model_name}/{version_or_stage}
            match = re.match(r"models:/([^/]+)/(.+)", model_uri)
            if match:
                model_name, version = match.groups()
                return model_name, version, "models", None
            return None, None, None, None
        
        return None, None, None, None
    
    async def validate_model_uri(self, model_uri: str) -> Tuple[bool, str]:
        """
        Validate that a model exists at the given URI.
        
        Args:
            model_uri: MLflow model URI
            
        Returns:
            Tuple of (is_valid, error_message)
            - (True, "") if valid
            - (False, error_message) if invalid
        """
        if not self.tracking_uri:
            # If no tracking URI is configured, skip validation
            logger.warning("MLFLOW_TRACKING_URI not configured, skipping model URI validation")
            return True, ""
        
        # Parse the URI
        identifier, artifact_path, uri_type, experiment_id = self._parse_model_uri(model_uri)
        
        if uri_type is None:
            return False, f"Invalid model URI format: '{model_uri}'. Expected formats: 'mlflow-artifacts:/...', 'runs:/...', or 'models:/...'"
        
        try:
            if uri_type in ("mlflow-artifacts", "runs"):
                return await self._validate_run_and_artifact(identifier, artifact_path, experiment_id)
            elif uri_type == "models":
                return await self._validate_registered_model(identifier, artifact_path)
            else:
                return False, f"Unsupported model URI type: {uri_type}"
        except aiohttp.ClientError as e:
            logger.error(f"Network error validating model URI: {e}")
            return False, f"Unable to connect to MLflow server. Please check if MLflow is accessible."
        except Exception as e:
            logger.error(f"Error validating model URI: {e}")
            return False, f"Error validating model: {str(e)}"
    
    async def _validate_run_and_artifact(self, run_id: str, artifact_path: str, experiment_id: Optional[str] = None) -> Tuple[bool, str]:
        """
        Validate that a run exists, belongs to the correct experiment, and has the model artifact.
        
        This does concrete validation by:
        1. Checking if the run exists
        2. Verifying the experiment_id matches (if provided)
        3. Checking if the MLmodel file exists at the artifact path
        """
        url = f"{self.tracking_uri}/api/2.0/mlflow/runs/get"
        headers = self._get_auth_headers()
        
        async with aiohttp.ClientSession() as session:
            # Step 1: Check if run exists
            async with session.get(url, params={"run_id": run_id}, headers=headers) as response:
                if response.status == 404:
                    return False, f"Run not found: Run ID '{run_id}' does not exist in MLflow."
                
                if response.status == 401:
                    return False, "Authentication failed. Please check MLflow credentials."
                
                if response.status != 200:
                    body = await response.text()
                    return False, f"Failed to validate run: {body}"
                
                data = await response.json()
                run_info = data.get("run", {}).get("info", {})
                
                # Check if run is not deleted
                lifecycle_stage = run_info.get("lifecycle_stage", "active")
                if lifecycle_stage == "deleted":
                    return False, f"Run '{run_id}' has been deleted."
                
                # Step 2: Verify experiment_id matches (critical for mlflow-artifacts:/ URIs)
                if experiment_id:
                    actual_experiment_id = run_info.get("experiment_id", "")
                    if str(actual_experiment_id) != str(experiment_id):
                        return False, (
                            f"Experiment ID mismatch: Run '{run_id}' belongs to experiment '{actual_experiment_id}', "
                            f"not experiment '{experiment_id}'. Please verify your model URI."
                        )
            
            # Step 3: Check if the MLmodel file exists at the artifact path (concrete validation)
            artifacts_url = f"{self.tracking_uri}/api/2.0/mlflow/artifacts/list"
            
            async with session.get(
                artifacts_url, 
                params={"run_id": run_id, "path": artifact_path},
                headers=headers
            ) as response:
                if response.status == 404:
                    return False, f"Model not found at path '{artifact_path}' in run '{run_id}'."
                
                if response.status != 200:
                    body = await response.text()
                    # Check for specific "path not found" errors
                    if "RESOURCE_DOES_NOT_EXIST" in body or "could not be found" in body.lower():
                        return False, f"Model not found at path '{artifact_path}' in run '{run_id}'."
                    logger.warning(f"Could not verify artifact path: {body}")
                    # Don't fail here - the run exists and experiment matches
                    return True, ""
                
                # Verify the MLmodel file exists (this confirms it's a valid MLflow model)
                data = await response.json()
                files = data.get("files", [])
                
                if not files:
                    return False, f"No model found at path '{artifact_path}' in run '{run_id}'."
                
                # Look for MLmodel file which indicates a valid MLflow model
                has_mlmodel = any(
                    f.get("path", "").endswith("MLmodel") or f.get("path", "") == "MLmodel"
                    for f in files
                )
                
                if not has_mlmodel:
                    # List what we found for debugging
                    found_files = [f.get("path", "") for f in files[:5]]
                    return False, (
                        f"Path '{artifact_path}' exists but does not contain a valid MLflow model. "
                        f"Expected 'MLmodel' file. Found: {found_files}"
                    )
        
        return True, ""
    
    async def _validate_registered_model(self, model_name: str, version: str) -> Tuple[bool, str]:
        """Validate that a registered model version exists."""
        headers = self._get_auth_headers()
        
        async with aiohttp.ClientSession() as session:
            # Check if it's a version number or stage
            if version.isdigit():
                # It's a version number
                url = f"{self.tracking_uri}/api/2.0/mlflow/model-versions/get"
                params = {"name": model_name, "version": version}
            else:
                # It's a stage (like "Production", "Staging")
                url = f"{self.tracking_uri}/api/2.0/mlflow/registered-models/get-latest-versions"
                params = {"name": model_name, "stages": [version]}
            
            async with session.get(url, params=params, headers=headers) as response:
                if response.status == 404:
                    return False, f"Model not found: '{model_name}' version/stage '{version}' does not exist."
                
                if response.status == 401:
                    return False, "Authentication failed. Please check MLflow credentials."
                
                if response.status != 200:
                    body = await response.text()
                    # Check for specific error about model not found
                    if "RESOURCE_DOES_NOT_EXIST" in body:
                        return False, f"Model '{model_name}' is not registered in MLflow."
                    return False, f"Failed to validate model: {body}"
                
                data = await response.json()
                
                # For stage queries, check if any version was returned
                if not version.isdigit():
                    model_versions = data.get("model_versions", [])
                    if not model_versions:
                        return False, f"No model version found for '{model_name}' at stage '{version}'."
        
        return True, ""

