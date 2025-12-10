import os
from unittest.mock import patch

import pytest
import ray
import responses
from pyspark.sql import SparkSession

import darwin
from darwin.spark.spark_resources import SparkResources


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
@pytest.mark.skipif(os.getenv("ENV") == "stag", reason="skip this test for stag env")
def test_spark_sql_get_databases(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    spark: SparkSession = darwin.init_spark()
    databases = spark.sql("SHOW DATABASES").collect()
    assert len(databases) > 0
    assert "org_transactions" in [db.asDict().get("namespace") for db in databases]


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
@pytest.mark.skipif(os.getenv("ENV") == "stag", reason="skip this test for stag env")
def test_spark_sql_get_tables(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    spark: SparkSession = darwin.init_spark()
    tables = spark.sql("SHOW TABLES IN org_transactions").collect()
    assert len(tables) > 0
    assert "org_roundmaster" in [table.asDict().get("tableName") for table in tables]


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
@pytest.mark.skipif(os.getenv("ENV") == "stag", reason="skip this test for stag env")
def test_get_data_from_hive_table(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    ray.shutdown()
    ray.init(address="local", num_cpus=6, include_dashboard=False)
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    spark: SparkSession = darwin.init_spark()
    df = spark.sql("select * from org_transactions.org_roundmaster limit 10")
    assert df.count() == 10
    assert "tourid" in df.columns
    assert "roundname" in df.columns


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
@pytest.mark.skipif(os.getenv("ENV") == "stag", reason="skip this test for stag env")
def test_get_data_from_iceberg_table(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    ray.shutdown()
    ray.init(address="local", num_cpus=6, include_dashboard=False)
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    spark: SparkSession = darwin.init_spark()
    df = spark.sql("select * from iceberg_catalog.org_transactions.org_roundmaster limit 10")
    assert df.count() == 10
    assert "tourid" in df.columns
    assert "roundname" in df.columns


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
@pytest.mark.skipif(os.getenv("ENV") == "stag", reason="skip this test for stag env")
def test_get_data_from_delta_table(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    ray.shutdown()
    ray.init(address="local", num_cpus=6, include_dashboard=False)
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    spark: SparkSession = darwin.init_spark()
    df = spark.sql("select * from capstone_anupam.churn_data_cleaned limit 10")
    assert df.count() == 10
    assert "amount_join" in df.columns
    assert "amount_win" in df.columns


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
@patch("darwin.spark.spark.prepare_resources")
@pytest.mark.skipif(os.getenv("ENV") == "stag", reason="skip this test for stag env")
def test_get_dbfs_table_in_aws_prod(mock_prepare_resources, mock_cluster_response, mock_compute_service):
    ray.shutdown()
    ray.init(address="local", num_cpus=6, include_dashboard=False)
    mock_resources = SparkResources(
        driver_cores=2, driver_memory="1G", executor_cores=2, executor_memory="1G", num_executors=2
    )
    mock_prepare_resources.return_value = mock_resources
    spark: SparkSession = darwin.init_spark()
    df = spark.sql("select * from promo_winnings_sfy limit 10")
    assert df.count() == 10
