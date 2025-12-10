# Darwin SDK Spark Job Submission Guide

This guide explains how to create a compute cluster and submit Spark jobs using the Ray Jobs API with Darwin SDK.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Compute Cluster](#creating-a-compute-cluster)
3. [Submitting Spark Jobs](#submitting-spark-jobs)
4. [Monitoring Jobs](#monitoring-jobs)
5. [Example Spark Job](#example-spark-job)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before submitting Spark jobs, ensure the following are set up:

### 1. Darwin Platform Services Running

```bash
# Check darwin services are running
kubectl get pods -n darwin | grep -E "compute|cluster-manager"
```

Expected output:
```
darwin-cluster-manager-xxx   1/1     Running
darwin-compute-xxx           1/1     Running
```

### 2. Port Forwarding to Darwin Compute

```bash
# Forward darwin-compute API
kubectl port-forward -n darwin svc/darwin-compute 8000:8000 &
```

### 3. Runtime Image Available

Ensure the runtime image is pushed to your registry and registered in the database:

```bash
# Check available runtimes
curl -s http://localhost:8000/get-runtimes | python3 -m json.tool
```

---

## Creating a Compute Cluster

### Option A: Using curl

```bash
curl -X POST http://localhost:8000/cluster \
  -H "Content-Type: application/json" \
  -d '{
    "cluster_name": "spark-job-cluster",
    "tags": ["spark"],
    "runtime": "0.0",
    "head_node_config": {
      "cores": 2,
      "memory": 4,
      "node_capacity_type": "ondemand"
    },
    "worker_node_configs": [{
      "cores_per_pods": 2,
      "memory_per_pods": 4,
      "min_pods": 1,
      "max_pods": 2,
      "disk_setting": null,
      "node_capacity_type": "ondemand"
    }],
    "inactive_time": 60,
    "start_cluster": true,
    "user": "your-username"
  }'
```

**Response:**
```json
{
  "status": "SUCCESS",
  "data": {
    "cluster_id": "id-xxxxxxxxxxxxxxxx",
    "packages": []
  },
  "message": "Cluster created successfully"
}
```

### Option B: Using Darwin Compute SDK

```python
from darwin_compute import client

result = client.create_with_yaml("cluster-config.yaml")
print(f"Cluster ID: {result['cluster_id']}")
```

### Wait for Cluster to be Ready

```bash
# Check cluster pod status
CLUSTER_ID="id-xxxxxxxxxxxxxxxx"
kubectl get pods -n ray -l ray.io/cluster=${CLUSTER_ID}-kuberay

# Expected: Head and worker pods in Running state
```

---

## Submitting Spark Jobs

### Method 1: Using submit_spark_job.sh Script

The Darwin SDK includes a ready-to-use submission script:

```bash
cd darwin-sdk/darwin
./submit_spark_job.sh \
  --cluster-name id-xxxxxxxxxxxxxxxx \
  --namespace ray \
  --job-file /path/to/your/spark_job.py \
  --wait
```

**Options:**
- `--cluster-name`: Ray cluster ID (required)
- `--namespace`: Kubernetes namespace (default: ray)
- `--job-file`: Python job file path (default: examples/darwin_spark_job.py)
- `--kubeconfig`: Path to kubeconfig file
- `--wait`: Wait for job completion

### Method 2: Using Ray Jobs REST API

#### Step 1: Port-forward to Ray Dashboard

```bash
CLUSTER_ID="id-xxxxxxxxxxxxxxxx"
kubectl port-forward -n ray svc/${CLUSTER_ID}-kuberay-head-svc 8265:8265 &
```

#### Step 2: Verify Ray Dashboard is Ready

```bash
curl -s http://localhost:8265/api/version
```

Expected response:
```json
{
  "version": "4",
  "ray_version": "2.37.0",
  "ray_commit": "...",
  "session_name": "session_..."
}
```

#### Step 3: Submit Job

```bash
curl -X POST "http://localhost:8265/api/jobs/" \
  -H "Content-Type: application/json" \
  -d '{
    "entrypoint": "python job_script.py",
    "runtime_env": {
      "working_dir": "s3://your-bucket/jobs/spark_job.zip",
      "env_vars": {
        "CLUSTER_ID": "id-xxxxxxxxxxxxxxxx",
        "ENV": "LOCAL"
      }
    },
    "metadata": {
      "name": "darwin-spark-job",
      "owner": "your-username"
    }
  }'
```

**Response:**
```json
{
  "job_id": "raysubmit_xxxxxxxx",
  "submission_id": "raysubmit_xxxxxxxx"
}
```

### Method 3: Using Ray Python Client

```python
from ray.job_submission import JobSubmissionClient

client = JobSubmissionClient("http://localhost:8265")

job_id = client.submit_job(
    entrypoint="python spark_job.py",
    runtime_env={
        "working_dir": "./",
        "env_vars": {
            "CLUSTER_ID": "id-xxxxxxxxxxxxxxxx",
            "ENV": "LOCAL"
        }
    }
)

print(f"Submitted job: {job_id}")
```

---

## Monitoring Jobs

### Check Job Status

```bash
SUBMISSION_ID="raysubmit_xxxxxxxx"
curl -s "http://localhost:8265/api/jobs/${SUBMISSION_ID}" | python3 -m json.tool
```

**Job Status Values:**
- `PENDING`: Job waiting to start
- `RUNNING`: Job is executing
- `SUCCEEDED`: Job completed successfully
- `FAILED`: Job failed
- `STOPPED`: Job was stopped

### Get Job Logs

```bash
curl -s "http://localhost:8265/api/jobs/${SUBMISSION_ID}/logs"
```

### List All Jobs

```bash
curl -s "http://localhost:8265/api/jobs/" | python3 -m json.tool
```

### Stop a Job

```bash
curl -X POST "http://localhost:8265/api/jobs/${SUBMISSION_ID}/stop"
```

---

## Example Spark Job

Here's a complete example Spark job using Darwin SDK:

```python
#!/usr/bin/env python3
"""
Darwin SDK Spark Job Example
"""
import os
import ray

# Initialize Ray (connects to running cluster)
ray.init()

# Set environment variables
os.environ["ENV"] = "LOCAL"
os.environ["CLUSTER_ID"] = os.getenv("CLUSTER_ID", "unknown")
os.environ["DARWIN_COMPUTE_URL"] = "http://darwin-compute.darwin.svc.cluster.local:8000"

print("=" * 60)
print("Darwin SDK Spark Job")
print(f"Cluster ID: {os.environ['CLUSTER_ID']}")
print("=" * 60)

# Initialize Spark using darwin-sdk
from darwin import init_spark_with_configs

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

# Create DataFrame
df = spark.createDataFrame([
    (1, "Alice", 100),
    (2, "Bob", 200),
    (3, "Charlie", 300),
], ["id", "name", "score"])

# Perform operations
df.show()
print(f"Total records: {df.count()}")
print(f"Average score: {df.agg({'score': 'avg'}).collect()[0][0]}")

# Stop Spark
from darwin import stop_spark
stop_spark()

print("Job completed successfully!")
```

### Key Darwin SDK Functions

| Function | Description |
|----------|-------------|
| `init_spark_with_configs(spark_configs)` | Initialize Spark session with custom configs |
| `start_spark(spark_conf)` | Start Spark with default Glue catalog configs |
| `get_raydp_spark_session()` | Get existing Spark session |
| `stop_spark()` | Stop Spark session cleanly |

---

## Troubleshooting

### Common Issues

#### 1. "Runtime given is incorrect"

The runtime name is not found in the database. Check available runtimes:

```bash
curl -s http://localhost:8000/get-runtimes
```

#### 2. "ImagePullBackOff" on cluster pods

The runtime image cannot be pulled. Verify:
- Image exists in registry
- Registry is accessible from cluster
- Image URL is correct in database

```bash
# Check runtime image in database
kubectl exec -n darwin darwin-mysql-xxx -- \
  mysql -u root -ppassword darwin \
  -e "SELECT runtime, image FROM runtimes_v2;"
```

#### 3. "TransportError 429" - Elasticsearch disk full

Clear the read-only block:

```bash
kubectl exec -n darwin darwin-elasticsearch-0 -- \
  curl -X PUT "localhost:9200/_all/_settings" \
  -H 'Content-Type: application/json' \
  -d '{"index.blocks.read_only_allow_delete": null}'
```

#### 4. Ray job stuck in PENDING

Check Ray head pod status:

```bash
kubectl describe pod ${CLUSTER_ID}-kuberay-head-xxx -n ray
```

#### 5. Connection refused when submitting job

Ensure port-forwarding is active:

```bash
# Kill existing forwards
pkill -f "port-forward.*8265"

# Start fresh
kubectl port-forward -n ray svc/${CLUSTER_ID}-kuberay-head-svc 8265:8265 &
```

### Useful Commands

```bash
# View cluster details
curl -s "http://localhost:8000/cluster/${CLUSTER_ID}" | python3 -m json.tool

# Get Jupyter URL
curl -s "http://localhost:8000/cluster/${CLUSTER_ID}" | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['data']['dashboards']['data']['jupyter_lab_url'])"

# View Ray dashboard
open http://localhost:8265

# View cluster pod logs
kubectl logs -n ray ${CLUSTER_ID}-kuberay-head-xxx -c ray-head -f
```

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  darwin-compute │────▶│ darwin-cluster-  │────▶│   Ray Cluster   │
│      API        │     │     manager      │     │  (Kubernetes)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                 │
        │                                                 ▼
        │                                        ┌─────────────────┐
        │                                        │   Ray Head Pod  │
        │                                        │  - Dashboard    │
        │                                        │  - Jobs API     │
        │                                        │  - Jupyter      │
        │                                        └─────────────────┘
        │                                                 │
        ▼                                                 ▼
┌─────────────────┐                              ┌─────────────────┐
│     MySQL       │                              │ Ray Worker Pods │
│  (runtimes,     │                              │  - Executors    │
│   clusters)     │                              │  - Spark        │
└─────────────────┘                              └─────────────────┘
```

---

## References

- [Darwin SDK Spark Module](../darwin-sdk/darwin/darwin/spark/spark.py)
- [Example Spark Job](../examples/darwin_spark_job.py)
- [Job Submission Script](../darwin-sdk/darwin/submit_spark_job.sh)
- [Ray Jobs API Documentation](https://docs.ray.io/en/latest/cluster/running-applications/job-submission/api.html)

