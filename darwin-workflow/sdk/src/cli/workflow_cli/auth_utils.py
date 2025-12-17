import subprocess

import typer

ORG = "darwin"


def _is_org_member(org):
    # Get the authenticated user's username
    user_result = subprocess.run(
        ["gh", "api", "user", "--jq", ".login"],
        check=True, capture_output=True, text=True
    )
    username = user_result.stdout.strip()

    # Check org membership
    check_result = subprocess.run(
        [
            "gh", "api",
            f"orgs/{org}/members/{username}",
            "--silent"  # suppress output, we only care about status code
        ],
        capture_output=True
    )

    if check_result.returncode == 0:
        # gh returns 0 on 2xx, so 204 means is a member
        return True
    elif check_result.returncode == 1 and check_result.stderr:
        if "404" in check_result.stderr.decode():
            return False
    return False


def _check_github_cli_installed() -> None:
    """
    Check if GitHub CLI is installed by running the `gh --version` command.
    If not installed, exit the application with an error message.
    """
    try:
        subprocess.run(["gh", "--version"], check=True, capture_output=True)
    except (subprocess.SubprocessError, FileNotFoundError):
        typer.echo("GitHub CLI (gh) is not installed or not in PATH.")
        typer.echo("Please install it using the following commands:")
        typer.echo("For macOS: brew install gh")
        typer.echo("For Linux: sudo apt install gh")
        typer.echo("Alternatively, visit: https://cli.github.com/")
        raise typer.Exit(code=1)


def _check_github_authentication() -> None:
    """
    Check if the user is authenticated with GitHub by running `gh auth status`.
    If not authenticated, attempt authentication.
    """
    try:
        auth_status = subprocess.run(
            ["gh", "auth", "status"],
            check=True,
            capture_output=True,
            text=True
        )
    except subprocess.CalledProcessError:
        typer.echo("You need to authenticate with GitHub first.")
        typer.echo("Running 'gh auth login -s user'...")

        try:
            # Run the authentication process
            subprocess.run(["gh", "auth", "login", "-s", "user"], check=True)
        except subprocess.CalledProcessError:
            typer.echo("GitHub authentication failed.")
            raise typer.Exit(code=1)


def get_primary_github_email() -> str:
    """
    Retrieve the primary email associated with the GitHub account using the `gh api` command.
    Returns:
        str: The primary email address of the GitHub account.
    Raises:
        ValueError: If there is an error retrieving the email.
    """
    try:
        email_result = subprocess.run(
            ["gh", "api", "user/emails", "--jq", ".[] | select(.primary == true) | .email"],
            check=True,
            capture_output=True,
            text=True
        )
        return email_result.stdout.strip()
    except subprocess.CalledProcessError as e:
        typer.echo(
            f"Error retrieving primary email:\n"
            f"Check your GitHub authentication please run: workflow configure --reconfigure\n"
        )
        raise typer.Exit(code=1)


def authenticate_with_github():
    """
    Configure the CLI by authenticating with GitHub and retrieving the user's email.
    """
    # Check if GitHub CLI is installed
    _check_github_cli_installed()

    # Check if user is authenticated with GitHub
    _check_github_authentication()
    if _is_org_member(ORG):
        typer.echo("GitHub authentication successful!")
    else:
        typer.echo(f"AUTHORIZATION ERROR: You are not a member of the {ORG} organization.\n"
                   f"Please login with a {ORG} authorized GitHub account.\n"
                   f"To reconfigure, run the following command:\n"
                   f"\tworkflow configure --reconfigure")
        raise typer.Exit(code=1)
    # Get user information
    try:
        # Get primary email
        user_email = get_primary_github_email()
        if not user_email:
            typer.echo(f"Could not retrieve primary email. Check your GitHub permissions.")
            raise typer.Exit(code=1)

        typer.echo(f"Retrieved primary email: {user_email}")

        return user_email

    except subprocess.CalledProcessError as e:
        raise ValueError(f"Error retrieving user information: {e}\nError output: {e.stderr}")
    except Exception as e:
        raise ValueError(f"Unexpected error during configuration: {e}")


def logout_from_gh():
    """
    Logout from GitHub CLI.
    """
    try:
        subprocess.run(["gh", "auth", "logout"], check=True)
    except subprocess.CalledProcessError:
        typer.echo("No existing login found")
