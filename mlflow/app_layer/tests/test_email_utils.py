"""
Test cases for email_utils module.

Tests focus on our integration with Pydantic's EmailStr validator:
- Valid email handling (returns the email)
- None email handling (custom 401 error)
- Invalid email handling (Pydantic ValidationError -> 400 HTTPException)

We rely on Pydantic/email-validator for actual RFC 5322 validation logic.
"""
import pytest
from fastapi import HTTPException

from mlflow_app_layer.util.email_utils import validate_email


def test_valid_email_returns_email():
    """Test that valid email is returned unchanged."""
    email = "user@example.com"
    assert validate_email(email) == email


def test_valid_email_with_special_chars():
    """Test that valid email with special characters is accepted."""
    email = "user.name+tag@sub.example.co.uk"
    assert validate_email(email) == email


def test_none_email_raises_401():
    """Test that None email raises HTTPException with 401 status (custom logic)."""
    with pytest.raises(HTTPException) as exc_info:
        validate_email(None)
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Email header is required"


def test_invalid_email_raises_400():
    """Test that invalid email raises HTTPException with 400 status."""
    with pytest.raises(HTTPException) as exc_info:
        validate_email("not-an-email")
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid email format"


def test_empty_string_raises_400():
    """Test that empty string raises HTTPException with 400 status."""
    with pytest.raises(HTTPException) as exc_info:
        validate_email("")
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid email format"

