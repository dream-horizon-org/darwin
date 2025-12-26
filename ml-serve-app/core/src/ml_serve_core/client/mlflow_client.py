"""MLflow client for validating model URIs and detecting model flavors."""

import re
from dataclasses import dataclass
from typing import Tuple, Optional, Dict, Any
from urllib.parse import quote

import aiohttp
import yaml
from loguru import logger

from ml_serve_core.config.configs import Config
from ml_serve_core.constants.constants import DEFAULT_FLAVOR, FLAVOR_TO_IMAGE_CATEGORY


@dataclass
class ModelMetadata:
    """
    Consolidated model metadata fetched from MLflow in a single pass.
    
    This reduces HTTP calls by fetching all needed information at once
    instead of making separate calls for validation, flavor detection, and size.
    """
    run_id: str
    artifact_path: str
    experiment_id: Optional[str]
    uri_type: str  # 'mlflow-artifacts', 'runs', or 'models'
    flavor: str  # Image category: 'sklearn', 'boosting', 'pytorch', 'tensorflow'
    size_bytes: Optional[int]
    mlmodel: Optional[Dict[str, Any]]  # Raw MLmodel file content


class MLflowClient:
    """Client for validating MLflow model URIs."""
    
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(MLflowClient, cls).__new__(cls)
        return cls._instance

    def __init__(
        self,
        tracking_uri: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None
    ):
        if hasattr(self, '_initialized') and self._initialized:
            return
            
        config = Config()
        self.tracking_uri = tracking_uri or config.mlflow_tracking_uri
        self.username = username or config.mlflow_tracking_username
        self.password = password or config.mlflow_tracking_password
        self.tracking_uri = self.tracking_uri.rstrip('/') if self.tracking_uri else ""
        self._initialized = True
    
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
        if not model_uri:
            return None, None, None, None

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
    
    async def validate_model_uri(
        self, 
        model_uri: str,
        resolved_run_id: Optional[str] = None,
        resolved_artifact_path: Optional[str] = None,
        resolved_experiment_id: Optional[str] = None,
    ) -> Tuple[bool, str]:
        """
        Validate that a model exists at the given URI.
        
        Args:
            model_uri: MLflow model URI
            resolved_run_id: Pre-resolved run ID (from get_model_metadata) to skip re-resolution
            resolved_artifact_path: Pre-resolved artifact path to skip re-resolution
            resolved_experiment_id: Pre-resolved experiment ID for validation
            
        Returns:
            Tuple of (is_valid, error_message)
            - (True, "") if valid
            - (False, error_message) if invalid
        """
        if not self.tracking_uri:
            # If no tracking URI is configured, skip validation
            logger.warning("MLFLOW_TRACKING_URI not configured, skipping model URI validation")
            return True, ""
        
        # Use pre-resolved values if provided, otherwise parse the URI
        if resolved_run_id is not None:
            # Use pre-resolved values from get_model_metadata()
            run_id = resolved_run_id
            artifact_path = resolved_artifact_path or ""
            experiment_id = resolved_experiment_id
            # Validate run and artifact directly
            try:
                return await self._validate_run_and_artifact(run_id, artifact_path, experiment_id)
            except aiohttp.ClientError as e:
                logger.error(f"Network error validating model URI: {e}")
                return False, f"Unable to connect to MLflow server. Please check if MLflow is accessible."
            except Exception as e:
                logger.error(f"Error validating model URI: {e}")
                return False, f"Error validating model: {str(e)}"
        
        # Parse the URI (fallback for direct calls without pre-resolution)
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

    async def get_model_size(self, model_uri: str) -> Optional[int]:
        """Get total size of model artifacts in bytes."""
        if not self.tracking_uri:
            return None

        try:
            run_id, artifact_path = await self._resolve_run_and_path(model_uri)
            if not run_id:
                return None
            return await self._calculate_artifacts_size(run_id, artifact_path)
        except Exception as e:
            logger.warning(f"Failed to determine model size for {model_uri}: {e}")
            return None

    async def _resolve_run_and_path(self, model_uri: str) -> Tuple[Optional[str], Optional[str]]:
        """Resolve model URI to run_id and artifact_path."""
        identifier, artifact_path, uri_type, _ = self._parse_model_uri(model_uri)
        
        if uri_type == "runs":
            return identifier, artifact_path
        
        elif uri_type == "mlflow-artifacts":
            return identifier, artifact_path
            
        elif uri_type == "models":
            # identifier is model_name, artifact_path is version/stage
            return await self._resolve_model_version_source(identifier, artifact_path)
            
        return None, None

    async def _resolve_model_version_source(self, model_name: str, version_or_stage: str) -> Tuple[Optional[str], Optional[str]]:
        """Get run_id and artifact_path from registered model version."""
        headers = self._get_auth_headers()
        async with aiohttp.ClientSession() as session:
            if version_or_stage.isdigit():
                url = f"{self.tracking_uri}/api/2.0/mlflow/model-versions/get"
                params = {"name": model_name, "version": version_or_stage}
                async with session.get(url, params=params, headers=headers) as response:
                    if response.status != 200:
                        return None, None
                    data = await response.json()
                    mv = data.get("model_version", {})
            else:
                # Stage
                url = f"{self.tracking_uri}/api/2.0/mlflow/model-versions/search"
                params = {"filter": f"name='{model_name}'"}
                async with session.get(url, params=params, headers=headers) as response:
                    if response.status != 200:
                        return None, None
                    data = await response.json()
                    versions = data.get("model_versions", [])
                    # Filter by stage
                    stage_versions = [v for v in versions if v.get("current_stage", "").lower() == version_or_stage.lower()]
                    if not stage_versions:
                        return None, None
                    stage_versions.sort(key=lambda v: int(v.get("version", 0)), reverse=True)
                    mv = stage_versions[0]
            
            run_id = mv.get("run_id")
            source = mv.get("source", "")
            # Heuristic to extract relative path from source URL/path
            path = source.split("/artifacts/", 1)[1] if "/artifacts/" in source else ""
            return run_id, path

    async def _calculate_artifacts_size(self, run_id: str, path: str) -> int:
        """Recursively calculate total size of artifacts."""
        total_size = 0
        stack = [path] if path else [""]

        headers = self._get_auth_headers()
        url = f"{self.tracking_uri}/api/2.0/mlflow/artifacts/list"
        
        async with aiohttp.ClientSession() as session:
            while stack:
                current_path = stack.pop()
                params = {"run_id": run_id}
                if current_path:
                    params["path"] = current_path
                
                try:
                    async with session.get(url, params=params, headers=headers) as response:
                        if response.status != 200:
                            continue
                        
                        data = await response.json()
                        files = data.get("files", [])
                        
                        for f in files:
                            if f.get("is_dir"):
                                stack.append(f.get("path"))
                            else:
                                total_size += int(f.get("file_size", 0))
                except Exception as e:
                    logger.warning(f"Error listing artifacts at {current_path}: {e}")
                            
        return total_size

    async def get_model_flavor(self, model_uri: str) -> str:
        """
        Detect the model flavor from the MLmodel file.
        
        Args:
            model_uri: MLflow model URI
            
        Returns:
            Image category name: 'sklearn', 'boosting', 'pytorch', 'tensorflow'
            Returns DEFAULT_FLAVOR as default if detection fails.
        """
        if not self.tracking_uri:
            logger.warning(f"MLFLOW_TRACKING_URI not configured, defaulting to {DEFAULT_FLAVOR} image")
            return DEFAULT_FLAVOR
        
        try:
            run_id, artifact_path = await self._resolve_run_and_path(model_uri)
            if not run_id or artifact_path is None:
                logger.warning(f"Could not resolve run/path for {model_uri}, defaulting to {DEFAULT_FLAVOR}")
                return DEFAULT_FLAVOR
            
            mlmodel_content = await self._fetch_mlmodel_file(run_id, artifact_path)
            if not mlmodel_content:
                logger.warning(f"Could not fetch MLmodel for {model_uri}, defaulting to {DEFAULT_FLAVOR}")
                return DEFAULT_FLAVOR
            
            flavors = mlmodel_content.get("flavors", {})
            detected_flavor = self._detect_primary_flavor(flavors)
            image_category = FLAVOR_TO_IMAGE_CATEGORY.get(detected_flavor, DEFAULT_FLAVOR)
            
            logger.info(f"Detected flavor '{detected_flavor}' -> image category '{image_category}' for {model_uri}")
            return image_category
            
        except Exception as e:
            logger.error(f"Error detecting model flavor for {model_uri}: {e}, defaulting to {DEFAULT_FLAVOR}")
            return DEFAULT_FLAVOR
    
    async def _fetch_mlmodel_file(self, run_id: str, artifact_path: str) -> Optional[Dict[str, Any]]:
        """
        Fetch and parse the MLmodel file content from MLflow.
        
        Args:
            run_id: MLflow run ID
            artifact_path: Path to model artifact (e.g., "model")
            
        Returns:
            Parsed MLmodel dict or None if not found/failed
        """
        headers = self._get_auth_headers()
        mlmodel_path = f"{artifact_path}/MLmodel" if artifact_path else "MLmodel"
        
        # Use MLflow artifact download API
        url = f"{self.tracking_uri}/get-artifact"
        params = {"run_id": run_id, "path": mlmodel_path}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=headers) as response:
                if response.status != 200:
                    logger.debug(f"Failed to fetch MLmodel file: {response.status}")
                    return None
                
                content = await response.text()
                try:
                    return yaml.safe_load(content)
                except yaml.YAMLError as e:
                    logger.warning(f"Failed to parse MLmodel YAML: {e}")
                    return None
    
    def _detect_primary_flavor(self, flavors: Dict[str, Any]) -> str:
        """
        Detect the primary model flavor from the flavors dict.
        
        Priority order:
        1. Specific ML framework flavors (sklearn, xgboost, etc.)
        2. Deep learning frameworks (pytorch, tensorflow)
        3. Fallback to python_function
        
        Args:
            flavors: Dict of flavors from MLmodel file
            
        Returns:
            Primary flavor name
        """
        if not flavors:
            return "python_function"
        
        # Priority order for detection
        priority_flavors = [
            # Boosting models (check first as they're specific)
            "xgboost", "lightgbm", "catboost",
            # Traditional ML
            "sklearn",
            # Deep learning
            "pytorch", "torch", "tensorflow", "keras",
        ]
        
        for flavor in priority_flavors:
            if flavor in flavors:
                return flavor
        
        # Fallback to python_function if present
        if "python_function" in flavors:
            return "python_function"
        
        # Return first available flavor
        return next(iter(flavors.keys()), "python_function")

    async def get_model_metadata(self, model_uri: str) -> ModelMetadata:
        """
        Fetch all model metadata in a single pass to reduce HTTP calls.
        
        This method consolidates the logic from validate_model_uri, get_model_flavor,
        and get_model_size into a single operation that:
        1. Parses the URI once
        2. Resolves run_id/path once (important for models:/ URIs)
        3. Fetches MLmodel file once
        4. Calculates size with reused session
        
        Args:
            model_uri: MLflow model URI
            
        Returns:
            ModelMetadata with all fields populated
        """
        # Parse URI once
        identifier, artifact_path, uri_type, experiment_id = self._parse_model_uri(model_uri)
        
        if uri_type is None:
            logger.warning(f"Invalid model URI format: {model_uri}")
            return ModelMetadata(
                run_id="",
                artifact_path="",
                experiment_id=None,
                uri_type="unknown",
                flavor=DEFAULT_FLAVOR,
                size_bytes=None,
                mlmodel=None
            )
        
        # Resolve run_id and artifact_path (one HTTP call for models:/ URIs)
        if uri_type == "models":
            run_id, resolved_path = await self._resolve_model_version_source(identifier, artifact_path)
            if not run_id:
                logger.warning(f"Could not resolve models:/ URI: {model_uri}")
                return ModelMetadata(
                    run_id="",
                    artifact_path=artifact_path or "",
                    experiment_id=experiment_id,
                    uri_type=uri_type,
                    flavor=DEFAULT_FLAVOR,
                    size_bytes=None,
                    mlmodel=None
                )
            artifact_path = resolved_path
        else:
            # For mlflow-artifacts:/ and runs:/ URIs, identifier is already run_id
            run_id = identifier
        
        # Fetch MLmodel and calculate size with shared session
        mlmodel_content = None
        size_bytes = None
        flavor = DEFAULT_FLAVOR
        
        if self.tracking_uri and run_id:
            headers = self._get_auth_headers()
            
            async with aiohttp.ClientSession() as session:
                # Fetch MLmodel file
                mlmodel_path = f"{artifact_path}/MLmodel" if artifact_path else "MLmodel"
                url = f"{self.tracking_uri}/get-artifact"
                params = {"run_id": run_id, "path": mlmodel_path}
                
                try:
                    async with session.get(url, params=params, headers=headers) as response:
                        if response.status == 200:
                            content = await response.text()
                            try:
                                mlmodel_content = yaml.safe_load(content)
                                flavors = mlmodel_content.get("flavors", {})
                                detected_flavor = self._detect_primary_flavor(flavors)
                                flavor = FLAVOR_TO_IMAGE_CATEGORY.get(detected_flavor, DEFAULT_FLAVOR)
                            except yaml.YAMLError as e:
                                logger.warning(f"Failed to parse MLmodel YAML: {e}")
                except Exception as e:
                    logger.warning(f"Error fetching MLmodel: {e}")
                
                # Calculate artifacts size (reusing session)
                try:
                    size_bytes = await self._calculate_artifacts_size_with_session(
                        session, run_id, artifact_path or "", headers
                    )
                except Exception as e:
                    logger.warning(f"Error calculating model size: {e}")
        
        logger.info(
            f"Fetched metadata for {model_uri}: "
            f"flavor={flavor}, size={size_bytes or 'unknown'} bytes"
        )
        
        return ModelMetadata(
            run_id=run_id or "",
            artifact_path=artifact_path or "",
            experiment_id=experiment_id,
            uri_type=uri_type,
            flavor=flavor,
            size_bytes=size_bytes,
            mlmodel=mlmodel_content
        )

    async def _calculate_artifacts_size_with_session(
        self, 
        session: aiohttp.ClientSession, 
        run_id: str, 
        path: str,
        headers: dict
    ) -> int:
        """
        Calculate total size of artifacts using an existing session.
        
        This is an optimized version of _calculate_artifacts_size that reuses
        an existing aiohttp session instead of creating a new one.
        """
        total_size = 0
        stack = [path] if path else [""]
        url = f"{self.tracking_uri}/api/2.0/mlflow/artifacts/list"
        
        while stack:
            current_path = stack.pop()
            params = {"run_id": run_id}
            if current_path:
                params["path"] = current_path
            
            try:
                async with session.get(url, params=params, headers=headers) as response:
                    if response.status != 200:
                        continue
                    
                    data = await response.json()
                    files = data.get("files", [])
                    
                    for f in files:
                        if f.get("is_dir"):
                            stack.append(f.get("path"))
                        else:
                            total_size += int(f.get("file_size", 0))
            except Exception as e:
                logger.warning(f"Error listing artifacts at {current_path}: {e}")
                        
        return total_size
