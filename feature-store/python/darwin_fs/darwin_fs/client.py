# TODO: Exception handling is repetitive across all functions - extract to decorator or context manager.
# TODO: yaml.dump for success messages is inconsistent with error handling - consider structured logging.
# TODO: Optional imports (pyspark, aiohttp) checked at runtime - document installation requirements clearly.
from datetime import datetime
from os import environ
from typing import Optional

import yaml

import darwin_fs.service.ofs_v2_admin_service as admin_service
import darwin_fs.service.ofs_v2_service as ofs_service
from darwin_fs.constant.constants import FeatureGroupType, DataType, State
from darwin_fs.exception import SdkException, ApiException, SparkWriterException
from darwin_fs.model.create_entity_request import CreateEntityRequest
from darwin_fs.model.create_feature_group_request import CreateFeatureGroupRequest
from darwin_fs.model.entity import Entity
from darwin_fs.model.feature_group import FeatureGroup
from darwin_fs.model.feature_group_schema import FeatureGroupSchema
from darwin_fs.model.feature_group_version import FeatureGroupVersion
from darwin_fs.model.read_features_request import ReadFeaturesRequest
from darwin_fs.model.read_features_response import ReadFeaturesResponse
from darwin_fs.model.write_features_request import WriteFeaturesRequest
from darwin_fs.model.write_features_response import WriteFeaturesResponse

try:
  from pyspark.sql import SparkSession, DataFrame
  from darwin_fs.service import spark_service
except ImportError:
  SparkSession: Optional[type] = None
  DataFrame: Optional[type] = None
  spark_service: Optional[type] = None

try:
  from aiohttp import ClientSession
  from darwin_fs.service import ofs_v2_async_service
except ImportError:
  ClientSession: Optional[type] = None
  ofs_v2_async_service: Optional[type] = None


def enum_representer(dumper, data):
  return dumper.represent_scalar('tag:yaml.org,2002:str', data.value)


yaml.add_representer(DataType, enum_representer)
yaml.add_representer(FeatureGroupType, enum_representer)
yaml.add_representer(State, enum_representer)


def create_entity(request: CreateEntityRequest) -> None:
  try:
    entity = admin_service.create_entity(create_entity_request=request)
    yaml_str = yaml.dump(entity.to_dict(), default_flow_style=False, sort_keys=False, indent=2)
    print(f"successfully created entity with config:\n{yaml_str}")
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception creating entity\n\t{e}", "UNKNOWN_EXCEPTION")


def create_feature_group(request: CreateFeatureGroupRequest, upgrade: bool = None) -> None:
  try:
    feature_group, version = admin_service.create_feature_group(create_feature_group_request=request, upgrade=upgrade)
    yaml_str = yaml.dump(feature_group.to_dict(), default_flow_style=False, sort_keys=False, indent=2)
    if not upgrade:
      print(f"successfully created feature-group with config:\n{yaml_str}")
    else:
      print(
        f"successfully bumped feature-group version {feature_group.feature_group_name} to version {version} "
        f"with config:\n{yaml_str}")
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception creating feature-group\n\t{e}", "UNKNOWN_EXCEPTION")


def get_entity(name: str) -> Entity:
  try:
    return admin_service.get_entity_metadata(entity_name=name).entity
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception fetching entity\n\t{e}", "UNKNOWN_EXCEPTION")


def get_feature_group(name: str, version: str = None) -> FeatureGroup:
  try:
    return admin_service.get_feature_group_metadata(feature_group_name=name, feature_group_version=version).feature_group
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception fetching feature-group\n\t{e}", "UNKNOWN_EXCEPTION")


def update_feature_group_state(state: State, name: str, version: str = None) -> None:
  try:
    admin_service.update_feature_group_state(state, feature_group_name=name, feature_group_version=version)
    if version:
      print(f"successfully updated state to: {state} for feature-group: {name} feature-group-version: {version}")
    print(f"successfully updated state to: {state} for latest version of feature-group: {name}")
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception fetching feature-group\n\t{e}", "UNKNOWN_EXCEPTION")


def get_latest_feature_group_version(name: str) -> FeatureGroupVersion:
  try:
    return admin_service.get_feature_group_latest_version(feature_group_name=name).version
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception fetching latest feature-group version\n\t{e}", "UNKNOWN_EXCEPTION")


def get_feature_group_schema(name: str, version: str = None) -> FeatureGroupSchema:
  try:
    return admin_service.get_feature_group_schema(feature_group_name=name, feature_group_version=version)
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception fetching feature-group schema\n\t{e}", "UNKNOWN_EXCEPTION")


def read_features(request: ReadFeaturesRequest) -> ReadFeaturesResponse:
  try:
    return ofs_service.feature_group_read_features(request)
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception reading features from feature-group\n\t{e}", "UNKNOWN_EXCEPTION")


def write_features_sync(request: WriteFeaturesRequest) -> WriteFeaturesResponse:
  try:
    return ofs_service.feature_group_write_features(request)
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception writing features to feature-group\n\t{e}", "UNKNOWN_EXCEPTION")


async def write_features_async(client: ClientSession, request: WriteFeaturesRequest) -> WriteFeaturesResponse:
  if ClientSession is None:
    raise SdkException(f"unable to find aiohttp dependency\neither install it manually or use\n\tpip3 install ofs_sdk[async]",
                       "DEPENDENCY_EXCEPTION")
  elif ofs_v2_async_service is None:
    try:
      import darwin_fs.service.ofs_v2_async_service
    except ImportError as e:
      raise SdkException(f"unable to import ofs_sdk.service.ofs_v2_async_service\n\t{e}", "IMPORT_EXCEPTION")

  try:
    return await ofs_v2_async_service.feature_group_write_features(client, request)
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception writing features to feature-group\n\t{e}", "UNKNOWN_EXCEPTION")


async def read_features_async(client: ClientSession, request: ReadFeaturesRequest) -> ReadFeaturesResponse:
  if ClientSession is None:
    raise SdkException(f"unable to find aiohttp dependency\neither install it manually or use\n pip3 install ofs_sdk[async]",
                       "DEPENDENCY_EXCEPTION")
  elif ofs_v2_async_service is None:
    try:
      import darwin_fs.service.ofs_v2_async_service
    except ImportError as e:
      raise SdkException(f"unable to import ofs_sdk.service.ofs_v2_async_service\n\t{e}", "IMPORT_EXCEPTION")

  try:
    return await ofs_v2_async_service.feature_group_read_features(client, request)
  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception writing features to feature-group\n\t{e}", "UNKNOWN_EXCEPTION")


# TODO: Error handling in finally block calls put_feature_group_run even on success - clarify intent.
# TODO: mode parameter only supports "overwrite" effectively - document supported modes or validate input.
def write_features(df: DataFrame, feature_group_name: str, feature_group_version: str = None, mode: str = "overwrite") -> None:
  if SparkSession is None:
    raise SdkException(f"unable to find pyspark dependency\neither install it manually or use\n pip3 install ofs_sdk[all]",
                       "DEPENDENCY_EXCEPTION")
  elif spark_service is None:
    try:
      import darwin_fs.service.spark_service
    except ImportError as e:
      raise SdkException(f"unable to import ofs_sdk.service.spark_service\n\t{e}", "IMPORT_EXCEPTION")

  spark_context = df.sparkSession.sparkContext
  if environ.get("OFS_SDK_IMPORT_UNSAFE", "false").lower() != "true":
    spark_service.check_ofs_jar(spark_context)

  start_time = int(datetime.now().timestamp())
  count = df.count()
  error: Exception = None
  run_id = spark_service.create_run_id()
  try:
    schema_metadata = spark_service.get_schema_using_spark_jar(spark_context, feature_group_name, feature_group_version)
    feature_group_type = schema_metadata.getFeatureGroupType().name()
    feature_group_version = schema_metadata.getVersion()
    if feature_group_type == FeatureGroupType.ONLINE.name:
      spark_service.write_online_features(df, feature_group_name, feature_group_version, run_id)

    expected_schema = spark_service.get_df_schema_for_fg_using_spark_jar(spark_context, schema_metadata)
    spark_service.write_offline_features(df, feature_group_name, feature_group_version, expected_schema, mode)

  except SdkException as sdk_exception:
    error = sdk_exception
    raise sdk_exception
  except ApiException as api_exception:
    error = api_exception
    raise SdkException(api_exception.message, api_exception.error_code)
  except SparkWriterException as spark_writer_exception:
    error = spark_writer_exception
    raise SdkException(spark_writer_exception.message, spark_writer_exception.error_code)
  except Exception as e:
    error = e
    raise SdkException(f"unknown exception writing features to feature-group\n\t{e}", "UNKNOWN_EXCEPTION")
  finally:
    time_taken = int(datetime.now().timestamp()) - start_time
    spark_service.put_feature_group_run_using_spark_jar(df, feature_group_name=feature_group_name,
                                                        feature_group_version=feature_group_version,
                                                        run_id=run_id,
                                                        time_taken=time_taken,
                                                        count=count,
                                                        error=error)


def read_offline_features(spark: SparkSession, feature_group_name: str, feature_group_version: str = None, delta_table_version: int = None,
                          timestamp: int = None) -> DataFrame:
  if SparkSession is None:
    raise SdkException(f"unable to find pyspark dependency\neither install it manually or use\n pip3 install ofs_sdk[all]",
                       "DEPENDENCY_EXCEPTION")
  elif spark_service is None:
    try:
      import darwin_fs.service.spark_service
    except ImportError as e:
      raise SdkException(f"unable to import ofs_sdk.service.spark_service\n\t{e}", "IMPORT_EXCEPTION")

  try:
    # validation
    metadata = spark_service.get_schema_using_spark_jar(spark.sparkContext, feature_group_name, feature_group_version)
    if feature_group_version == None:
      feature_group_version = metadata.getVersion()
    return spark_service.read_offline_features(spark, feature_group_name, feature_group_version, delta_table_version, timestamp)

  except SdkException as sdk_exception:
    raise sdk_exception
  except ApiException as api_exception:
    raise SdkException(api_exception.message, api_exception.error_code)
  except SparkWriterException as spark_writer_exception:
    raise SdkException(spark_writer_exception.message, spark_writer_exception.error_code)
  except Exception as e:
    raise SdkException(f"unknown exception reading offline features \n\t{e}", "UNKNOWN_EXCEPTION")
