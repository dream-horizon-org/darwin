import os
import json
from typing import Any, Dict, List, Optional

import mlflow
import yaml

from .model_loader_interface import ModelLoaderInterface
from src.config.config import Config
from src.config.logger import logger
from src.schema.schema_extractor import SchemaExtractor


class MLFlowModelLoader(ModelLoaderInterface):
    def __init__(self, config: Config):
        # Initialize the model URI and MLflow configuration
        self.mlflow = mlflow
        self.config = config
        self._loaded_model: Any = None
        self._schema_extractor: Optional[SchemaExtractor] = None
        self._file_schema: Optional[Dict[str, Any]] = None
        
        if self.config.get_mlflow_tracking_username:
            os.environ["MLFLOW_TRACKING_USERNAME"] = self.config.get_mlflow_tracking_username
        
        if self.config.get_mlflow_tracking_password:
            os.environ["MLFLOW_TRACKING_PASSWORD"] = self.config.get_mlflow_tracking_password
        
        if self.config.get_mlflow_tracking_uri:
            mlflow.set_tracking_uri(uri=self.config.get_mlflow_tracking_uri)
        
        # Pre-load schema from MLmodel file if local path available (no model loading needed)
        if self.config.get_model_local_path:
            logger.info(f"Pre-loading schema from local model path: {self.config.get_model_local_path}")
            self._file_schema = self._load_schema_from_file(self.config.get_model_local_path)
            if self._file_schema:
                logger.info("Schema pre-loaded from MLmodel file (no model deserialization needed)")
            else:
                logger.debug("No schema found in MLmodel file, will extract on model load")
    
    def _load_schema_from_file(self, model_path: str) -> Optional[Dict[str, Any]]:
        """
        Load schema directly from MLmodel YAML file without loading the model.
        This enables /schema API to work instantly without model deserialization.
        """
        try:
            mlmodel_path = os.path.join(model_path, "MLmodel")
            if not os.path.exists(mlmodel_path):
                return None
            
            with open(mlmodel_path, 'r') as f:
                mlmodel = yaml.safe_load(f)
            
            signature = mlmodel.get("signature", {})
            if not signature:
                return None
            
            # Parse signature inputs/outputs from JSON strings
            inputs_str = signature.get("inputs", "[]")
            outputs_str = signature.get("outputs", "[]")
            
            inputs = json.loads(inputs_str) if isinstance(inputs_str, str) else inputs_str
            outputs = json.loads(outputs_str) if isinstance(outputs_str, str) else outputs_str
            
            # Load input example if available
            input_example = self._load_input_example_from_file(model_path, mlmodel)
            
            return {
                "inputs": inputs,
                "outputs": outputs,
                "input_example": input_example,
            }
        except Exception as e:
            logger.warning(f"Could not load schema from MLmodel file: {e}")
            return None
    
    def _load_input_example_from_file(self, model_path: str, mlmodel: Dict) -> Optional[Dict[str, Any]]:
        """Load input example from artifact file."""
        try:
            example_info = mlmodel.get("saved_input_example_info", {})
            if not example_info:
                return None
            
            artifact_path = example_info.get("artifact_path")
            if not artifact_path:
                return None
            
            example_file = os.path.join(model_path, artifact_path)
            if not os.path.exists(example_file):
                return None
            
            with open(example_file, 'r') as f:
                example_data = json.load(f)
            
            # Handle pandas split format
            if isinstance(example_data, dict):
                if "columns" in example_data and "data" in example_data:
                    # Pandas split format: {"columns": [...], "data": [[...]]}
                    columns = example_data["columns"]
                    data = example_data["data"][0] if example_data["data"] else []
                    return dict(zip(columns, data))
                elif "dataframe_split" in example_data:
                    # Serving format: {"dataframe_split": {"columns": [...], "data": [[...]]}}
                    split = example_data["dataframe_split"]
                    columns = split.get("columns", [])
                    data = split.get("data", [[]])[0]
                    return dict(zip(columns, data))
            return example_data
        except Exception:
            return None

    def load_model(self):
        """Load the MLflow model from the specified URI."""
        # Prefer a local path when provided (init container pre-download)
        model_uri = self.config.get_model_local_path or self.config.get_model_uri
        logger.info(f"Loading MLflow model from: {model_uri}")
        self._loaded_model = self.mlflow.pyfunc.load_model(model_uri=model_uri)
        logger.info("Model loaded successfully, initializing schema extractor")
        # Initialize schema extractor with the loaded model
        self._schema_extractor = SchemaExtractor(self._loaded_model)
        return self._loaded_model

    def reload_model(self):
        """Reload the MLflow model from the specified URI."""
        # Prefer a local path when provided (init container pre-download)
        model_uri = self.config.get_model_local_path or self.config.get_model_uri
        self._loaded_model = self.mlflow.pyfunc.load_model(model_uri=model_uri)
        # Re-initialize schema extractor
        self._schema_extractor = SchemaExtractor(self._loaded_model)
        return self._loaded_model
    
    @property
    def schema_extractor(self) -> Optional[SchemaExtractor]:
        """Get the schema extractor for the loaded model."""
        return self._schema_extractor
    
    def has_signature(self) -> bool:
        """Check if the model has a signature"""
        if self._file_schema is not None:
            return bool(self._file_schema.get("inputs"))
        if self._schema_extractor is None:
            return False
        return self._schema_extractor.has_signature
    
    def get_input_schema(self) -> List[Dict[str, Any]]:
        """Get the input schema"""
        if self._file_schema is not None:
            return self._file_schema.get("inputs", [])
        if self._schema_extractor is None:
            return []
        return self._schema_extractor.get_input_schema()
    
    def get_output_schema(self) -> List[Dict[str, Any]]:
        """Get the output schema"""
        if self._file_schema is not None:
            return self._file_schema.get("outputs", [])
        if self._schema_extractor is None:
            return []
        return self._schema_extractor.get_output_schema()
    
    def get_input_example(self) -> Optional[Dict[str, Any]]:
        """Get the input example"""
        if self._file_schema is not None:
            return self._file_schema.get("input_example")
        if self._schema_extractor is None:
            return None
        return self._schema_extractor.get_input_example()
    
    def get_full_schema(self) -> Dict[str, Any]:
        """Get the complete schema information"""
        if self._file_schema is not None:
            return self._file_schema
        if self._schema_extractor is None:
            return {"inputs": [], "outputs": [], "input_example": None}
        return self._schema_extractor.get_full_schema()
