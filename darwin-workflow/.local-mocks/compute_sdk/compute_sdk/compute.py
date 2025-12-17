"""Mock ComputeCluster for local development"""
import logging

logger = logging.getLogger(__name__)


class ComputeCluster:
    """Mock ComputeCluster that simulates cluster operations without actual compute backend"""
    
    def __init__(self, *args, **kwargs):
        """Initialize mock cluster"""
        logger.info("Mock ComputeCluster initialized (local development mode)")
        self.cluster_id = kwargs.get('cluster_id', 'mock-cluster-001')
        self.cluster_name = kwargs.get('cluster_name', 'mock-local-cluster')
        self.status = "RUNNING"
        
    def create_cluster(self, *args, **kwargs):
        """Mock cluster creation"""
        logger.info(f"Mock: Creating cluster with args={args}, kwargs={kwargs}")
        return {
            "cluster_id": self.cluster_id,
            "status": "RUNNING",
            "message": "Mock cluster created successfully"
        }
    
    def get_cluster(self, cluster_id=None):
        """Mock get cluster info"""
        logger.info(f"Mock: Getting cluster info for {cluster_id or self.cluster_id}")
        return {
            "cluster_id": cluster_id or self.cluster_id,
            "status": "RUNNING",
            "nodes": 1,
            "type": "mock"
        }
    
    def delete_cluster(self, cluster_id=None):
        """Mock cluster deletion"""
        logger.info(f"Mock: Deleting cluster {cluster_id or self.cluster_id}")
        return {
            "cluster_id": cluster_id or self.cluster_id,
            "status": "TERMINATED",
            "message": "Mock cluster deleted successfully"
        }
    
    def submit_job(self, *args, **kwargs):
        """Mock job submission"""
        logger.info(f"Mock: Submitting job with args={args}, kwargs={kwargs}")
        return {
            "job_id": "mock-job-001",
            "status": "SUBMITTED",
            "cluster_id": self.cluster_id
        }
    
    def get_job_status(self, job_id):
        """Mock get job status"""
        logger.info(f"Mock: Getting status for job {job_id}")
        return {
            "job_id": job_id,
            "status": "COMPLETED",
            "message": "Mock job completed"
        }
    
    def get_details(self, cluster_id):
        """Mock get cluster details - required for cluster validation"""
        logger.info(f"Mock: Getting cluster details for {cluster_id}")
        return {
            "status": "SUCCESS",
            "data": {
                "cluster_id": cluster_id,
                "status": "active",
                "worker_node_configs": []
            }
        }






