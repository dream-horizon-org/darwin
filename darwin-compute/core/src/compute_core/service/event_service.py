import requests
from loguru import logger

from compute_app_layer.utils.response_util import Response
from compute_core.constant.config import Config
from compute_core.constant.constants import DEFAULT_CLUSTER_EVENTS
from compute_core.dto.chronos_dto import ChronosEvent
from compute_core.service.utils import make_api_request
from compute_core.util.utils import default_events


class EventService:
    # TODO: Consider making this class async-first for better performance in event-heavy scenarios
    def __init__(self):
        self.config = Config()
        # TODO: Hardcoded header values should be constants
        self.headers = {"x-event-source": "compute", "Content-Type": "application/json"}
        self.default_cluster_events = DEFAULT_CLUSTER_EVENTS

    def _request(
        self,
        method: str,
        url: str,
        data: dict = None,
    ):
        # TODO: data parameter is unused - either use it or remove it
        response = requests.request(method, url, headers=self.headers, timeout=10)

        if not 200 <= response.status_code < 300:
            logger.error(f"Error occurred in API {method} - {url} - {response.text}")
            # TODO: Use a custom EventServiceError instead of generic Exception
            raise Exception(f"Error occurred in API {method} - {url} - {response.text}")
        return response.json()

    def send_event(self, event_data: ChronosEvent):
        """
        Send event to chronos service
        :return: None
        """
        url = f"{self.config.get_chronos_url}/api/v1/event"
        logger.info(f"Sending event to chronos to url {url}. Event data: {event_data}")
        try:
            # TODO: Hardcoded retry count and timeout should be configurable
            resp = make_api_request(
                method="POST",
                url=url,
                data=event_data.to_dict(encode_json=True),
                headers=self.headers,
                max_retries=3,
                timeout=2,
            )
            return resp
        except Exception as e:
            # TODO: Failed events should be queued for retry or dead-lettered for later analysis
            logger.error(f"Error while sending event: {e}. The event data is: {event_data}")

    async def get_default_events(self):
        """
        Fetch all events from chronos service
        :return: default filtered events
        """
        url = f"{self.config.get_chronos_url}/event-types"
        logger.info(f"Fetching events from chronos url {url}")
        try:
            resp = self._request("GET", url)
            all_events = resp["data"]

            default_event_list: list[dict] = default_events(all_events, self.default_cluster_events)

            return Response.success_response(f"All events from chronos {url} Fetched Successfully", default_event_list)
        except Exception as e:
            logger.exception(f"Error getting default events: {e}")
            return Response.internal_server_error_response("Error getting default events", e.__str__())
