# TODO: Consider adding a base DarwinComputeException class with error codes for consistent error handling
class ClusterNotFoundError(Exception):
    def __init__(self, cluster_id: str):
        self.cluster_id = cluster_id
        message = f"Cluster {cluster_id} does not exist."
        super().__init__(message)


class ClusterInvalidStateException(Exception):
    def __init__(self, cluster_id: str, current_state: str, expected_state: str):
        self.cluster_id = cluster_id
        self.expected_state = expected_state
        self.current_state = current_state
        message = f"Cluster {cluster_id} is in state '{current_state}', expected state is '{expected_state}'."
        super().__init__(message)


class ClusterRunIdNotFoundError(Exception):
    def __init__(self, cluster_id: str):
        self.cluster_id = cluster_id
        message = f"Cluster run id for cluster {cluster_id} does not exist."
        super().__init__(message)


class ExecutionNotFoundError(Exception):
    def __init__(self, execution_id: str):
        self.execution_id = execution_id
        message = f"Execution {execution_id} does not exist."
        super().__init__(message)


class LibraryNotFoundError(Exception):
    def __init__(self, library_id: str):
        self.library_id = library_id
        message = f"Library {library_id} does not exist."
        super().__init__(message)
