import requests
import time
import random

def api_request(
    method: str,
    url: str,
    params: dict = None,
    data: dict = None,
    headers: dict = None,
    retries: int = 3
):
    """
    Sends an HTTP request and returns the parsed JSON response.

    Retries up to 3 times using exponential backoff with jitter on failure.

    Args:
        method (str): HTTP method (e.g., 'GET', 'POST', 'PUT', etc.)
        url (str): Target URL for the request.
        params (dict, optional): Query parameters to be sent in the URL.
        data (dict, optional): JSON body to send with the request.
        headers (dict, optional): Request headers.
        retries (int, optional): Number of times to retry on failure. Defaults to 3.

    Returns:
        dict: Parsed JSON response if the request is successful.

    Raises:
        Exception: If all retries fail, raises an exception with the final status and response text.
    """

    base_delay = 1  # Base delay in seconds for exponential backoff

    for retry in range(retries):
        response = requests.request(
            method, url, params=params, json=data, headers=headers
        )
        if 200 <= response.status_code < 300:
            return response.json()

        # Retry if not successful and attempts remain
        if retry < retries - 1:
            # Calculate exponential backoff delay: base_delay * 2^retry
            delay = base_delay * (2 ** retry)

            # Add jitter to prevent thundering herd problem
            # Jitter = random value between 0 and delay / 2
            jitter = random.uniform(0, delay / 2)

            time.sleep(delay + jitter)

    # All retries failed; raise an exception with response details
    raise Exception(f"Status: {response.status_code} - {response.text}")
