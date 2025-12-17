from dataclasses import dataclass
from enum import Enum
from typing import Optional, Dict, Any


class JobStatus(str, Enum):
    """An enumeration for describing the status of a job."""

    #: The job has not started yet, likely waiting for the runtime_env to be set up.
    PENDING = "PENDING"
    #: The job is currently running.
    RUNNING = "RUNNING"
    #: The job was intentionally stopped by the user.
    STOPPED = "STOPPED"
    #: The job finished successfully.
    SUCCEEDED = "SUCCEEDED"
    #: The job failed.
    FAILED = "FAILED"
    #: The job failed.
    TIMED_OUT = "TIMED_OUT"

    def __str__(self) -> str:
        return f"{self.value}"

    def is_terminal(self) -> bool:
        """Return whether or not this status is terminal.

        A terminal status is one that cannot transition to any other status.
        The terminal statuses are "STOPPED", "SUCCEEDED", and "FAILED".

        Returns:
            True if this status is terminal, otherwise False.
        """
        return self.value in {"STOPPED", "SUCCEEDED", "FAILED", "TIMED_OUT"}


@dataclass
class JobId:
    """A class for uniquely identifying a job run"""

    #: The cluster_id for the job
    cluster_id: str
    #: The cluster level unique Id for the job
    id: str
    # THe head node IP
    head_node_ip: str


@dataclass
class JobInfo:
    """A class for recording information associated with a job and its execution."""

    # Unique Id for the job
    job_id: JobId
    #: The status of the job.
    status: JobStatus
    #: The entrypoint command for this job.
    entrypoint: str
    #: A message describing the status in more detail.
    message: Optional[str] = None
    # Internal error, user script error
    error_type: Optional[str] = None
    #: The time when the job was started.  A Unix timestamp in ms.
    start_time: Optional[int] = None
    #: The time when the job moved into a terminal state.  A Unix timestamp in ms.
    end_time: Optional[int] = None
    #: Arbitrary user-provided metadata for the job.
    metadata: Optional[Dict[str, str]] = None
    #: The runtime environment for the job.
    runtime_env: Optional[Dict[str, Any]] = None
