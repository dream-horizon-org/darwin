import subprocess
import time
import logging
import sys
import os
import requests

# Only import boto3 for local environments
ENV = os.getenv("ENV", os.getenv("ENVIRONMENT", "stag"))
LOCAL_ENVS = ['local', 'darwin-local']
IS_LOCAL_ENV = ENV in LOCAL_ENVS

if IS_LOCAL_ENV:
    import boto3
    from botocore.exceptions import ClientError

def api_request(
    method, url, data = None, headers = None
):
    """
    Sends a request to the given URL and returns the response.
    :param method: HTTP method
    :param url: URL
    :param params: Query parameters
    :param data: Request body
    :param headers: Request headers
    :return: Response
    """
    RETRY_COUNT = 0
    while RETRY_COUNT < 3:
        response = requests.request(
            method, url, params=None, json=data, headers=headers
        )
        if not 200 <= response.status_code < 300:
            RETRY_COUNT += 1
        else:
            response_json = response.json()
            return response_json
    raise Exception("failed to send dd")

def send_metric(val):
    """
    Sends a metric data point to Datadog.
    """
    # Get Datadog API URL and key from environment variables
    url = os.getenv("DATADOG_API_URL", "https://api.datadoghq.com/api/v2/series")
    datadog_api_key = os.getenv("DATADOG_API_KEY", "")
    
    if not datadog_api_key:
        return  # Skip metric if no API key (silently fail for local environments)

    payload = {
        "series": [
            {
                "metric": "aws.ec2.darwin.workflow.sync_dag",
                "tags": [],
                "points": [{"timestamp": int(time.time()), "value": val}],
            }
        ]
    }

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "DD-API-KEY": datadog_api_key,
    }

    response = api_request("POST", url, data=payload, headers=headers)
    print("Metric sent successfully:", response)


# Get S3 and local paths from environment variables
S3_BUCKET = os.getenv("S3_DAGS_FOLDER", "s3://workflow-artifacts/workflow/airflow_artifacts/dags/")
LOCAL_PATH = os.getenv("AIRFLOW_DAGS_LOCAL_PATH", "/root/airflow/dags/")
SLEEP_INTERVAL = int(os.getenv("S3_SYNC_INTERVAL", "1"))  # seconds, default 1
MAX_RETRIES = 3
SYNC_COMMAND = ["aws", "s3", "sync", S3_BUCKET, LOCAL_PATH, "--exact-timestamps"]

# Parse S3 path (format: s3://bucket-name/path/to/dags/)
def parse_s3_path(s3_path):
    """Parse s3://bucket/path format into bucket and prefix"""
    if not s3_path.startswith("s3://"):
        raise ValueError(f"Invalid S3 path format: {s3_path}")
    path_without_protocol = s3_path[5:]  # Remove "s3://"
    parts = path_without_protocol.split("/", 1)
    bucket = parts[0]
    prefix = parts[1] if len(parts) > 1 else ""
    if prefix and not prefix.endswith("/"):
        prefix += "/"
    return bucket, prefix


def sync_s3():
    """Sync DAGs from S3 to local filesystem"""
    if IS_LOCAL_ENV:
        # Use boto3 for local environments (LocalStack support)
        return _sync_s3_boto3()
    else:
        # Use AWS CLI for production/other environments
        return _sync_s3_aws_cli()


def _sync_s3_boto3():
    """Sync DAGs from S3 using boto3 (for local/darwin-local environments)"""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Starting S3 sync using boto3 (attempt {attempt}/{MAX_RETRIES})...")
            
            # Parse S3 path
            bucket_name, s3_prefix = parse_s3_path(S3_BUCKET)
            
            # Configure S3 client
            s3_config = {}
            endpoint_url = os.getenv("AWS_ENDPOINT_URL") or os.getenv("AWS_ENDPOINT_OVERRIDE")
            if endpoint_url:
                s3_config['endpoint_url'] = endpoint_url
                aws_access_key = os.getenv("AWS_ACCESS_KEY_ID", "minioadmin")
                aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "minioadmin")
                s3_config['aws_access_key_id'] = aws_access_key
                s3_config['aws_secret_access_key'] = aws_secret_key
            
            s3_client = boto3.client('s3', **s3_config)
            
            # Ensure local directory exists
            os.makedirs(LOCAL_PATH, exist_ok=True)
            
            # List objects in S3
            paginator = s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(Bucket=bucket_name, Prefix=s3_prefix)
            
            synced_count = 0
            for page in pages:
                if 'Contents' not in page:
                    continue
                
                for obj in page['Contents']:
                    # Skip directories
                    if obj['Key'].endswith('/'):
                        continue
                    
                    # Get relative path from prefix
                    relative_path = obj['Key'][len(s3_prefix):]
                    if not relative_path:
                        continue
                    
                    local_file_path = os.path.join(LOCAL_PATH, relative_path)
                    
                    # Create subdirectories if needed
                    os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
                    
                    # Download file if it doesn't exist or S3 version is newer
                    should_download = True
                    if os.path.exists(local_file_path):
                        local_mtime = os.path.getmtime(local_file_path)
                        s3_mtime = obj['LastModified'].timestamp()
                        if local_mtime >= s3_mtime:
                            should_download = False
                    
                    if should_download:
                        s3_client.download_file(bucket_name, obj['Key'], local_file_path)
                        # Set file modification time to match S3
                        os.utime(local_file_path, (obj['LastModified'].timestamp(), obj['LastModified'].timestamp()))
                        synced_count += 1
                        logging.info(f"  Synced: {relative_path}")
            
            # Remove local files that don't exist in S3 (cleanup)
            if synced_count > 0 or attempt == 1:  # Only cleanup on first attempt or if we synced
                local_files = []
                for root, dirs, files in os.walk(LOCAL_PATH):
                    for file in files:
                        rel_path = os.path.relpath(os.path.join(root, file), LOCAL_PATH)
                        local_files.append(rel_path)
                
                # Get all S3 keys
                s3_keys = set()
                for page in paginator.paginate(Bucket=bucket_name, Prefix=s3_prefix):
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            if not obj['Key'].endswith('/'):
                                rel_key = obj['Key'][len(s3_prefix):]
                                if rel_key:
                                    s3_keys.add(rel_key)
                
                # Remove files not in S3
                for local_file in local_files:
                    if local_file not in s3_keys:
                        file_path = os.path.join(LOCAL_PATH, local_file)
                        os.remove(file_path)
                        logging.info(f"  Removed: {local_file}")
            
            logging.info(f"S3 Sync Successful: {synced_count} files synced")
            send_metric(1)
            return True

        except Exception as e:
            logging.warning("Attempt %d: S3 Sync Failed: %s", attempt, str(e))
            send_metric(0)
            if attempt < MAX_RETRIES:
                time.sleep(2 ** attempt)  # Exponential backoff (2, 4, 8 seconds)
            else:
                logging.error("S3 Sync failed after %d attempts. Sending alert!", MAX_RETRIES)
                send_alert()
                return False
    
    return False


def _sync_s3_aws_cli():
    """Sync DAGs from S3 using AWS CLI (for production/other environments)"""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Starting S3 sync using AWS CLI (attempt {attempt}/{MAX_RETRIES})...")
            process = subprocess.Popen(SYNC_COMMAND, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()

            if process.returncode == 0:
                logging.info("S3 Sync Successful")
                logging.info("S3 Sync Successful: %s", stdout.decode())
                send_metric(1)
                return True
            else:
                logging.warning("Attempt %d: S3 Sync Failed: %s", attempt, stderr.decode())
                send_metric(0)

        except OSError as e:  # Handles FileNotFoundError for older Python versions
            logging.critical("AWS CLI not found. Make sure AWS CLI is installed and configured.")
            sys.exit(1)

        time.sleep(2 ** attempt)  # Exponential backoff (2, 4, 8 seconds)

    logging.error("S3 Sync failed after %d attempts. Sending alert!", MAX_RETRIES)
    send_alert()
    return False


def send_alert():
    # Placeholder for alert mechanism (email, Slack, etc.)
    logging.critical("ALERT: S3 Sync failed after multiple retries!")


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    logger.info("Starting S3 DAG sync service...")
    logger.info(f"Environment: {ENV}")
    logger.info(f"Sync method: {'boto3 (LocalStack)' if IS_LOCAL_ENV else 'AWS CLI'}")
    logger.info(f"S3_BUCKET: {S3_BUCKET}")
    logger.info(f"LOCAL_PATH: {LOCAL_PATH}")
    logger.info(f"SLEEP_INTERVAL: {SLEEP_INTERVAL}s")
    
    while True:
        sync_s3()
        time.sleep(SLEEP_INTERVAL)
