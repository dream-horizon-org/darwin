from ml_serve_core.dtos.dtos import EnvConfig

import os
import secrets
import string
import subprocess
from loguru import logger

# Environment variable for ml-serve-app's environment (not the deployment target environment)
ENV = os.getenv("ENV", "local")

# Namespace where serves are deployed in local environment
LOCAL_SERVE_NAMESPACE = os.getenv("LOCAL_SERVE_NAMESPACE", "serve")


def get_host_name(name: str, env: str, env_config: EnvConfig, is_environment_protected: bool):
    """
    Generate hostname for the service (used for hostname-based routing in production).

    For production environments, this returns a fully qualified domain name.
    For local environments, this still returns a hostname but service_url should
    use get_service_url() which returns a path-based URL.
    """
    if not is_environment_protected:
        serve_name = f"{name}-{env}"
    else:
        serve_name = f"{name}"

    host_name = f"{serve_name}{env_config.domain_suffix}"

    return host_name


def get_service_url(name: str, env: str, env_config: EnvConfig, is_environment_protected: bool) -> str:
    """
    Generate the service URL for accessing the deployed serve.

    For local: http://localhost/{serve-name}/
    For production: https://{serve-name}.{domain_suffix}
    """
    if not is_environment_protected:
        serve_name = f"{name}-{env}"
    else:
        serve_name = f"{name}"

    if ENV.lower() == 'local':
        return f"http://localhost/{serve_name}/"
    else:
        return f"https://{serve_name}{env_config.domain_suffix}"


def get_service_url_for_one_click(serve_name: str, env_config: EnvConfig) -> str:
    """
    Generate the service URL for one-click model deployments.

    For local: http://localhost/{serve-name}/
    For production: https://{serve-name}.{domain_suffix}
    """
    if ENV.lower() == 'local':
        return f"http://localhost/{serve_name}/"
    else:
        return f"https://{serve_name}{env_config.domain_suffix}"


def generate_secure_string(length: int = 12) -> str:
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def get_authenticated_git_url(git_repo_url: str) -> str:
    """
    Get an authenticated Git URL if GITHUB_TOKEN is available.

    For public repositories:
        - No token needed, returns original URL
        - Clone/fetch will work without authentication

    For private repositories:
        - GITHUB_TOKEN environment variable must be set
        - Token is embedded in URL for authentication

    Args:
        git_repo_url: The git repository URL

    Returns:
        URL with embedded token (if token exists and URL is GitHub),
        or original URL for public repos / non-GitHub hosts
    """
    github_token = os.getenv('GITHUB_TOKEN')

    if not github_token:
        # No token - use original URL (works for public repos)
        return git_repo_url

    # Only apply token for GitHub URLs
    if 'github.com' in git_repo_url:
        if git_repo_url.startswith('https://github.com/'):
            return git_repo_url.replace('https://github.com/', f'https://{github_token}@github.com/')
        elif git_repo_url.startswith('https://www.github.com/'):
            return git_repo_url.replace('https://www.github.com/', f'https://{github_token}@www.github.com/')

    # Non-GitHub URL - return as-is
    return git_repo_url


def validate_git_branch_exists(git_repo_url: str, branch: str) -> bool:
    """
    Validates if a git branch exists in the remote repository.

    For public repositories:
        - No GITHUB_TOKEN needed
        - Validation works directly with the public URL

    For private repositories:
        - Requires GITHUB_TOKEN environment variable to be set
        - Token is used for authentication during validation

    Args:
        git_repo_url: The git repository URL
        branch: The branch name to validate

    Returns:
        True if branch exists, False otherwise
    """
    try:
        # Get authenticated URL (handles public/private repos automatically)
        authenticated_url = get_authenticated_git_url(git_repo_url)

        if authenticated_url != git_repo_url:
            logger.debug("Using authenticated GitHub URL for branch validation")

        # Use git ls-remote to check if the branch exists without cloning
        # This is fast and doesn't require local repository
        result = subprocess.run(
            ['git', 'ls-remote', '--heads', authenticated_url, f'refs/heads/{branch}'],
            capture_output=True,
            text=True,
            timeout=30
        )

        # If the command succeeds and returns output, the branch exists
        if result.returncode == 0 and result.stdout.strip():
            logger.info(f"Branch '{branch}' exists in repository {git_repo_url}")
            return True
        else:
            logger.warning(f"Branch '{branch}' does not exist in repository {git_repo_url}")
            return False

    except subprocess.TimeoutExpired:
        logger.error(f"Timeout while checking branch '{branch}' in repository {git_repo_url}")
        raise Exception(f"Timeout while validating git branch. Please check if the repository is accessible.")
    except FileNotFoundError:
        logger.error("Git command not found. Please ensure git is installed.")
        raise Exception("Git is not installed or not found in PATH.")
    except Exception as e:
        logger.error(f"Error validating git branch: {str(e)}")
        raise Exception(f"Failed to validate git branch: {str(e)}")