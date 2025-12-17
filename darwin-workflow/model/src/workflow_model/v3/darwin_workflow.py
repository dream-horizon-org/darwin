from enum import Enum

from tortoise import fields
from tortoise.models import Model

from workflow_model.constants.constants import DEFAULT_TIMEZONE


# ✅ Model for `workflow`
class WorkflowV3(Model):
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
        table = "workflow_v3"
        indexes = [
            ("workflow_id",),
            ("workflow_name",)
        ]

    def __str__(self):
        return self.workflow_name


# ✅ Model for `workflow_runs`
class WorkflowRunV3(Model):
    id = fields.IntField(pk=True)
    run_id = fields.CharField(max_length=255)
    workflow_id = fields.CharField(max_length=255)
    workflow_name = fields.CharField(max_length=255)
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
    attempt = fields.IntField(default=1)

    class Meta:
        table = "workflow_runs_v3"
        unique_together = (("run_id", "workflow_id", "attempt"),)  # Composite primary key
        indexes = [
            ("run_id", "workflow_id"),
            ("state",)
        ]

    def __str__(self):
        return f"Run {self.run_id} - Workflow {self.workflow_id} - State {self.state}"


# Task type enum for V3
class TaskType(str, Enum):
    PELICAN = "pelican"
    DARWIN = "darwin"


# ✅ Updated Model for `workflow_task` - V3 compatible
class WorkflowTask(Model):
    id = fields.IntField(pk=True)
    workflow = fields.ForeignKeyField("models.WorkflowV3", related_name="tasks")
    task_name = fields.CharField(max_length=255)
    task_type = fields.CharEnumField(TaskType)
    retries = fields.IntField(default=1)
    timeout = fields.IntField(default=7200)  # seconds
    depends_on = fields.JSONField(default=[])  # Array of task names
    pool = fields.CharField(max_length=255, default="default")
    order_index = fields.IntField(default=0)  # For task ordering
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "workflow_task_v3"
        unique_together = [("workflow", "task_name")]
        indexes = [
            ("workflow", "task_name"),
            ("task_type",),
            ("order_index",)
        ]

    def __str__(self):
        return f"{self.task_name} ({self.task_type})"


# ✅ Model for Pelican-specific configuration
class PelicanConfig(Model):
    id = fields.IntField(pk=True)
    task = fields.OneToOneField("models.WorkflowTask", related_name="pelican_config")
    # Store the complex nested structures as JSON for flexibility
    artifact = fields.JSONField()  # PelicanArtifact: {file, class_name, spark_version}
    cluster = fields.JSONField(null=True)  # PelicanCluster: {spark_version, driver, worker}
    spark_configs = fields.JSONField(default={})  # Optional spark configuration overrides
    instance_role = fields.CharField(max_length=255, default="ds_dataengineering_role")
    args = fields.JSONField(default=[])  # Application command line arguments
    polling_interval = fields.IntField(default=15)  # Time in seconds between polling
    application_name = fields.CharField(max_length=255, null=True)  # Logical name for the Spark application
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "pelican_config_v3"

    def __str__(self):
        return f"Pelican config for {self.task.task_name}"


# ✅ Model for Darwin-specific configuration
class DarwinConfig(Model):
    id = fields.IntField(pk=True)
    task = fields.OneToOneField("models.WorkflowTask", related_name="darwin_config")
    source = fields.CharField(max_length=500)  # Notebook/script source location
    source_type = fields.CharField(max_length=50, default="Workspace")  # Enum: git/workspace
    file_path = fields.CharField(max_length=500, null=True)  # Path to notebook or script if source_type is Git
    dynamic_artifact = fields.BooleanField(default=True)  # Whether to auto-fetch artifact
    cluster_name = fields.CharField(max_length=255, null=True)  # Name of the cluster definition
    cluster_id = fields.CharField(max_length=255, null=True)  # Cluster ID of existing all purpose cluster
    cluster_type = fields.CharField(max_length=50)  # Cluster type: job, basic
    dependent_libraries = fields.TextField(null=True)  # Comma separated string of libraries
    input_parameters = fields.JSONField(default={})  # Parameters passed to task
    ha_config = fields.JSONField(default={})  # High availability settings
    packages = fields.JSONField(default=[])  # Package/library references
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "darwin_config_v3"

    def __str__(self):
        return f"Darwin config for {self.task.task_name}"

class TaskRun(Model):
    id = fields.IntField(pk=True)
    workflow_id = fields.CharField(max_length=255, index=True)
    task_name = fields.CharField(max_length=255, index=True)
    run_id = fields.CharField(max_length=255, index=True)
    attempt = fields.IntField(default=1)
    task = fields.ForeignKeyField("models.WorkflowTask", related_name="runs")
    start_time = fields.DatetimeField(null=True)
    end_time = fields.DatetimeField(null=True)
    duration = fields.IntField(null=True)
    run_status = fields.CharField(max_length=50, null=True)
    run_metadata = fields.JSONField(null=True)

    class Meta:
        unique_together = ("workflow_id", "run_id", "task", "attempt")
        table = "task_runs_v3"

