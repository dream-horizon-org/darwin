import os
from workflow_core.constants.configs import Config
from workflow_core.utils.rest_utils import api_request


def get_cost_estimate(data):
    """
    Estimate the cluster cost based on the provided configuration.

    Args:
        data: A Pydantic model or object with a `.dict()` method containing cluster parameters.

    Returns:
        str: A string showing the estimated cost range (min - max).

    Raises:
        ValueError: If the cost estimation fails due to request or response issues.
    """
    try:
        # Get current environment and initialize config
        env = os.getenv("ENV", "prod")
        _config = Config(env)

        # Define only the keys to be included in the API payload
        keys_to_include = [
            "cluster_name",
            "user",
            "head_node_config",
            "inactive_time",
            "runtime",
            "tags",
            "worker_node_configs"
        ]

        # Filter the data to only the required keys
        full_data = data.dict()
        filtered_data = {key: full_data[key] for key in keys_to_include if key in full_data}

        # Construct the cost estimation API URL
        url = f"{_config.get_compute_url}/cluster/cost/predict"

        # Make the API request
        response = api_request(method='POST', url=url, data=filtered_data)

        # Extract and return the estimated cost range
        return f"{response['data']['min_cost']} - {response['data']['max_cost']}"

    except Exception as e:
        print(e.__str__())
        # returning -- incase we are not able to fetch cost for a cl
        return None