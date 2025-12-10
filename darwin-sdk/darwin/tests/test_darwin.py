from unittest.mock import patch

import pytest
import responses
from pyspark.sql import SparkSession, DataFrame

import darwin
from darwin.exceptions import NoActiveSparkSessionError
from darwin.spark.spark_resources import SparkResources


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
def test_init_spark_runs_successfully(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    spark: SparkSession = darwin.init_spark()
    df: DataFrame = spark.range(10)
    assert df.count() == 10


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_spark_conf.json"], indirect=True)
@patch("darwin.spark.spark_resources.ray.nodes")
def test_init_spark_with_compute_config(mock_ray_nodes, mock_cluster_response, mock_compute_service):
    mock_ray_nodes.return_value = [
        {"NodeManagerHostname": "ray-worker-1", "Resources": {"CPU": 4, "memory": 16 * 1024**3}}  # 16 GB in bytes
    ]
    spark: SparkSession = darwin.init_spark()
    assert spark.sparkContext.getConf().get("spark.app.name") == "test"
    assert spark.sparkContext.getConf().get("spark.executor.cores") == "2"
    assert spark.sparkContext.getConf().get("spark.executor.memory") == "2G"
    assert spark.sparkContext.getConf().get("spark.executor.instances") == "2"
    assert spark.sparkContext.getConf().get("spark.driver.cores") == "2"
    assert spark.sparkContext.getConf().get("spark.driver.memory") == "2G"


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
def test_stop_spark(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    darwin.init_spark()
    darwin.stop_spark()
    with pytest.raises(NoActiveSparkSessionError):
        darwin.get_spark_session()


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
def test_get_spark_session(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    darwin.init_spark()
    spark: SparkSession = darwin.get_spark_session()
    assert isinstance(spark, SparkSession)


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_celeborn_enabled.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
def test_init_spark_with_celeborn(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    spark: SparkSession = darwin.init_spark()

    assert (
        spark.sparkContext.getConf().get("spark.shuffle.manager")
        == "org.apache.spark.shuffle.celeborn.SparkShuffleManager"
    )
