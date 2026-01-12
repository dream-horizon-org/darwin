import requests

# TODO: No retry logic for HTTP requests - transient network errors will fail immediately.
# TODO: No timeout configuration - long-running requests can hang indefinitely.
# TODO: read_features uses GET with JSON body - non-standard, consider POST for consistency.
from darwin_fs.config import *
from darwin_fs.model.data_response import DataResponse
from darwin_fs.model.read_features_request import ReadFeaturesRequest
from darwin_fs.model.read_features_response import ReadFeaturesResponse
from darwin_fs.model.write_features_request import WriteFeaturesRequest
from darwin_fs.model.write_features_response import WriteFeaturesResponse
from darwin_fs.util.exception_utils import parse_api_exception


def feature_group_write_features(write_features_request: WriteFeaturesRequest) -> WriteFeaturesResponse:
  url = DARWIN_OFS_V2_WRITER_HOST + DARWIN_OFS_V2_FG_WRITE_V2_ENDPOINT

  response = requests.request("POST", url, json=write_features_request.to_dict())
  if response.status_code != 200:
    parse_api_exception(response)

  return WriteFeaturesResponse.from_dict(DataResponse.from_dict(response.json()).data)


def feature_group_read_features(read_features_request: ReadFeaturesRequest) -> ReadFeaturesResponse:
  url = DARWIN_OFS_V2_HOST + DARWIN_OFS_V2_FG_READ_ENDPOINT

  response = requests.request("GET", url, json=read_features_request.to_dict())
  if response.status_code != 200:
    parse_api_exception(response)

  return ReadFeaturesResponse.from_dict(DataResponse.from_dict(response.json()).data)
