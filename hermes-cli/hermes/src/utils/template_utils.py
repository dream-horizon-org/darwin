import json
import yaml
import questionary
from questionary import Style

# Define a custom color schema
custom_style = Style(
    [
        ("qmark", "fg:#673ab7 bold"),  # question mark
        ("question", "bold"),  # question text
        ("answer", "fg:#f44336 bold"),  # submitted answer
        ("pointer", "fg:#673ab7 bold"),  # pointer used in select and checkbox prompts
        (
            "highlighted",
            "fg:#673ab7 bold",
        ),  # pointed-at choice in select and checkbox prompts
        ("selected", "fg:#cc5454"),  # style for a selected item of a checkbox
        ("separator", "fg:#cc5454"),  # separator in lists
        ("instruction", ""),  # user instructions for select, rawselect, checkbox
        ("text", ""),  # plain text
        (
            "disabled",
            "fg:#858585 italic",
        ),  # disabled choices for select and checkbox prompts
    ]
)


def prompt(message: str, error_message: str, validator=lambda x: True) -> str:

    response = questionary.text(message, style=custom_style).ask().lower()
    while not validator(response):
        print(error_message)
        response = questionary.text(message, style=custom_style).ask().lower()
    return response


def prompt_with_default(message: str, error_message: str, default: str, validator=lambda x: True) -> str:

    response = questionary.text(message, default=default, style=custom_style).ask().lower()
    while not validator(response):
        print(error_message)
        response = questionary.text(message, default=default, style=custom_style).ask().lower()
    return response


def read_file(filename: str) -> dict:
    """Read a JSON or YAML file."""
    try:
        with open(filename, "r") as f:
            if filename.endswith((".yaml", ".yml")):
                return yaml.safe_load(f) or {}
            return json.load(f)
    except FileNotFoundError:
        print(f"File not found: {filename}")
        return {}
    except (json.JSONDecodeError, yaml.YAMLError) as e:
        print(f"Error parsing file {filename}: {e}")
        return {}
