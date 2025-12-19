"""Schema validation utilities for MLflow model inputs."""

from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ValidationError:
    """Represents a validation error for a feature."""
    field: str
    error_type: str  # 'missing', 'type_mismatch', 'unknown_field'
    message: str
    expected_type: Optional[str] = None
    actual_type: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        result = {
            "field": self.field,
            "error_type": self.error_type,
            "message": self.message
        }
        if self.expected_type:
            result["expected_type"] = self.expected_type
        if self.actual_type:
            result["actual_type"] = self.actual_type
        return result


class SchemaValidator:
    """Validates feature data against MLflow model schema."""
    
    # Map MLflow types to Python types for validation
    TYPE_MAP = {
        "double": (int, float),
        "float": (int, float),
        "long": int,
        "integer": int,
        "string": str,
        "boolean": bool,
        "binary": bytes,
    }
    
    def __init__(self, schema: List[Dict[str, Any]]):
        """
        Initialize validator with schema.
        
        Args:
            schema: List of column definitions with 'name', 'type', 'required'
        """
        self.schema = schema
        self.schema_map = {col["name"]: col for col in schema}
        self.required_fields = {
            col["name"] for col in schema 
            if col.get("required", True)
        }
    
    def validate(self, features: Dict[str, Any]) -> Tuple[bool, List[ValidationError]]:
        """
        Validate features against the schema.
        
        Args:
            features: Dictionary of feature names to values
            
        Returns:
            Tuple of (is_valid, list of ValidationError objects)
        """
        errors = []
        
        # Check for missing required fields
        missing_fields = self.required_fields - set(features.keys())
        for field in missing_fields:
            errors.append(ValidationError(
                field=field,
                error_type="missing",
                message=f"Required field '{field}' is missing",
                expected_type=self.schema_map[field].get("type")
            ))
        
        # Check for type mismatches and unknown fields
        for field_name, value in features.items():
            if field_name not in self.schema_map:
                errors.append(ValidationError(
                    field=field_name,
                    error_type="unknown_field",
                    message=f"Field '{field_name}' is not in the model schema"
                ))
                continue
            
            expected_type = self.schema_map[field_name].get("type")
            if expected_type and expected_type in self.TYPE_MAP:
                expected_python_types = self.TYPE_MAP[expected_type]
                
                # Handle None values for optional fields
                is_required = self.schema_map[field_name].get("required", True)
                if value is None and not is_required:
                    continue
                
                # Check type
                if not isinstance(value, expected_python_types):
                    # Special case: allow int for float/double (will be coerced later)
                    if expected_type in ("double", "float") and isinstance(value, int) and not isinstance(value, bool):
                        continue  # This is acceptable, will be coerced
                    
                    errors.append(ValidationError(
                        field=field_name,
                        error_type="type_mismatch",
                        message=f"Field '{field_name}' has incorrect type",
                        expected_type=expected_type,
                        actual_type=type(value).__name__
                    ))
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def get_schema_summary(self) -> Dict[str, Any]:
        """Get a summary of the schema for error messages."""
        return {
            "required_fields": list(self.required_fields),
            "all_fields": list(self.schema_map.keys()),
            "field_types": {
                name: col.get("type") 
                for name, col in self.schema_map.items()
            }
        }


def validate_features_against_schema(
    features: Dict[str, Any], 
    schema: List[Dict[str, Any]]
) -> Tuple[bool, List[Dict[str, Any]]]:
    """
    Convenience function to validate features against a schema.
    
    Args:
        features: Dictionary of feature names to values
        schema: List of column definitions with 'name', 'type', 'required'
        
    Returns:
        Tuple of (is_valid, list of error dicts)
    """
    validator = SchemaValidator(schema)
    is_valid, errors = validator.validate(features)
    return is_valid, [e.to_dict() for e in errors]

