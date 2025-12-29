"""Dynamic Pydantic model generation from MLflow schema."""

from typing import Any, Dict, List, Optional, Type
from pydantic import BaseModel, Field, create_model

from src.config.constants import MLFLOW_TO_PYTHON_TYPE_MAP


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
        
        # Get Python type from MLflow type name
        # Python doesn't understand "double", "long", etc. - these are MLflow names
        python_type = MLFLOW_TO_PYTHON_TYPE_MAP.get(field_type_str, Any)
        
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
    
    Uses Pydantic's built-in JSON schema generation for consistency.
    
    Args:
        input_schema: List of column definitions
        
    Returns:
        JSON Schema dict
    """
    if not input_schema:
        return {"type": "object", "properties": {}}
    
    # Create dynamic Pydantic model and use its built-in JSON schema generation
    DynamicModel = create_dynamic_features_model(input_schema, "Features")
    return DynamicModel.model_json_schema()
