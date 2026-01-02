# TODO: Exception classes lack error codes - add codes for programmatic error handling (e.g., WORKFLOW_NOT_FOUND = "WF001")
# TODO: Consider using a base DarwinException class with common fields (code, message, details)
class WorkflowNotFound(Exception):
    """Exception raised when workflow not found."""

    def __init__(self, message="workflow not found"):
        self.message = message
        super().__init__(self.message)


class AirflowWorkflowNotFoundException(Exception):
    """Exception raised when a specified workflow is not found in Apache Airflow."""

    def __init__(self, workflow_name):
        self.workflow_name = workflow_name
        super().__init__(f"Airflow workflow '{workflow_name}' not found.")


class RunNotFoundException(Exception):
    """Exception raised when run_id not found."""

    def __init__(self, message="run_id not found"):
        self.message = message
        super().__init__(self.message)


class RunNotInRunningStateException(Exception):
    """Exception raised when run is not in running state."""

    def __init__(self, message="run is not in running state"):

        self.message = message
        super().__init__(self.message)


class TaskNotFoundException(Exception):
    """Exception raised when task not found."""

    def __init__(self, message="task not found"):
        self.message = message
        super().__init__(self.message)


class JobClusterNotFoundException(Exception):
    """Exception raised when job cluster definition not found."""

    def __init__(self, message="job cluster definition not found"):
        self.message = message
        super().__init__(self.message)


class InvalidWorkflowException(Exception):
    """Exception raised when workflow is invalid."""

    def __init__(self, message="workflow is invalid"):
        self.message = message
        super().__init__(self.message)


class JobClusterDefinitionUpsertRequestException(Exception):
    """Exception raised when job cluster definition upsert request fields are not properly given."""

    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


class ClusterCreationFailed(Exception):
    """Exception raised when cluster creation failed."""

    def __init__(self, message="Cluster Creation Failed"):
        self.message = message
        super().__init__(self.message)


class UpdateWorkflowException(Exception):
    """Exception raised when workflow update failed."""

    def __init__(self, message="Workflow update failed"):
        self.message = message
        super().__init__(self.message)


class WorkflowNotActiveException(Exception):
    """Exception raised when workflow is not active."""

    def __init__(self, message="workflow is not active"):
        self.message = message
        super().__init__(self.message)


class ClusterNotFoundException(Exception):
    """Exception raised when cluster not found."""

    def __init__(self, message="cluster not found"):
        self.message = message
        super().__init__(self.message)


class RepairRunException(Exception):
    """Exception raised when run repair failed."""

    def __init__(self, message="Run repair failed"):
        self.message = message
        super().__init__(self.message)