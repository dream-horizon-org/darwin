# TODO: Offline store path construction duplicated between write_offline_features and read_offline_features.
# TODO: Delta table initialization creates empty DataFrame - consider lazy initialization on first write.
# TODO: _delta_table_exists uses internal Spark APIs (_jsc, _jvm) - may break across Spark versions.
import json
import logging
import re
from datetime import datetime, timezone
from os import environ

from pyspark import SparkContext
from pyspark.sql import DataFrame
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType

from darwin_fs import config
from darwin_fs.config import TEAM_SUFFIX, VPC_SUFFIX, DARWIN_OFS_V2_OFFLINE_STORE_BASE_S3_PATH
from darwin_fs.exception import SparkWriterException, SdkException
from darwin_fs.util.http_utils import remove_proto_from_url

logger = logging.getLogger(__name__)


def write_online_features(df: DataFrame, feature_group_name: str, feature_group_version: str, run_id: str) -> str:
  try:
    writer = df.write \
      .format("ofs") \
      .option("feature-group-name", feature_group_name) \
      .option("run-id", run_id)
    if feature_group_version is not None:
      writer.option("feature-group-version", feature_group_version)

    if VPC_SUFFIX is not None and VPC_SUFFIX != '':
      writer.option("vpc-suffix", VPC_SUFFIX)

    if TEAM_SUFFIX is not None and TEAM_SUFFIX != '':
      writer.option("team-suffix", TEAM_SUFFIX)

    if environ.get("sdk.python.environment", "") == 'test':
      writer.option("sdk.python.environment", "test")
      writer.option("ofs.kafka.host", environ["ofs.kafka.host"])
      writer.option("ofs.admin.host", remove_proto_from_url(environ["ofs.admin.host"]))

    writer \
      .mode("append") \
      .save()
  except Exception as e:
    logger.debug(f"error writing data to online feature store: {str(e)}")
    raise SparkWriterException(f"error writing data to online feature store: {e}", "OFS_ONLINE_WRITE_EXCEPTION")

  return run_id


def write_offline_features(df: DataFrame, feature_group_name: str, feature_group_version: str, schema: StructType,
                           mode: str) -> None:
  s3_base_path: str = DARWIN_OFS_V2_OFFLINE_STORE_BASE_S3_PATH
  try:
    table_path = _get_offline_table_path(feature_group_name, feature_group_version, s3_base_path)
    _check_and_init_delta_table(df.sparkSession, schema, table_path)
    df.write \
      .format("delta") \
      .mode(mode) \
      .save(table_path)
  except Exception as e:
    logger.debug(f"error writing data to offline feature store: {str(e)}")
    raise SparkWriterException(f"error writing data to offline feature store: {e}", "OFS_OFFLINE_WRITE_EXCEPTION")


# TODO: Error message says "reading data to" but should say "reading data from" offline feature store.
# TODO: No validation that delta table exists before attempting read - fails with cryptic Spark error.
# TODO: timestamp parameter type is int but Delta expects datetime string - document expected format.
def read_offline_features(spark: SparkSession, feature_group_name: str, feature_group_version: str, delta_table_version: int = None,
                          timestamp: int = None) -> DataFrame:
  s3_base_path = DARWIN_OFS_V2_OFFLINE_STORE_BASE_S3_PATH
  if delta_table_version is not None and timestamp is not None:
    raise SparkWriterException(f"error reading data to offline feature store: at most one of 'delta-table-version' or 'timestamp' can be "
                               f"specified",
                               "OFS_OFFLINE_READ_EXCEPTION")

  path = _get_offline_table_path(feature_group_name, feature_group_version, s3_base_path)
  try:
    latest_version = _get_delta_table_latest_version(spark, path)
  except Exception as e:
    raise SparkWriterException(f"error fetching latest delta table version: {e}", "OFS_OF"
                                                                                  "FLINE_READ_EXCEPTION")
  try:
    reader = spark.read \
      .format("delta")

    if timestamp is not None:
      reader.option("timestampAsOf", timestamp)

    if delta_table_version is not None and 0 <= delta_table_version <= latest_version:
      reader.option("versionAsOf", delta_table_version)
    else:
      reader.option("versionAsOf", latest_version)

    return reader.load(path)
  except Exception as e:
    logger.debug(f"error reading data to offline feature store: {str(e)}")
    raise SparkWriterException(f"error reading data to offline feature store: {e}", "OFS_OFFLINE_READ_EXCEPTION")


def _get_offline_table_path(feature_group_name: str, feature_group_version: str, s3_base_path: str) -> str:
  return f"{s3_base_path}/{feature_group_name}/{feature_group_version}/"


def _get_delta_table_latest_version(spark: SparkSession, path: str):
  history = spark.sql(f"DESCRIBE HISTORY delta.`{path}` LIMIT 1").collect()
  return history[0]["version"] if history else None


def _get_pyspark_major_version():
  spark_version = SparkSession.builder.getOrCreate().version  # Example: "3.3.4"
  major_version = re.sub(r"(\d+\.\d+)\.\d+", r"\1.0", spark_version)
  return major_version  # Example output: "3.3.0"


# Check if path exists
def _delta_table_exists(context: SparkContext, table_path: str) -> bool:
  hadoop_conf = context._jsc.hadoopConfiguration()
  context._jvm.org.apache.hadoop.fs.FileSystem.get(hadoop_conf)
  hadoop_path_obj = context._jvm.org.apache.hadoop.fs.Path(table_path)
  return hadoop_path_obj.getFileSystem(hadoop_conf).exists(hadoop_path_obj)


def _init_delta_table(spark: SparkSession, schema: StructType, table_path: str):
  df = spark.createDataFrame([], schema)
  df.write.format("delta").mode("overwrite").save(table_path)


def _check_and_init_delta_table(spark: SparkSession, schema: StructType, table_path: str):
  exists = _delta_table_exists(spark.sparkContext, table_path)
  if not exists:
    _init_delta_table(spark, schema, table_path)


# using this for s3 fallback
def get_schema_using_spark_jar(context: SparkContext, feature_group_name, feature_group_version):
  OfsAdminUtils = context._jvm.com.dream11.spark.utils.OfsAdminUtils
  properties = {
    "team-suffix": config.TEAM_SUFFIX,
    "vpc-suffix": config.VPC_SUFFIX
  }
  if environ.get("sdk.python.environment", '') == "test":
    properties["sdk.python.environment"] = 'test'
    properties["ofs.admin.host"] = environ["ofs.admin.host"]
    properties["ofs.kafka.host"] = environ["ofs.kafka.host"]

  if feature_group_version == None:
    metadata = OfsAdminUtils.getFeatureGroupSchemaFromAdmin(properties, feature_group_name)
  else:
    metadata = OfsAdminUtils.getFeatureGroupSchemaFromAdmin(properties, feature_group_name, feature_group_version)
  return metadata


def get_df_schema_for_fg_using_spark_jar(context: SparkContext, schema_metadata) -> StructType:
  SchemaUtils = context._jvm.com.dream11.spark.utils.SchemaUtils
  schema_json = SchemaUtils.getSparkSchemaForFg(schema_metadata).json()
  schema_json = json.loads(schema_json)
  return StructType.fromJson(schema_json)


def create_run_id():
  return datetime.now(timezone.utc).strftime("run-%Y-%m-%d-%H-%M-%S")


def check_ofs_jar(context: SparkContext):
  _jars_scala = context._jsc.sc().listJars()
  jars = [_jars_scala.apply(i) for i in range(_jars_scala.length())]

  pattern = r".*/darwin-ofs-v2-spark-(?!.*-tests\.jar$).*\.jar"
  databricks_pattern = r".*/darwin_ofs_v2_spark_(?!.*-tests\.jar$).*\.jar"

  jar_present = False
  for jar_name in jars:
    if re.match(pattern, jar_name) or re.match(databricks_pattern, jar_name):
      jar_present = True
  if not jar_present:
    raise SdkException(f"ofs writer jar: darwin-ofs-v2-spark-?.jar not found in registered jars", "JAR_NOT_FOUND_EXCEPTION")


def put_feature_group_run_using_spark_jar(df: DataFrame, feature_group_name: str, feature_group_version: str, run_id: str,
                                          time_taken: int, count: int, error: Exception = None) -> None:
  error_message: str = '' if error is None else str(error)
  context: SparkContext = df.sparkSession.sparkContext
  OfsAdminUtils = context._jvm.com.dream11.spark.utils.OfsAdminUtils
  properties = {
    "team-suffix": config.TEAM_SUFFIX,
    "vpc-suffix": config.VPC_SUFFIX
  }
  if environ.get("sdk.python.environment", '') == "test":
    properties["sdk.python.environment"] = 'test'
    properties["ofs.admin.host"] = environ["ofs.admin.host"]
    properties["ofs.kafka.host"] = environ["ofs.kafka.host"]
  OfsAdminUtils.putFeatureGroupRunData(df.limit(10)._jdf, properties, feature_group_name, feature_group_version,
                                       run_id, time_taken, count, error_message)
