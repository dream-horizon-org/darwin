from enum import Enum

from workflow_core.models.event_entity import State, Event


class WorkflowState(State):
    WORKFLOW_CREATION_REQUEST_RECEIVED = "WORKFLOW_CREATION_REQUEST_RECEIVED"
    WORKFLOW_CREATION_SUCCESS = "WORKFLOW_CREATION_SUCCESS"
    WORKFLOW_CREATION_FAILED = "WORKFLOW_CREATION_FAILED"
    WORKFLOW_UPDATION_REQUEST_RECEIVED = "WORKFLOW_UPDATION_REQUEST_RECEIVED"
    WORKFLOW_UPDATION_SUCCESS = "WORKFLOW_UPDATION_SUCCESS"
    WORKFLOW_UPDATION_FAILED = "WORKFLOW_UPDATION_FAILED"
    WORKFLOW_TRIGGERED = "WORKFLOW_TRIGGERED"
    WORKFLOW_RUN_STARTED = "WORKFLOW_RUN_STARTED"
    WORKFLOW_RUN_FAILED = "WORKFLOW_RUN_FAILED"
    WORKFLOW_RUN_SUCCESS = "WORKFLOW_RUN_SUCCESS"
    WORKFLOW_TASK_START_REQUESTED = "WORKFLOW_TASK_START_REQUESTED"
    WORKFLOW_TASK_STARTED = "WORKFLOW_TASK_STARTED"
    WORKFLOW_TASK_RUNNING = "WORKFLOW_RUNNING"
    WORKFLOW_TASK_SUCCESS = "WORKFLOW_TASK_SUCCESS"
    WORKFLOW_TASK_FAILED = "WORKFLOW_TASK_FAILED"
    WORKFLOW_CLUSTER_CREATION_SUCCESS = "WORKFLOW_CLUSTER_CREATION_SUCCESS"
    WORKFLOW_CLUSTER_START_REQUESTED = "WORKFLOW_CLUSTER_START_REQUESTED"
    WORKFLOW_CLUSTER_START_SUCCESS = "WORKFLOW_CLUSTER_START_SUCCESS"
    WORKFLOW_CLUSTER_START_FAILED = "WORKFLOW_CLUSTER_START_FAILED"
    WORKFLOW_CLUSTER_STOPPED = "WORKFLOW_CLUSTER_STOPPED"
    WORKFLOW_CLUSTER_CREATION_FAILED = "WORKFLOW_CLUSTER_CREATION_FAILED"
    WORKFLOW_PAUSED = "WORKFLOW_PAUSED"
    WORKFLOW_RESUMED = "WORKFLOW_RESUMED"
    WORKFLOW_DELETE_REQUEST_RECEIVED = "WORKFLOW_DELETE_REQUEST_RECEIVED"
    WORKFLOW_DELETED = "WORKFLOW_DELETED"
    WORKFLOW_TASK_DETAILS_RETRIEVED = "WORKFLOW_TASK_DETAILS_RETRIEVED"
    WORKFLOW_TASK_SKIPPED = "WORKFLOW_TASK_SKIPPED"


class Severity(Enum):
    INFO = "info"
    WARN = "warn"
    ERROR = "error"


event_details = {
    WorkflowState.WORKFLOW_CREATION_REQUEST_RECEIVED: {
        "message": "Workflow creation request received",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_CREATION_SUCCESS: {
        "message": "Workflow creation successful",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_CREATION_FAILED: {
        "message": "Workflow creation failed",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_UPDATION_REQUEST_RECEIVED: {
        "message": "Workflow updation request received",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_UPDATION_SUCCESS: {
        "message": "Workflow updation successful",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_UPDATION_FAILED: {
        "message": "Workflow updation failed",
        "severity": Severity.ERROR,
    },
    WorkflowState.WORKFLOW_TRIGGERED: {
        "message": "Workflow triggered",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_TASK_START_REQUESTED: {
        "message": "Workflow task start requested",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_TASK_STARTED: {
        "message": "Workflow task started",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_TASK_RUNNING: {
        "message": "Workflow running",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_TASK_SUCCESS: {
        "message": "Workflow task successful",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_TASK_FAILED: {
        "message": "Workflow task failed",
        "severity": Severity.ERROR,
    },
    WorkflowState.WORKFLOW_CLUSTER_CREATION_SUCCESS: {
        "message": "Workflow cluster creation successful",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_CLUSTER_START_REQUESTED: {
        "message": "Workflow cluster start requested",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_CLUSTER_START_SUCCESS: {
        "message": "Workflow cluster start successful",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_CLUSTER_START_FAILED: {
        "message": "Workflow cluster start failed",
        "severity": Severity.ERROR,
    },
    WorkflowState.WORKFLOW_CLUSTER_STOPPED: {
        "message": "Workflow cluster stopped",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_CLUSTER_CREATION_FAILED: {
        "message": "Workflow cluster creation failed",
        "severity": Severity.ERROR,
    },
    WorkflowState.WORKFLOW_PAUSED: {
        "message": "Workflow paused",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_RESUMED: {
        "message": "Workflow resumed",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_DELETE_REQUEST_RECEIVED: {
        "message": "Workflow delete request received",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_DELETED: {
        "message": "Workflow deleted",
        "severity": Severity.WARN,
    },
    WorkflowState.WORKFLOW_TASK_DETAILS_RETRIEVED: {
        "message": "Workflow task details retrieved",
        "severity": Severity.INFO,
    },
    WorkflowState.WORKFLOW_TASK_SKIPPED: {
        "message": "Workflow task skipped",
        "severity": Severity.INFO,
    },
}


class WorkflowEvent:
    def __init__(self, event: Event):
        self.event = event

    def get_severity(self):
        return event_details[self.event.state]["severity"].value

    def get_message(self):
        return event_details[self.event.state]["message"]

    def get_event(self):
        return {
            "entity": self.event.entity.value,
            "entity_id": self.event.entity_id,
            "state": self.event.state.value,
            "metadata": self.event.metadata,
            "timestamp": self.event.timestamp,
            "severity": self.get_severity(),
            "message": self.get_message(),
        }
