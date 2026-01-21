"""
Integration tests for Darwin SDK.

These tests are designed to run in CI against a real Ray cluster deployed
via the Darwin platform (init.sh -> setup.sh -> start.sh).

They do NOT require external AWS resources like S3, Glue Catalog, etc.
"""

import os
import shutil
import tempfile
from unittest.mock import MagicMock, patch

import pytest

# Skip all tests in this module if not in CI or LOCAL environment
pytestmark = pytest.mark.skipif(
    os.getenv("ENV") not in ("LOCAL", "CI", "local", "ci"),
    reason="Integration tests only run in LOCAL/CI environment",
)


class TestRayClusterConnectivity:
    """Tests for Ray cluster connectivity and distributed task execution."""

    def test_ray_init_and_cluster_resources(self):
        """Test that Ray can connect to the cluster and retrieve resources."""
        import ray

        # Shutdown any existing connection
        if ray.is_initialized():
            ray.shutdown()

        # Initialize Ray (will use RAY_ADDRESS env var if set)
        ray.init(ignore_reinit_error=True)

        try:
            # Verify connection
            assert ray.is_initialized(), "Ray should be initialized"

            # Get cluster resources
            resources = ray.cluster_resources()
            assert "CPU" in resources, "Cluster should have CPU resources"
            assert resources.get("CPU", 0) > 0, "Cluster should have at least 1 CPU"

            # Get nodes
            nodes = ray.nodes()
            alive_nodes = [n for n in nodes if n["Alive"]]
            assert len(alive_nodes) >= 1, "Cluster should have at least 1 alive node"

        finally:
            ray.shutdown()

    def test_ray_remote_task_execution(self):
        """Test that Ray can execute remote tasks."""
        import ray

        if ray.is_initialized():
            ray.shutdown()

        ray.init(ignore_reinit_error=True)

        try:

            @ray.remote
            def square(x):
                return x * x

            # Execute tasks
            futures = [square.remote(i) for i in range(10)]
            results = ray.get(futures)

            # Verify results
            expected = [i * i for i in range(10)]
            assert results == expected, f"Expected {expected}, got {results}"

        finally:
            ray.shutdown()

    def test_ray_distributed_task_distribution(self):
        """Test that tasks are distributed across nodes (if multiple nodes available)."""
        import socket
        from collections import Counter

        import ray

        if ray.is_initialized():
            ray.shutdown()

        ray.init(ignore_reinit_error=True)

        try:

            @ray.remote
            def get_hostname():
                import time

                time.sleep(0.05)  # Small delay to encourage distribution
                return socket.gethostname()

            # Run many tasks to encourage distribution
            futures = [get_hostname.remote() for _ in range(20)]
            hostnames = ray.get(futures)

            # Count unique hostnames
            host_counts = Counter(hostnames)

            # At minimum, we should get results from at least 1 host
            assert len(host_counts) >= 1, "Should have at least 1 host executing tasks"

            # Verify all 20 tasks completed
            assert len(hostnames) == 20, "All 20 tasks should complete"

        finally:
            ray.shutdown()


class TestSparkSession:
    """Tests for Spark session initialization and basic operations."""

    @pytest.fixture(autouse=True)
    def setup_mock_compute_service(self):
        """Mock the compute service for local testing."""
        mock_response = {
            "data": {
                "cluster_id": os.getenv("CLUSTER_ID", "ray-test"),
                "name": "test-cluster",
                "status": "RUNNING",
                "has_ondemand_worker_group": True,
                "worker_groups": [
                    {
                        "name": "ondemand",
                        "replicas": 2,
                        "resources": {"CPU": 2, "memory": 4294967296},
                    }
                ],
                "spark_config": {
                    "spark.app.name": "darwin-ci-test",
                    "spark.executor.cores": "1",
                    "spark.executor.memory": "1G",
                    "spark.executor.instances": "2",
                    "spark.driver.cores": "1",
                    "spark.driver.memory": "1G",
                    "spark.darwin.workingDir": "/tmp/darwin",
                    "spark.darwin.enableRemoteShuffle": "false",
                    "spark.darwin.dynamicAllocation.enabled": "false",
                    "spark.darwin.loggingLevel": "WARN",
                },
            }
        }

        with patch("darwin.compute.service.ComputeService") as mock_service:
            mock_instance = MagicMock()
            mock_instance.get_compute_metadata.return_value = MagicMock(
                data=MagicMock(
                    cluster_id="ray-test",
                    name="test-cluster",
                    status="RUNNING",
                    has_ondemand_worker_group=True,
                    spark_config=mock_response["data"]["spark_config"],
                )
            )
            mock_service.return_value = mock_instance
            yield mock_instance

    def test_spark_session_creation_local(self):
        """Test creating a local Spark session (without Ray)."""
        from pyspark.sql import SparkSession

        spark = (
            SparkSession.builder.appName("darwin-ci-test")
            .master("local[2]")
            .config("spark.driver.memory", "1g")
            .config("spark.executor.memory", "1g")
            .config("spark.sql.shuffle.partitions", "2")
            .getOrCreate()
        )

        try:
            assert spark is not None, "SparkSession should be created"
            assert spark.sparkContext.appName == "darwin-ci-test"

            # Simple test
            df = spark.range(10)
            assert df.count() == 10

        finally:
            spark.stop()

    def test_spark_dataframe_operations(self):
        """Test Spark DataFrame transformations and actions."""
        from pyspark.sql import SparkSession
        from pyspark.sql.functions import col

        spark = (
            SparkSession.builder.appName("darwin-df-test")
            .master("local[2]")
            .config("spark.driver.memory", "1g")
            .getOrCreate()
        )

        try:
            # Create DataFrame
            data = [(1, "alice", 100), (2, "bob", 200), (3, "charlie", 300)]
            df = spark.createDataFrame(data, ["id", "name", "amount"])

            # Transformations
            df_transformed = (
                df.filter(col("amount") > 100).withColumn("doubled", col("amount") * 2).select("id", "name", "doubled")
            )

            # Actions
            results = df_transformed.collect()

            assert len(results) == 2, "Should have 2 rows after filter"
            assert results[0]["doubled"] == 400
            assert results[1]["doubled"] == 600

        finally:
            spark.stop()

    def test_spark_sql_operations(self):
        """Test Spark SQL DDL and DML operations."""
        from pyspark.sql import SparkSession

        spark = (
            SparkSession.builder.appName("darwin-sql-test")
            .master("local[2]")
            .config("spark.driver.memory", "1g")
            .config("spark.sql.warehouse.dir", "/tmp/spark-warehouse")
            .enableHiveSupport()
            .getOrCreate()
        )

        try:
            # Create temporary view
            data = [(1, "product_a", 10.0), (2, "product_b", 20.0)]
            df = spark.createDataFrame(data, ["id", "name", "price"])
            df.createOrReplaceTempView("products")

            # Run SQL queries
            result = spark.sql("SELECT COUNT(*) as cnt FROM products").collect()
            assert result[0]["cnt"] == 2

            result = spark.sql("SELECT SUM(price) as total FROM products").collect()
            assert result[0]["total"] == 30.0

            result = spark.sql(
                """
                SELECT name, price * 1.1 as price_with_tax
                FROM products
                WHERE price > 15
                """
            ).collect()
            assert len(result) == 1
            assert result[0]["name"] == "product_b"

        finally:
            spark.stop()


class TestSparkFileIO:
    """Tests for Spark file I/O operations."""

    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for test files."""
        tmpdir = tempfile.mkdtemp(prefix="darwin_test_")
        yield tmpdir
        shutil.rmtree(tmpdir, ignore_errors=True)

    def test_parquet_write_and_read(self, temp_dir):
        """Test writing and reading Parquet files."""
        from pyspark.sql import SparkSession

        spark = (
            SparkSession.builder.appName("darwin-parquet-test")
            .master("local[2]")
            .config("spark.driver.memory", "1g")
            .getOrCreate()
        )

        try:
            # Create DataFrame
            data = [(i, f"name_{i}", float(i * 10)) for i in range(100)]
            df = spark.createDataFrame(data, ["id", "name", "value"])

            # Write to Parquet
            parquet_path = os.path.join(temp_dir, "test_data.parquet")
            df.write.mode("overwrite").parquet(parquet_path)

            # Verify file exists
            assert os.path.exists(parquet_path), "Parquet file should be created"

            # Read back
            df_read = spark.read.parquet(parquet_path)

            assert df_read.count() == 100, "Should read 100 rows"
            assert set(df_read.columns) == {"id", "name", "value"}

        finally:
            spark.stop()

    def test_csv_write_and_read(self, temp_dir):
        """Test writing and reading CSV files."""
        from pyspark.sql import SparkSession

        spark = (
            SparkSession.builder.appName("darwin-csv-test")
            .master("local[2]")
            .config("spark.driver.memory", "1g")
            .getOrCreate()
        )

        try:
            # Create DataFrame
            data = [(1, "alice"), (2, "bob"), (3, "charlie")]
            df = spark.createDataFrame(data, ["id", "name"])

            # Write to CSV
            csv_path = os.path.join(temp_dir, "test_data.csv")
            df.write.mode("overwrite").option("header", "true").csv(csv_path)

            # Read back
            df_read = spark.read.option("header", "true").csv(csv_path)

            assert df_read.count() == 3, "Should read 3 rows"

        finally:
            spark.stop()

    def test_json_write_and_read(self, temp_dir):
        """Test writing and reading JSON files."""
        from pyspark.sql import SparkSession

        spark = (
            SparkSession.builder.appName("darwin-json-test")
            .master("local[2]")
            .config("spark.driver.memory", "1g")
            .getOrCreate()
        )

        try:
            # Create DataFrame
            data = [
                {"id": 1, "data": {"nested": "value1"}},
                {"id": 2, "data": {"nested": "value2"}},
            ]
            df = spark.createDataFrame(data)

            # Write to JSON
            json_path = os.path.join(temp_dir, "test_data.json")
            df.write.mode("overwrite").json(json_path)

            # Read back
            df_read = spark.read.json(json_path)

            assert df_read.count() == 2, "Should read 2 rows"

        finally:
            spark.stop()


class TestSparkOnRay:
    """Tests for RayDP Spark integration (Spark on Ray)."""

    @pytest.mark.skipif(
        os.getenv("RAY_ADDRESS") is None or os.getenv("RAY_ADDRESS") == "local",
        reason="Requires a real Ray cluster (RAY_ADDRESS must be set)",
    )
    def test_raydp_spark_session(self):
        """Test creating a Spark session via RayDP."""
        import ray
        import raydp

        if ray.is_initialized():
            ray.shutdown()

        ray.init(ignore_reinit_error=True)

        try:
            # Create Spark session via RayDP
            spark = raydp.init_spark(
                app_name="darwin-raydp-test",
                num_executors=1,
                executor_cores=1,
                executor_memory="512m",
            )

            assert spark is not None, "RayDP Spark session should be created"

            # Simple test
            df = spark.range(10)
            assert df.count() == 10

        finally:
            raydp.stop_spark()
            ray.shutdown()

    @pytest.mark.skipif(
        os.getenv("RAY_ADDRESS") is None or os.getenv("RAY_ADDRESS") == "local",
        reason="Requires a real Ray cluster (RAY_ADDRESS must be set)",
    )
    def test_raydp_dataframe_operations(self):
        """Test DataFrame operations with RayDP Spark."""
        import ray
        import raydp
        from pyspark.sql.functions import col

        if ray.is_initialized():
            ray.shutdown()

        ray.init(ignore_reinit_error=True)

        try:
            spark = raydp.init_spark(
                app_name="darwin-raydp-df-test",
                num_executors=1,
                executor_cores=1,
                executor_memory="512m",
            )

            # Create and transform DataFrame
            data = [(i, f"item_{i}", i * 1.5) for i in range(50)]
            df = spark.createDataFrame(data, ["id", "name", "value"])

            result = df.filter(col("value") > 50).count()

            # Items with value > 50 are those with id > 33
            expected_count = sum(1 for i in range(50) if i * 1.5 > 50)
            assert result == expected_count

        finally:
            raydp.stop_spark()
            ray.shutdown()


class TestDarwinSDKImports:
    """Tests to verify Darwin SDK imports work correctly."""

    def test_darwin_module_imports(self):
        """Test that all Darwin SDK modules can be imported."""
        # Core modules
        import darwin
        from darwin.compute.get_cluster_response_dto import ClusterResponse

        # Compute service
        from darwin.compute.service import ComputeService

        # Config modules
        from darwin.config_clients.application_config_client import (
            ApplicationConfigClient,
        )
        from darwin.config_clients.spark_config_client import SparkConfigClient
        from darwin.darwin import get_spark_session, init_spark, stop_spark
        from darwin.exceptions import NoActiveSparkSessionError

        # Spark modules
        from darwin.spark.spark import start_spark, stop_raydp_spark
        from darwin.spark.spark_resources import SparkResources
        from darwin.util.enums import SparkLoggingLevel

        # Utils
        from darwin.util.utils import get_cluster_id, get_jars

    def test_darwin_version(self):
        """Test that Darwin SDK version is available."""
        from darwin.version import VERSION

        assert VERSION is not None
        assert len(VERSION) > 0


class TestDarwinExceptions:
    """Tests for Darwin SDK exception handling."""

    def test_no_active_spark_session_error(self):
        """Test NoActiveSparkSessionError is raised when no session exists."""
        import darwin
        from darwin.exceptions import NoActiveSparkSessionError

        # Ensure no session exists
        try:
            darwin.stop_spark()
        except Exception:
            pass

        with pytest.raises(NoActiveSparkSessionError):
            darwin.get_spark_session()
