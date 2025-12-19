import os
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, model_validator

from src.api_client import APIClient
from src.config.config import Config
from src.feature_store.feature_store import FeatureStoreClient
from src.model.model import Model
from src.model.model_loader.ml_flow_model_loader import MLFlowModelLoader
from src.schema.dynamic_model import get_schema_as_json_schema


# Response models for schema endpoints
class SchemaColumn(BaseModel):
    """Schema for a single column/feature."""
    name: str = Field(..., description="Column/feature name")
    type: str = Field(..., description="Data type (e.g., 'double', 'integer', 'string')")
    required: bool = Field(True, description="Whether this field is required")


class SchemaResponse(BaseModel):
    """Response model for /schema endpoint."""
    inputs: List[SchemaColumn] = Field(..., description="Input feature schema")
    outputs: List[Dict[str, Any]] = Field(..., description="Output prediction schema")
    sample_request: Optional[Dict[str, Any]] = Field(None, description="Copy-paste ready sample request for /predict")
    json_schema: Optional[Dict[str, Any]] = Field(None, description="JSON Schema format for validation")


class PredictRequest(BaseModel):
    """
    Request model for prediction endpoint.
    
    Supports two modes:
    
    Mode 1 - Feature Store (OFS) Mode:
        Provide feature_group and ofs_keys to fetch features from the feature store.
        
    Mode 2 - Direct Features Mode:
        Provide features dictionary directly to bypass feature store.
    
    Attributes:
        feature_group: (Optional) Name of the feature group to fetch features from
        ofs_keys: (Optional) Dictionary containing primary keys for feature lookup
        features: (Optional) Dictionary containing feature names and values directly
        
    Examples:
        Mode 1 - Using Feature Store:
        {
            "feature_group": "serve_test_fg",
            "ofs_keys": {"user_id": 1}
        }
        
        Mode 2 - Direct Features:
        {
            "features": {
                "airconditioning": 0,
                "area": 4640,
                "basement": 0,
                "bathrooms": 1,
                "bedrooms": 4,
                "furnishingstatus": 1,
                "guestroom": 0,
                "hotwaterheating": 0,
                "mainroad": 1,
                "parking": 1,
                "prefarea": 0,
                "stories": 2
            }
        }
    """
    feature_group: Optional[str] = Field(None, description="Name of the feature group (for OFS mode)")
    ofs_keys: Optional[Dict[str, Any]] = Field(None, description="Primary keys for feature lookup (for OFS mode)")
    features: Optional[Dict[str, Any]] = Field(None, description="Feature dictionary for direct prediction (bypass OFS)")

    @model_validator(mode='after')
    def validate_mode(self):
        """Validate that either (feature_group + ofs_keys) OR features is provided"""
        has_ofs_mode = self.feature_group is not None and self.ofs_keys is not None
        has_direct_mode = self.features is not None
        
        if not has_ofs_mode and not has_direct_mode:
            raise ValueError(
                "Either provide (feature_group + ofs_keys) for OFS mode, "
                "or provide (features) for direct prediction mode"
            )
        
        if has_ofs_mode and has_direct_mode:
            raise ValueError(
                "Cannot use both modes simultaneously. "
                "Either provide (feature_group + ofs_keys) OR (features), not both"
            )
        
        if self.feature_group is not None and self.ofs_keys is None:
            raise ValueError("feature_group requires ofs_keys")
        
        if self.ofs_keys is not None and self.feature_group is None:
            raise ValueError("ofs_keys requires feature_group")
        
        return self


class PredictResponse(BaseModel):
    """Response model for prediction endpoint"""
    prediction: Any = Field(..., description="Model prediction result")

# ROOT_PATH is used for proper OpenAPI/Swagger docs when behind a reverse proxy
# e.g., if app is served at /my-model/, set ROOT_PATH=/my-model
root_path = os.environ.get("ROOT_PATH", "")
app = FastAPI(root_path=root_path)

config = Config()

model_loader = MLFlowModelLoader(config=config)

api_client = APIClient(config=config)

feature_store_client = FeatureStoreClient(api_client=api_client, config=config)

model = Model(model_loader=model_loader)


@app.get("/healthcheck")
async def healthcheck():
    """Health check endpoint to verify service is running"""
    return {"status": "healthy"}


def _generate_sample_request(input_schema: List[Dict[str, Any]], input_example: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate a copy-paste ready sample request for /predict endpoint.
    
    Args:
        input_schema: List of column definitions
        input_example: Optional input example from MLflow model
        
    Returns:
        Dict in the format {"features": {...}} ready for /predict
    """
    # Use input_example if available, otherwise generate placeholder values
    if input_example:
        features = input_example
    else:
        # Use representative example values that clearly show the expected type
        # For float/double: use 1.5 instead of 0.0 to force JSON to display decimal point
        type_defaults = {
            "double": 1.5,
            "float": 1.5,
            "long": 0,
            "integer": 0,
            "string": "string",
            "boolean": True,
        }
        
        features = {}
        for col in input_schema:
            col_type = col.get("type", "object")
            features[col["name"]] = type_defaults.get(col_type, None)
    
    return {"features": features}


def _coerce_features_to_schema(features: Dict[str, Any], schema: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Coerce feature types to match schema expectations.
    Handles int→float conversion for MLflow compatibility.
    
    Args:
        features: Dictionary of feature names to values
        schema: List of column definitions with 'name' and 'type'
        
    Returns:
        Dictionary with coerced types
    """
    schema_map = {col["name"]: col["type"] for col in schema}
    coerced = {}
    
    for name, value in features.items():
        expected_type = schema_map.get(name)
        
        # Convert int to float for double/float fields to avoid MLflow type errors
        if expected_type in ("double", "float") and isinstance(value, int) and not isinstance(value, bool):
            coerced[name] = float(value)
        else:
            coerced[name] = value
    
    return coerced


@app.get("/schema", response_model=SchemaResponse)
async def get_schema():
    """
    Get the model's input/output schema.
    
    Returns schema information extracted from the MLflow model signature.
    This allows API users to programmatically discover what features
    the model expects and their data types.
    
    Returns:
        SchemaResponse containing:
        - inputs: List of input features with name, type, and required flag
        - outputs: List of output fields
        - sample_request: Copy-paste ready payload for POST /predict
        - json_schema: JSON Schema format for validation
        
    Raises:
        HTTPException 400: If model does not have a signature logged
    """
    try:
        if not model.has_signature():
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Model does not have a signature.",
                    "hint": "Please re-log the model with infer_signature() and input_example. "
                            "See MLflow documentation: https://mlflow.org/docs/latest/model/signatures.html"
                }
            )
        
        full_schema = model.get_full_schema()
        input_schema = full_schema.get("inputs", [])
        input_example = full_schema.get("input_example")
        
        # Generate sample_request (copy-paste ready for /predict)
        sample_request = _generate_sample_request(input_schema, input_example) if input_schema else None
        
        return SchemaResponse(
            inputs=[SchemaColumn(**col) for col in input_schema],
            outputs=full_schema.get("outputs", []),
            sample_request=sample_request,
            json_schema=get_schema_as_json_schema(input_schema)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve schema: {str(e)}"
        )


@app.post("/predict", response_model=Dict[str, Any])
async def predict(request: PredictRequest):
    """
    Make predictions using the loaded model.
    
    Supports two modes:
    
    **Mode 1 - Feature Store (OFS) Mode:**
    - Provide feature_group and ofs_keys
    - System fetches features from feature store
    - Steps:
      1. Fetches feature group metadata to get all available columns
      2. Determines which features need to be fetched (excludes the primary keys provided)
      3. Fetches the features from the feature store using the provided primary keys
      4. Makes a prediction using the model
    
    **Mode 2 - Direct Features Mode:**
    - Provide features dictionary directly
    - Bypasses feature store completely
    - Steps:
      1. Uses provided features dictionary directly
      2. Validates features against model schema (if available)
      3. Makes a prediction using the model
    
    Args:
        request: PredictRequest containing either:
                 - (feature_group + ofs_keys) for OFS mode, OR
                 - (features) for direct mode
        
    Returns:
        Dictionary containing the prediction result
        
    Raises:
        HTTPException 422: If features do not match model schema
        HTTPException 500: If prediction fails
    """
    try:
        # Mode 2: Direct Features Mode (bypass OFS)
        if request.features is not None:
            feature_dict = request.features
            
            # Validate features against model schema (strict validation)
            if model.has_signature():
                is_valid, validation_errors = model.validate_features(feature_dict)
                
                # Filter out unknown_field errors (we only fail on missing/type errors)
                critical_errors = [
                    e for e in validation_errors 
                    if e.get("error_type") != "unknown_field"
                ]
                
                if not is_valid and critical_errors:
                    raise HTTPException(
                        status_code=422,
                        detail={
                            "message": "Request features do not match model schema",
                            "errors": critical_errors,
                            "expected_schema": model.get_input_schema(),
                            "hint": "Use GET /schema to see the expected input format"
                        }
                    )
        
        # Mode 1: Feature Store (OFS) Mode
        else:
            # Fetch feature group metadata to get all columns
            fg_columns = await feature_store_client.fetch_feature_meta_data(
                feature_group_name=request.feature_group
            )

            # Calculate which features need to be fetched (exclude primary keys)
            feature_columns = list(set(fg_columns) - request.ofs_keys.keys())

            # Fetch features from feature store
            features: Dict = await feature_store_client.fetch_feature_group_data(
                feature_group_name=request.feature_group,
                feature_columns=feature_columns,
                primary_key_names=list(request.ofs_keys.keys()),
                primary_key_values=[list(request.ofs_keys.values())],
            )

            # Combine fetched features with provided keys
            feature_dict = dict(zip(feature_columns, features))

        # Coerce numeric types to match schema expectations (int→float for MLflow)
        if model.has_signature():
            feature_dict = _coerce_features_to_schema(feature_dict, model.get_input_schema())

        # Make prediction (same for both modes)
        result = await model.predict(feature_dict)

        return result
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is (model not loaded, validation errors, etc.)
        raise
    except ValueError as e:
        # Validation errors from model or feature processing
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Invalid input data",
                "error": str(e),
                "hint": "Use GET /schema to see the expected input format"
            }
        )
    except TimeoutError as e:
        # Prediction timeout
        raise HTTPException(
            status_code=504,
            detail={
                "message": "Prediction request timed out",
                "hint": "The prediction took too long to complete. Please try again."
            }
        )
    except Exception as e:
        # Other prediction errors
        error_detail = str(e)
        hint = "Please verify your input data format"
        
        # Provide specific hints for common MLflow errors
        if "safely convert" in error_detail.lower():
            hint = "Type mismatch in input data. Use GET /schema to see expected types."
        elif "missing" in error_detail.lower():
            hint = "Required features are missing. Use GET /schema to see all required inputs."
        elif "feature" in error_detail.lower() or "column" in error_detail.lower():
            hint = "Feature name or count mismatch. Use GET /schema to see expected features."
        
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Prediction failed",
                "error": error_detail,
                "hint": hint
            }
        )
