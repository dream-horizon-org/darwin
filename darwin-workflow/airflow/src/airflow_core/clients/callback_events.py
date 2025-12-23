import json
import logging
from typing import List, Union
import requests
from workflow_core.models.event_entity import Event
from airflow_core.constants.configs import Config

logging.getLogger("kafka").setLevel(logging.ERROR)
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)


def _request(method: str, url: str, headers: dict, data: Union[dict, str] = None):
    """
    Sends HTTP requests to the given URL.
    """
    RETRY_COUNT = 0
    while RETRY_COUNT < 3:
        LOGGER.info(f"Sending request to {url} with data {data}")
        response = requests.request(method, url, data=data, headers=headers)
        if not 200 <= response.status_code < 300:
            RETRY_COUNT += 1
        else:
            response_json = response.json()
            return response_json
    raise Exception(f"Status: {response.status_code} - {response.text}")


class EventListener:
    def on_event(self, event: Event):
        pass


class DarwinEventsListener(EventListener):
    def __init__(self, env: str, source: str):
        self.env = env
        self.base_url = Config(env).get_darwin_events_url
        self.source = source

    def on_event(self, event: dict):
        headers = {"Content-Type": "application/json", "x-event-source": self.source}
        _request(
            method="POST",
            url=f"{self.base_url}/api/v1/event",
            data=json.dumps(event),
            headers=headers,
        )


class CallbackListener(EventListener):
    def __init__(self, callback_urls: List[str], event_types: List[str] = None):
        self.event_types = event_types
        self.callback_urls = callback_urls

    def on_event(self, event: Event):
        """
        Sends callback events to all registered URLs.
        """
        headers = {"Content-Type": "application/json"}
        if (not self.event_types) or (event.state.value in self.event_types):
            for url in self.callback_urls:
                callback_request = event.to_json()
                _request(method="POST", url=url, data=callback_request, headers=headers)
