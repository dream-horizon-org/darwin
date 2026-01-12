from enum import Enum

from tortoise import fields
from tortoise.models import Model

from workflow_model.constants.constants import DEFAULT_TIMEZONE


# ✅ Model for `workflow`
class Workflow(Model):
    id = fields.IntField(pk=True)
    workflow_id = fields.CharField(max_length=255, unique=True)
    workflow_name = fields.CharField(max_length=255, index=True)
    workflow_status = fields.CharField(max_length=50, default="active")
    description = fields.TextField(null=True)
    max_concurrent_runs = fields.IntField(default=1)
    schedule = fields.CharField(max_length=255)
    notify_on = fields.CharField(max_length=255)
    parameters = fields.JSONField(default={})
    retries = fields.IntField(default=0)
    queue_enabled = fields.BooleanField(default=True)
    expected_run_duration = fields.IntField(null=True)
    notify_on_states = fields.JSONField(default=['FAILED'])
    callback_urls = fields.JSONField(null=True)
    event_types = fields.JSONField(null=True)
    display_name = fields.CharField(max_length=255, null=True)
    created_by = fields.CharField(max_length=255, null=True)
    tags = fields.JSONField(null=True)
    start_date = fields.DatetimeField(null=True)
    end_date = fields.DatetimeField(null=True)
    last_updated_on = fields.DatetimeField(null=True)
    next_run = fields.DatetimeField(null=True)
    tenant = fields.CharField(max_length=255, default='d11')
    timezone = fields.CharField(max_length=10, default=DEFAULT_TIMEZONE)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "workflow"
        indexes = [
            ("workflow_id",),
            ("workflow_name",)
        ]

    def __str__(self):
        return self.workflow_name


# ✅ Model for `workflow_runs`
class WorkflowRun(Model):
    id = fields.IntField(pk=True)
    run_id = fields.CharField(max_length=255)
    workflow_id = fields.CharField(max_length=255)
    dag_id = fields.CharField(max_length=255)
    state = fields.CharField(max_length=50)
    parameters = fields.JSONField(default={})
    run_type = fields.CharField(max_length=50)  # ✅ Added `run_type`
    triggered_by = fields.CharField(max_length=255, null=True)  # ✅ Added `triggered_by`
    start_time = fields.DatetimeField()
    end_time = fields.DatetimeField(null=True)
    duration = fields.IntField(null=True)
    repair_time = fields.DatetimeField(null=True)
    expected_run_duration = fields.IntField(null=True)
    sla_exceeded = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "workflow_runs"
        unique_together = (("run_id", "workflow_id"),)  # Composite primary key
        indexes = [
            ("run_id", "workflow_id"),
            ("state",)
        ]

    def __str__(self):
        return f"Run {self.run_id} - Workflow {self.workflow_id} - State {self.state}"


# ✅ Model for `metadata`
class Metadata(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50, unique=True)
    config = fields.JSONField()
    enabled = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "metadata"

    def __str__(self):
        return f"Metadata {self.name} - Enabled: {self.enabled}"


# ✅ Model for `job_cluster_definition`
class JobClusterDefinition(Model):
    id = fields.IntField(pk=True)
    job_cluster_definition_id = fields.CharField(max_length=255, unique=True, index=True)
    cluster_name = fields.CharField(max_length=255, index=True)
    tags = fields.JSONField(default=list)
    runtime = fields.CharField(max_length=255)
    inactive_time = fields.IntField()
    auto_termination_policies = fields.JSONField(default=list)
    head_node_config = fields.JSONField()
    worker_node_configs = fields.JSONField(null=True)
    advance_config = fields.JSONField(default=dict)
    user = fields.CharField(max_length=255)
    cluster_status = fields.CharField(max_length=50, default="active")
    estimated_cost = fields.CharField(max_length=255, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "job_cluster_definition"
        indexes = [
            ("job_cluster_definition_id",),
            ("cluster_name",),
            ("user",)
        ]

    def __str__(self):
        return f"JobCluster {self.cluster_name} ({self.job_cluster_definition_id})"


# ✅ Model for `workflow_cluster`
class WorkflowCluster(Model):
    id = fields.IntField(pk=True)
    workflow_cluster_id = fields.CharField(max_length=255, unique=True, index=True)
    workflow_name = fields.CharField(max_length=255, index=True)
    run_id = fields.CharField(max_length=255, index=True)
    task_name = fields.CharField(max_length=255, index=True)
    cluster_id = fields.CharField(max_length=255)
    try_number = fields.IntField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "workflow_cluster"
        unique_together = (("workflow_name", "run_id", "task_name", "try_number"),)
        indexes = [
            ("workflow_name", "run_id", "task_name"),
            ("cluster_id",),
            ("workflow_cluster_id",)
        ]

    def __str__(self):
        return f"WorkflowCluster {self.workflow_name}/{self.run_id}/{self.task_name}"


# ✅ Model for `recently_visited`
class RecentlyVisited(Model):
    id = fields.IntField(pk=True)
    user_id = fields.CharField(max_length=255, unique=True, index=True)
    visited = fields.JSONField(default=list)  # List of workflow_ids
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "recently_visited"
        indexes = [
            ("user_id",)
        ]

    def __str__(self):
        return f"RecentlyVisited for user {self.user_id} - {len(self.visited)} workflows"

