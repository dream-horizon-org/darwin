"""
Mock HTTP responses for external services.

This module provides predefined mock responses for DCM, MLflow,
Artifact Builder, and other external services.
"""
from typing import Dict, Any


class MockDCMResponses:
    """Mock responses for Darwin Cluster Manager (DCM) API."""
    
    BUILD_SUCCESS: Dict[str, Any] = {
        "body": {
            "status": "success",
            "artifact_id": "test-env-test-serve-v1.0.0",
            "message": "Resource built successfully"
        }
    }
    
    BUILD_FAILURE: Dict[str, Any] = {
        "body": {
            "status": "error",
            "message": "Failed to build resource"
        }
    }
    
    START_SUCCESS: Dict[str, Any] = {
        "body": {
            "status": "running",
            "resource_id": "test-serve",
            "pod": "test-serve-pod-123",
            "message": "Resource started successfully"
        }
    }
    
    START_FAILURE: Dict[str, Any] = {
        "body": {
            "status": "error",
            "message": "Failed to start resource"
        }
    }
    
    STOP_SUCCESS: Dict[str, Any] = {
        "body": {
            "status": "stopped",
            "resource_id": "test-serve",
            "message": "Resource stopped successfully"
        }
    }
    
    UPDATE_SUCCESS: Dict[str, Any] = {
        "body": {
            "status": "updated",
            "artifact_id": "test-env-test-serve-v1.0.0",
            "message": "Resource updated successfully"
        }
    }
    
    STATUS_RUNNING: str = "Running"
    STATUS_PENDING: str = "Pending"
    STATUS_FAILED: str = "Failed"


class MockMLflowResponses:
    """Mock responses for MLflow API."""
    
    VALIDATE_MODEL_SUCCESS: tuple = (True, None)
    
    VALIDATE_MODEL_NOT_FOUND: tuple = (
        False,
        "Model 'test-model' not found in MLflow registry"
    )
    
    VALIDATE_MODEL_INVALID_URI: tuple = (
        False,
        "Invalid model URI format"
    )
    
    MODEL_INFO: Dict[str, Any] = {
        "name": "iris-classifier",
        "version": "1",
        "run_id": "abc123def456",
        "source": "s3://mlflow-bucket/1/abc123def456/artifacts/model",
        "status": "READY"
    }
    
    MODEL_VERSION_INFO: Dict[str, Any] = {
        "name": "iris-classifier",
        "version": "1",
        "creation_timestamp": 1234567890,
        "last_updated_timestamp": 1234567890,
        "user_id": "test@example.com",
        "current_stage": "Production",
        "source": "s3://mlflow-bucket/1/abc123def456/artifacts/model",
        "run_id": "abc123def456",
        "status": "READY"
    }


class MockArtifactBuilderResponses:
    """Mock responses for Artifact Builder API."""
    
    BUILD_TRIGGERED: Dict[str, Any] = {
        "job_id": "build-job-123",
        "status": "pending",
        "message": "Build job created successfully"
    }
    
    BUILD_IN_PROGRESS: Dict[str, Any] = {
        "job_id": "build-job-123",
        "status": "in_progress",
        "progress": 50,
        "message": "Building Docker image..."
    }
    
    BUILD_SUCCESS: Dict[str, Any] = {
        "job_id": "build-job-123",
        "status": "success",
        "image_url": "localhost:5000/test-serve:v1.0.0",
        "message": "Build completed successfully"
    }
    
    BUILD_FAILURE: Dict[str, Any] = {
        "job_id": "build-job-123",
        "status": "failed",
        "error": "Docker build failed: invalid Dockerfile",
        "message": "Build failed"
    }


class MockWorkflowResponses:
    """Mock responses for Darwin Workflow API."""
    
    WORKFLOW_CREATED: Dict[str, Any] = {
        "workflow_id": "workflow-123",
        "workflow_name": "test-workflow",
        "status": "created"
    }
    
    WORKFLOW_INFO: Dict[str, Any] = {
        "workflow_id": "workflow-123",
        "workflow_name": "test-workflow",
        "schedule": "0 0 * * *",
        "tasks": [
            {
                "task_name": "test-task",
                "cluster_id": "cluster-def-123",
                "file_path": "main.py"
            }
        ]
    }
    
    JOB_CLUSTER_CREATED: Dict[str, Any] = {
        "cluster_id": "cluster-def-123",
        "cluster_name": "test-cluster",
        "status": "created"
    }


class MockKubernetesResponses:
    """Mock responses for Kubernetes API operations."""
    
    POD_RUNNING: Dict[str, Any] = {
        "status": {
            "phase": "Running",
            "conditions": [
                {
                    "type": "Ready",
                    "status": "True"
                }
            ]
        }
    }
    
    POD_PENDING: Dict[str, Any] = {
        "status": {
            "phase": "Pending",
            "conditions": [
                {
                    "type": "Ready",
                    "status": "False"
                }
            ]
        }
    }
    
    DEPLOYMENT_READY: Dict[str, Any] = {
        "status": {
            "replicas": 2,
            "ready_replicas": 2,
            "available_replicas": 2
        }
    }


class MockHTTPResponses:
    """Generic mock HTTP responses."""
    
    SUCCESS_200: Dict[str, Any] = {
        "status_code": 200,
        "body": {
            "status": "success",
            "data": {}
        }
    }
    
    CREATED_201: Dict[str, Any] = {
        "status_code": 201,
        "body": {
            "status": "created",
            "data": {}
        }
    }
    
    BAD_REQUEST_400: Dict[str, Any] = {
        "status_code": 400,
        "body": {
            "status": "error",
            "message": "Bad request"
        }
    }
    
    NOT_FOUND_404: Dict[str, Any] = {
        "status_code": 404,
        "body": {
            "status": "error",
            "message": "Resource not found"
        }
    }
    
    SERVER_ERROR_500: Dict[str, Any] = {
        "status_code": 500,
        "body": {
            "status": "error",
            "message": "Internal server error"
        }
    }


