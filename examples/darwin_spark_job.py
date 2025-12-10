#!/usr/bin/env python3
"""
Darwin SDK Spark Job Example

This script demonstrates using darwin-sdk to initialize Spark on Ray
and run a simple Spark job.
"""

import os
import ray

# Initialize Ray (connects to running Ray cluster)
ray.init()

# Set environment for LOCAL setup
os.environ["ENV"] = "LOCAL"
os.environ["CLUSTER_ID"] = id-7as4he2qh8a7ez2j
os.environ["DARWIN_COMPUTE_URL"] = "http://darwin-compute.darwin.svc.cluster.local:8000"

print("=" * 60)
print("Darwin SDK Spark Job")
print("=" * 60)
print(f"Cluster ID: {os.environ['CLUSTER_ID']}")
print(f"Compute URL: {os.environ['DARWIN_COMPUTE_URL']}")
print()

# Initialize Spark using darwin-sdk with custom configs (no Glue dependencies)
print("Initializing Spark via darwin-sdk (with custom configs)...")
from darwin import init_spark_with_configs

# Simple spark configs without AWS Glue metastore
spark_configs = {
    "spark.sql.execution.arrow.pyspark.enabled": "true",
    "spark.sql.session.timeZone": "UTC",
    "spark.sql.shuffle.partitions": "10",
    "spark.default.parallelism": "10",
    "spark.driver.memory": "1g",
    "spark.executor.memory": "1g",
}

spark = init_spark_with_configs(spark_configs=spark_configs)
print(f"Spark version: {spark.version}")
print()

# Run a simple Spark job
print("Creating DataFrame...")
df = spark.createDataFrame([
    (1, "Alice", 100),
    (2, "Bob", 200),
    (3, "Charlie", 300),
    (4, "Diana", 400),
    (5, "Eve", 500),
], ["id", "name", "score"])

print("DataFrame schema:")
df.printSchema()

print("DataFrame contents:")
df.show()

# Perform aggregation
print("Performing aggregation...")
print(f"Total records: {df.count()}")
print(f"Average score: {df.agg({'score': 'avg'}).collect()[0][0]}")
print(f"Sum of scores: {df.agg({'score': 'sum'}).collect()[0][0]}")

# More complex operation
print("\nGrouped operation:")
df.withColumn("category", 
    (df.score / 200).cast("int")
).groupBy("category").count().show()

# Stop Spark
print("\nStopping Spark...")
from darwin import stop_spark
stop_spark()

print("=" * 60)
print("Darwin SDK Spark job completed successfully!")
print("=" * 60)
