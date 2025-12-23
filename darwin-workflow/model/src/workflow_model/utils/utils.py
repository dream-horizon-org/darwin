import uuid
from datetime import datetime
from zoneinfo import ZoneInfo
import shortuuid as shortuuid


def get_workflow_id():
    shortuuid.set_alphabet('23456789abcdefghijkmnopqrstuvwxyz')
    workflow_id = "wf_id-" + shortuuid.random()
    return workflow_id


def get_job_cluster_definition_id():
    unique_id = str(uuid.uuid4())[:8]
    job_definition_id = f"job-{unique_id}"
    return job_definition_id


def get_workflow_cluster_id():
    unique_id = str(uuid.uuid4())
    workflow_cluster_id = f"id-{unique_id}"
    return workflow_cluster_id


def get_current_time():
    ist_now = datetime.now(ZoneInfo('Asia/Kolkata'))
    return ist_now.__str__()

