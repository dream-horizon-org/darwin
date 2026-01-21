from loguru import logger

from ml_serve_model import User
from ml_serve_core.constants.constants import (
    ML_SERVE_BOOTSTRAP_ADMIN_TOKEN,
    ML_SERVE_BOOTSTRAP_ADMIN_USERNAME,
)


class UserService:
    async def get_user_from_token(self, token: str) -> User:
        return await User.filter(token=token).first()

    async def bootstrap_admin_user(self) -> bool:
        """
        Bootstrap the admin user on application startup.
        
        Creates the admin user if:
        1. ML_SERVE_BOOTSTRAP_ADMIN_TOKEN env var is set
        2. Admin user doesn't already exist
        
        Returns:
            True if admin was created or already exists with correct token
            False if bootstrap was skipped (no token configured)
        """
        if not ML_SERVE_BOOTSTRAP_ADMIN_TOKEN:
            logger.warning(
                "ML_SERVE_BOOTSTRAP_ADMIN_TOKEN not set. "
                "Admin user will not be bootstrapped. "
                "API authentication will fail until an admin user is created."
            )
            return False

        username = ML_SERVE_BOOTSTRAP_ADMIN_USERNAME
        
        # Check if admin user already exists
        existing_user = await User.filter(username=username).first()
        
        if existing_user:
            # Update token if it has changed (allows rotation)
            if existing_user.token != ML_SERVE_BOOTSTRAP_ADMIN_TOKEN:
                existing_user.token = ML_SERVE_BOOTSTRAP_ADMIN_TOKEN
                await existing_user.save()
                logger.info(f"Updated token for existing admin user '{username}'")
            else:
                logger.info(f"Admin user '{username}' already exists with correct token")
            return True
        
        # Create new admin user
        await User.create(
            username=username,
            token=ML_SERVE_BOOTSTRAP_ADMIN_TOKEN
        )
        logger.info(f"Created admin user '{username}' from bootstrap token")
        return True
