from typing import List, Optional, Literal, Union
from pydantic import BaseModel, validator, root_validator


from workflow_model.workflow import WorkflowTaskRequest, HAConfig, Package

from workflow_model.utils.validators import validate_name


# V3 Task Models
class PelicanArtifact(BaseModel):
    file: str  # S3 Path to the compiled Spark artifact
    class_name: str  # Fully qualified class name to run
    spark_version: str  # Spark version the JAR was compiled against
    args: Optional[List[str]] = []  # Optional arguments for the Spark job


class PelicanConfig(BaseModel):
    artifact: PelicanArtifact  # Defines the Spark artifact, class, and version
    cluster: Optional[dict] = None  # Cluster configuration
    spark_configs: Optional[dict] = {}  # Optional Spark configuration overrides
    instance_role: Optional[str] = "ds_dataengineering_role"  # IAM role
    args: Optional[List[str]] = []  # Application command line arguments
    polling_interval: Optional[int] = 15  # Time in seconds between polling
    application_name: Optional[str] = None  # Logical name for the Spark application


class DarwinConfig(BaseModel):
    source: str  # Notebook/script source location
    source_type: Optional[str] = "Workspace"  # Enum: git/workspace
    file_path: Optional[str] = None  # Path to notebook or script if source_type is Git
    dynamic_artifact: Optional[bool] = True  # Whether to auto-fetch artifact
    cluster_name: Optional[str] = None  # Name of the cluster definition
    cluster_id: Optional[str] = None  # Cluster ID of existing all purpose cluster
    cluster_type: str  # Cluster type: job, basic
    dependent_libraries: Optional[str] = None  # Comma separated string of libraries
    input_parameters: Optional[dict] = {}  # Parameters passed to task
    ha_config: HAConfig = HAConfig() # High availability settings
    packages: Optional[List[Package]] = []  # Package/library references


class TaskConfigV3(BaseModel):
    """Union type for task configuration - can be either pelican_config or darwin_config"""
    
    @root_validator(pre=True)
    def validate_config(cls, values):
        # This will be handled by the specific task type validation
        return values


class TaskV3(BaseModel):
    """V3 Task Request model with proper separation of Pelican and Darwin configs"""
    task_name: str  # Unique name of the task
    task_type: Literal["pelican", "darwin"]  # Type of task to execute
    task_config: Union[PelicanConfig, DarwinConfig]  # Type-specific config block
    retries: Optional[int] = 1  # Number of retry attempts on failure
    timeout: Optional[int] = 7200  # Maximum execution duration in seconds
    depends_on: Optional[List[str]] = []  # List of task names that must complete first
    pool: Optional[str] = "default"  # Execution pool for task queuing
    
    @root_validator(pre=True)
    def validate_task_config(cls, values):
        task_type = values.get('task_type')
        task_config = values.get('task_config')
        
        if not task_config:
            return values
            
        if task_type == 'pelican':
            if not isinstance(task_config, PelicanConfig):
                values['task_config'] = PelicanConfig(**task_config)
        elif task_type == 'darwin':
            if not isinstance(task_config, DarwinConfig):
                values['task_config'] = DarwinConfig(**task_config)
            
        return values
    
    @validator('task_name')
    def validate_task_name(cls, value):
        return validate_name(value, "task name")

    @validator('retries', 'timeout', pre=True)
    def validate_integers(cls, value, field):
        if value is None:
            return 1 if field.name == 'retries' else 7200  # Default values
        try:
            val = int(value)
            if val < 0:
                raise ValueError
            return val
        except (ValueError, TypeError):
            raise ValueError(f"{field.name} must be a non-negative integer")
