class ClusterCreationFailed(Exception):
    """Exception raised when cluster creation failed."""

    def __init__(self, message="Cluster Creation Failed"):
        self.message = message
        super().__init__(self.message)
