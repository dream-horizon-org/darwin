"""
Unit tests for bootstrap admin user functionality.

Tests the automatic creation/update of admin user from environment variables
during application startup.
"""
import pytest
from unittest.mock import patch

from ml_serve_core.service.user_service import UserService
from ml_serve_model import User


@pytest.mark.unit
class TestBootstrapAdminUser:
    """Test suite for admin user bootstrap functionality."""
    
    @pytest.mark.asyncio
    async def test_bootstrap_creates_new_admin_when_not_exists(
        self,
        db_session
    ):
        """Test that bootstrap creates a new admin user when none exists."""
        # Arrange
        service = UserService()
        
        # Verify admin doesn't exist
        existing_admin = await User.filter(username='admin').first()
        assert existing_admin is None
        
        # Act - patch the constants where they're imported and used (in user_service module)
        with patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_TOKEN', 'test-admin-token-123'), \
             patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_USERNAME', 'admin'):
            result = await service.bootstrap_admin_user()
        
        # Assert
        assert result is True
        
        # Verify admin was created
        admin = await User.filter(username='admin').first()
        assert admin is not None
        assert admin.username == 'admin'
        assert admin.token == 'test-admin-token-123'
    
    @pytest.mark.asyncio
    async def test_bootstrap_updates_existing_admin_token(
        self,
        db_session
    ):
        """Test that bootstrap updates the token when admin exists with different token."""
        # Arrange
        service = UserService()
        
        # Create admin with old token
        await User.create(
            username='admin',
            token='old-token'
        )
        
        # Act - patch the constants where they're imported and used
        with patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_TOKEN', 'new-token-456'), \
             patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_USERNAME', 'admin'):
            result = await service.bootstrap_admin_user()
        
        # Assert
        assert result is True
        
        # Verify token was updated
        admin = await User.filter(username='admin').first()
        assert admin is not None
        assert admin.token == 'new-token-456'
        
        # Verify only one admin exists
        admin_count = await User.filter(username='admin').count()
        assert admin_count == 1
    
    @pytest.mark.asyncio
    async def test_bootstrap_idempotent_when_admin_exists_with_same_token(
        self,
        db_session
    ):
        """Test that bootstrap is idempotent when admin exists with correct token."""
        # Arrange
        service = UserService()
        
        # Create admin with the token we'll bootstrap with
        original_admin = await User.create(
            username='admin',
            token='same-token-789'
        )
        original_user_id = original_admin.user_id
        original_created_at = original_admin.created_at
        
        # Act - patch the constants where they're imported and used
        with patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_TOKEN', 'same-token-789'), \
             patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_USERNAME', 'admin'):
            result = await service.bootstrap_admin_user()
        
        # Assert
        assert result is True
        
        # Verify admin unchanged
        admin = await User.filter(username='admin').first()
        assert admin is not None
        assert admin.user_id == original_user_id
        assert admin.token == 'same-token-789'
        assert admin.created_at == original_created_at
        
        # Verify only one admin exists
        admin_count = await User.filter(username='admin').count()
        assert admin_count == 1
    
    @pytest.mark.asyncio
    async def test_bootstrap_skipped_when_no_token_configured(
        self,
        db_session
    ):
        """Test that bootstrap is skipped when no token is configured in env vars."""
        # Arrange
        service = UserService()
        
        # Act - patch constants with empty token
        with patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_TOKEN', ''), \
             patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_USERNAME', 'admin'):
            result = await service.bootstrap_admin_user()
        
        # Assert
        assert result is False
        
        # Verify no admin was created
        admin = await User.filter(username='admin').first()
        assert admin is None
    
    @pytest.mark.asyncio
    async def test_bootstrap_supports_custom_username(
        self,
        db_session
    ):
        """Test that bootstrap supports custom admin username."""
        # Arrange
        service = UserService()
        
        # Act - patch constants with custom username
        with patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_TOKEN', 'custom-token'), \
             patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_USERNAME', 'superadmin'):
            result = await service.bootstrap_admin_user()
        
        # Assert
        assert result is True
        
        # Verify custom admin was created
        admin = await User.filter(username='superadmin').first()
        assert admin is not None
        assert admin.username == 'superadmin'
        assert admin.token == 'custom-token'
    
    @pytest.mark.asyncio
    async def test_get_user_from_token_with_bootstrapped_user(
        self,
        db_session
    ):
        """Test that get_user_from_token works with bootstrapped admin user."""
        # Arrange
        service = UserService()
        
        # Bootstrap admin with patched constants
        with patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_TOKEN', 'bootstrap-token-xyz'), \
             patch('ml_serve_core.service.user_service.ML_SERVE_BOOTSTRAP_ADMIN_USERNAME', 'admin'):
            await service.bootstrap_admin_user()
        
        # Act
        user = await service.get_user_from_token('bootstrap-token-xyz')
        
        # Assert
        assert user is not None
        assert user.username == 'admin'
        assert user.token == 'bootstrap-token-xyz'
    
    @pytest.mark.asyncio
    async def test_get_user_from_token_returns_none_for_invalid_token(
        self,
        db_session
    ):
        """Test that get_user_from_token returns None for invalid token."""
        # Arrange
        service = UserService()
        
        # Act
        user = await service.get_user_from_token('invalid-token')
        
        # Assert
        assert user is None
