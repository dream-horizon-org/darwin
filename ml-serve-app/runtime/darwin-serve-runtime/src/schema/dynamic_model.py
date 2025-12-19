"""Dynamic Pydantic model generation from MLflow schema."""

from typing import Any, Dict, List, Optional, Type
from datetime import datetime
from pydantic import BaseModel, Field, create_model


# Map MLflow types to Python types
MLFLOW_TO_PYTHON_TYPE = {
    "double": float,
    "float": float,
    "long": int,
    "integer": int,
    "string": str,
    "boolean": bool,
    "binary": bytes,
    "datetime": datetime,
    "object": Any,
}


def create_dynamic_features_model(
    input_schema: List[Dict[str, Any]],
    model_name: str = "DynamicFeatures"
) -> Type[BaseModel]:
    """
    Create a Pydantic model dynamically from MLflow input schema.
    
    Args:
        input_schema: List of column definitions with 'name', 'type', 'required'
        model_name: Name for the generated model class
        
    Returns:
        A Pydantic model class with fields matching the schema
        
    Example:
        >>> schema = [
        ...     {"name": "sepal_length", "type": "double", "required": True},
        ...     {"name": "sepal_width", "type": "double", "required": True}
        ... ]
        >>> FeaturesModel = create_dynamic_features_model(schema)
        >>> features = FeaturesModel(sepal_length=5.1, sepal_width=3.5)
    """
    if not input_schema:
        # Return empty model if no schema
        return create_model(model_name)
    
    field_definitions = {}
    
    for col in input_schema:
        field_name = col.get("name")
        field_type_str = col.get("type", "object")
        is_required = col.get("required", True)
        
        # Get Python type
        python_type = MLFLOW_TO_PYTHON_TYPE.get(field_type_str, Any)
        
        # Create field with description
        if is_required:
            field_definitions[field_name] = (
                python_type,
                Field(..., description=f"Feature: {field_name} (type: {field_type_str})")
            )
        else:
            field_definitions[field_name] = (
                Optional[python_type],
                Field(None, description=f"Optional feature: {field_name} (type: {field_type_str})")
            )
    
    return create_model(model_name, **field_definitions)


def create_prediction_request_model(
    input_schema: List[Dict[str, Any]],
) -> Type[BaseModel]:
    """
    Create a complete prediction request model with features nested inside.
    
    This creates a model like:
    class PredictRequest(BaseModel):
        features: DynamicFeatures  # Contains the actual feature fields
        
    Args:
        input_schema: List of column definitions
        
    Returns:
        A Pydantic model class for the full request
    """
    # First create the features model
    FeaturesModel = create_dynamic_features_model(input_schema, "Features")
    
    # Then create the request model with features field
    return create_model(
        "DynamicPredictRequest",
        features=(FeaturesModel, Field(..., description="Model input features"))
    )


def get_schema_as_json_schema(input_schema: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Convert input schema to JSON Schema format for OpenAPI docs.
    
    Args:
        input_schema: List of column definitions
        
    Returns:
        JSON Schema dict
    """
    if not input_schema:
        return {"type": "object", "properties": {}}
    
    json_type_map = {
        "double": "number",
        "float": "number",
        "long": "integer",
        "integer": "integer",
        "string": "string",
        "boolean": "boolean",
        "binary": "string",  # Base64 encoded
        "datetime": "string",  # ISO format
        "object": "object",
    }
    
    properties = {}
    required = []
    
    for col in input_schema:
        field_name = col.get("name")
        field_type = col.get("type", "object")
        is_required = col.get("required", True)
        
        properties[field_name] = {
            "type": json_type_map.get(field_type, "string"),
            "description": f"Feature: {field_name}"
        }
        
        if is_required:
            required.append(field_name)
    
    schema = {
        "type": "object",
        "properties": properties,
    }
    
    if required:
        schema["required"] = required
    
    return schema

