import os

import yaml
from pydantic import BaseModel, Field, validator

from cli.workflow_cli.auth_utils import get_primary_github_email

CONFIG_PATH: str = os.path.join(os.getenv("HOME"), ".darwin-workflow/config")


class Configuration(BaseModel):
    """
    Represents the user configuration for the Darwin Workflow CLI.
    """
    user_email: str = Field(..., user_input=False)

    @validator("user_email")
    def __validate_user_email(cls, value: str) -> str:
        """
        Ensure the email matches the primary email obtained via GitHub.
        Args:
            value (str): The email address to validate.
        Returns:
            str: The validated email address.
        Raises:
            ValueError: If the email does not match the primary GitHub email.
        """
        primary_email = get_primary_github_email()
        if value != primary_email:
            raise ValueError(
                f"Email '{value}' does not match the primary email '{primary_email}' associated with your GitHub account."
            )
        return value

    @classmethod
    def load(cls) -> "Configuration":
        """
        Load and validate the configuration from the file.
        Returns:
            Configuration: The loaded configuration object.
        Raises:
            FileNotFoundError: If the configuration file does not exist.
        """
        if not os.path.exists(CONFIG_PATH):
            raise FileNotFoundError(
                f"Configuration file not found at {CONFIG_PATH}. Please run 'workflow configure' first."
            )
        with open(CONFIG_PATH, "r") as config_file:
            config_data = yaml.safe_load(config_file)
        return cls(**config_data)

    def save(self) -> None:
        """
        Save the configuration to the file.
        """
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
        with open(CONFIG_PATH, "w") as config_file:
            yaml.dump(self.dict(), config_file)
