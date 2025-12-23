import pytest
from datetime import datetime, timedelta
from pydantic import ValidationError

from workflow_model.v3.request import CreateWorkflowRequestV3, UpdateWorkflowRequestV3
from workflow_model.v3.task import TaskV3, PelicanConfig, DarwinConfig, PelicanArtifact


class TestCreateWorkflowRequestV3:
    """Test cases for CreateWorkflowRequestV3 validation"""

    def test_valid_create_workflow_request(self):
        """Test valid CreateWorkflowRequestV3 creation"""
        request = CreateWorkflowRequestV3(
            workflow_name="test_workflow",
            display_name="Test Workflow",
            description="Test workflow with args",
            tags=["test", "v3"],
            schedule="0 0 * * *",
            retries=2,
            notify_on="failure",
            max_concurrent_runs=3,
            start_date="2025-01-01T00:00:00",
            end_date="2025-12-31T23:59:59",
            expected_run_duration=1800,
            queue_enabled=True,
            tenant="d11",
            timezone="UTC",
            tasks=[
                TaskV3(
                    task_name="pelican_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/test.jar",
                            class_name="org.example.TestClass",
                            spark_version="3.5.0",
                            args=["10", "20"]
                        )
                    )
                )
            ]
        )
        
        assert request.workflow_name == "test_workflow"
        assert request.display_name == "Test Workflow"
        assert request.description == "Test workflow with args"
        assert request.schedule == "0 0 * * *"
        assert request.retries == 2
        assert request.notify_on == "failure"
        assert request.max_concurrent_runs == 3
        assert request.tags == ["test", "v3"]
        assert request.start_date == "2025-01-01T00:00:00"
        assert request.end_date == "2025-12-31T23:59:59"
        assert request.expected_run_duration == 1800
        assert request.queue_enabled is True
        assert request.tenant == "d11"
        assert request.timezone == "UTC"
        assert len(request.tasks) == 1
        assert request.tasks[0].task_name == "pelican_task"

    def test_create_workflow_request_minimal(self):
        """Test CreateWorkflowRequestV3 with minimal required fields"""
        request = CreateWorkflowRequestV3(
            workflow_name="test_workflow",
            description="Test workflow",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[]
        )
        
        assert request.workflow_name == "test_workflow"
        assert request.description == "Test workflow"
        assert request.schedule == "0 0 * * *"
        assert request.retries == 1
        assert request.notify_on == "failure"
        assert request.max_concurrent_runs == 1
        assert request.tags == ["test"]
        assert request.tasks == []
        assert request.display_name == ""  # Default value
        assert request.tenant == "d11"  # Default value
        assert request.timezone == "UTC"  # Default value
        assert request.queue_enabled is False  # Default value

    def test_create_workflow_request_missing_required_fields(self):
        """Test CreateWorkflowRequestV3 validation with missing required fields"""
        # Missing workflow_name
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "workflow_name" in str(exc_info.value)

        # Missing description
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "description" in str(exc_info.value)

        # Missing tags
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "tags" in str(exc_info.value)

        # Missing schedule
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "schedule" in str(exc_info.value)

        # Missing retries
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "retries" in str(exc_info.value)

        # Missing notify_on
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "notify_on" in str(exc_info.value)

        # Missing max_concurrent_runs
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                tasks=[]
            )
        assert "max_concurrent_runs" in str(exc_info.value)

        # Missing tasks
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1
            )
        assert "tasks" in str(exc_info.value)

    def test_create_workflow_request_invalid_workflow_name(self):
        """Test CreateWorkflowRequestV3 validation with invalid workflow name"""
        # Empty workflow name
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "workflow_name" in str(exc_info.value)

        # Invalid characters in workflow name
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="invalid name with spaces",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "workflow_name" in str(exc_info.value)

    def test_create_workflow_request_invalid_schedule(self):
        """Test CreateWorkflowRequestV3 validation with invalid schedule"""
        # Invalid cron expression
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="invalid_cron",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "schedule" in str(exc_info.value)

    def test_create_workflow_request_invalid_retries(self):
        """Test CreateWorkflowRequestV3 validation with invalid retries"""
        # Negative retries
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=-1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[]
            )
        assert "retries" in str(exc_info.value)

    def test_create_workflow_request_invalid_max_concurrent_runs(self):
        """Test CreateWorkflowRequestV3 validation with invalid max_concurrent_runs"""
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=-1,
                tasks=[]
            )
        assert "max_concurrent_runs" in str(exc_info.value)

    def test_create_workflow_request_invalid_dates(self):
        """Test CreateWorkflowRequestV3 validation with invalid dates"""
        # Invalid start_date format
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                start_date="invalid_date",
                tasks=[]
            )
        assert "start_date" in str(exc_info.value)

        # Invalid end_date format
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                end_date="invalid_date",
                tasks=[]
            )
        assert "end_date" in str(exc_info.value)

    def test_create_workflow_request_invalid_timezone(self):
        """Test CreateWorkflowRequestV3 validation with invalid timezone"""
        # Invalid timezone
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                timezone="INVALID",
                tasks=[]
            )
        assert "timezone" in str(exc_info.value)

    def test_create_workflow_request_past_end_date(self):
        """Test CreateWorkflowRequestV3 validation with past end date"""
        # Past end date
        past_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                end_date=past_date,
                tasks=[]
            )
        assert "End date has passed" in str(exc_info.value)

    def test_create_workflow_request_future_end_date(self):
        """Test CreateWorkflowRequestV3 validation with future end date"""
        # Future end date - should pass validation
        future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")
        request = CreateWorkflowRequestV3(
            workflow_name="test_workflow",
            description="Test workflow",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            end_date=future_date,
            tasks=[]
        )
        assert request.end_date == future_date

    def test_create_workflow_request_no_end_date(self):
        """Test CreateWorkflowRequestV3 validation with no end date"""
        # No end date - should pass validation
        request = CreateWorkflowRequestV3(
            workflow_name="test_workflow",
            description="Test workflow",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[]
        )
        assert request.end_date is None

    def test_create_workflow_request_with_tasks_validation(self):
        """Test CreateWorkflowRequestV3 validation with tasks"""
        # Tasks with invalid task types
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[
                    TaskV3(
                        task_name="invalid_task",
                        task_type="invalid_type",
                        task_config={}
                    )
                ]
            )
        assert "task_type" in str(exc_info.value)

    def test_create_workflow_request_duplicate_task_names(self):
        """Test CreateWorkflowRequestV3 validation with duplicate task names"""
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[
                    TaskV3(
                        task_name="duplicate_task",
                        task_type="pelican",
                        task_config=PelicanConfig(
                            artifact=PelicanArtifact(
                                file="s3://bucket/test1.jar",
                                class_name="org.example.TestClass1",
                                spark_version="3.5.0"
                            )
                        )
                    ),
                    TaskV3(
                        task_name="duplicate_task",  # Duplicate name
                        task_type="pelican",
                        task_config=PelicanConfig(
                            artifact=PelicanArtifact(
                                file="s3://bucket/test2.jar",
                                class_name="org.example.TestClass2",
                                spark_version="3.5.0"
                            )
                        )
                    )
                ]
            )
        assert "duplicate" in str(exc_info.value).lower()

    def test_create_workflow_request_invalid_dependencies(self):
        """Test CreateWorkflowRequestV3 validation with invalid dependencies"""
        with pytest.raises(ValidationError) as exc_info:
            CreateWorkflowRequestV3(
                workflow_name="test_workflow",
                description="Test workflow",
                tags=["test"],
                schedule="0 0 * * *",
                retries=1,
                notify_on="failure",
                max_concurrent_runs=1,
                tasks=[
                    TaskV3(
                        task_name="task1",
                        task_type="pelican",
                        task_config=PelicanConfig(
                            artifact=PelicanArtifact(
                                file="s3://bucket/test.jar",
                                class_name="org.example.TestClass",
                                spark_version="3.5.0"
                            )
                        )
                    ),
                    TaskV3(
                        task_name="task2",
                        task_type="pelican",
                        task_config=PelicanConfig(
                            artifact=PelicanArtifact(
                                file="s3://bucket/test.jar",
                                class_name="org.example.TestClass",
                                spark_version="3.5.0"
                            )
                        ),
                        depends_on=["nonexistent_task"]  # Invalid dependency
                    )
                ]
            )
        assert "dependencies" in str(exc_info.value).lower()

    def test_create_workflow_request_default_values(self):
        """Test CreateWorkflowRequestV3 default values"""
        request = CreateWorkflowRequestV3(
            workflow_name="test_workflow",
            description="Test workflow",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[]
        )
        
        assert request.display_name == ""  # Default value
        assert request.tenant == "d11"  # Default value
        assert request.timezone == "UTC"  # Default value
        assert request.queue_enabled is False  # Default value
        assert request.parameters == {}  # Default value
        assert request.callback_urls == []  # Default value
        assert request.event_types == []  # Default value
        assert request.workflow_status == "active"  # Default value


class TestUpdateWorkflowRequestV3:
    """Test cases for UpdateWorkflowRequestV3 validation"""

    def test_valid_update_workflow_request(self):
        """Test valid UpdateWorkflowRequestV3 creation"""
        request = UpdateWorkflowRequestV3(
            workflow_name="updated_workflow",
            display_name="Updated Workflow",
            description="Updated workflow description",
            tags=["updated", "v3"],
            schedule="0 0 * * *",
            retries=3,
            notify_on="success",
            max_concurrent_runs=5,
            workflow_status="active",
            start_date="2025-02-01T00:00:00",
            end_date="2025-11-30T23:59:59",
            expected_run_duration=3600,
            queue_enabled=False,
            tenant="d12",
            timezone="UTC",
            tasks=[
                TaskV3(
                    task_name="updated_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/updated.jar",
                            class_name="org.example.UpdatedClass",
                            spark_version="3.5.0",
                            args=["updated_arg"]
                        )
                    )
                )
            ]
        )
        
        assert request.workflow_name == "updated_workflow"
        assert request.display_name == "Updated Workflow"
        assert request.description == "Updated workflow description"
        assert request.schedule == "0 0 * * *"
        assert request.retries == 3
        assert request.notify_on == "success"
        assert request.max_concurrent_runs == 5
        assert request.workflow_status == "active"
        assert request.tags == ["updated", "v3"]
        assert request.start_date == "2025-02-01T00:00:00"
        assert request.end_date == "2025-11-30T23:59:59"
        assert request.expected_run_duration == 3600
        assert request.queue_enabled is False
        assert request.tenant == "d12"
        assert request.timezone == "UTC"
        assert len(request.tasks) == 1
        assert request.tasks[0].task_name == "updated_task"

    def test_update_workflow_request_partial_update(self):
        """Test UpdateWorkflowRequestV3 with partial fields"""
        request = UpdateWorkflowRequestV3(
            workflow_name="updated_workflow",
            description="Updated description"
            # Other fields are optional for updates
        )
        
        assert request.workflow_name == "updated_workflow"
        assert request.description == "Updated description"
        assert request.display_name == ""  # Default value
        assert request.schedule == ""  # Default value
        assert request.retries == 0  # Default value
        assert request.notify_on == ""  # Default value
        assert request.max_concurrent_runs == 0  # Default value
        assert request.workflow_status == ""  # Default value
        assert request.tags == []  # Default value
        assert request.start_date is None  # Default value
        assert request.end_date is None  # Default value
        assert request.tasks == []  # Default value

    def test_update_workflow_request_invalid_workflow_name(self):
        """Test UpdateWorkflowRequestV3 validation with invalid workflow name"""
        # Empty workflow name
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name=""
            )
        assert "workflow_name" in str(exc_info.value)

        # Invalid characters in workflow name
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="invalid name with spaces"
            )
        assert "workflow_name" in str(exc_info.value)

    def test_update_workflow_request_invalid_schedule(self):
        """Test UpdateWorkflowRequestV3 validation with invalid schedule"""
        # Invalid cron expression
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                schedule="invalid_cron"
            )
        assert "schedule" in str(exc_info.value)

    def test_update_workflow_request_invalid_retries(self):
        """Test UpdateWorkflowRequestV3 validation with invalid retries"""
        # Negative retries
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                retries=-1
            )
        assert "retries" in str(exc_info.value)

    def test_update_workflow_request_invalid_max_concurrent_runs(self):
        """Test UpdateWorkflowRequestV3 validation with invalid max_concurrent_runs"""
        # Zero max_concurrent_runs
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                max_concurrent_runs=0
            )
        assert "max_concurrent_runs" in str(exc_info.value)

    def test_update_workflow_request_invalid_notify_on(self):
        """Test UpdateWorkflowRequestV3 validation with invalid notify_on"""
        # Invalid notify_on value
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                notify_on="invalid_value"
            )
        assert "notify_on" in str(exc_info.value)

    def test_update_workflow_request_invalid_workflow_status(self):
        """Test UpdateWorkflowRequestV3 validation with invalid workflow_status"""
        # Invalid workflow_status value
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                workflow_status="invalid_status"
            )
        assert "workflow_status" in str(exc_info.value)

    def test_update_workflow_request_invalid_dates(self):
        """Test UpdateWorkflowRequestV3 validation with invalid dates"""
        # Invalid start_date format
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                start_date="invalid_date"
            )
        assert "start_date" in str(exc_info.value)

    def test_update_workflow_request_invalid_timezone(self):
        """Test UpdateWorkflowRequestV3 validation with invalid timezone"""
        # Invalid timezone
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                timezone="INVALID"
            )
        assert "timezone" in str(exc_info.value)

    def test_update_workflow_request_past_end_date(self):
        """Test UpdateWorkflowRequestV3 validation with past end date"""
        # Past end date
        past_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                end_date=past_date
            )
        assert "End date has passed" in str(exc_info.value)

    def test_update_workflow_request_future_end_date(self):
        """Test UpdateWorkflowRequestV3 validation with future end date"""
        # Future end date - should pass validation
        future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S")
        request = UpdateWorkflowRequestV3(
            workflow_name="test_workflow",
            end_date=future_date
        )
        assert request.end_date == future_date

    def test_update_workflow_request_no_end_date(self):
        """Test UpdateWorkflowRequestV3 validation with no end date"""
        # No end date - should pass validation
        request = UpdateWorkflowRequestV3(
            workflow_name="test_workflow"
        )
        assert request.end_date is None

    def test_update_workflow_request_with_tasks_validation(self):
        """Test UpdateWorkflowRequestV3 validation with tasks"""
        # Tasks with invalid task types
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                tasks=[
                    TaskV3(
                        task_name="invalid_task",
                        task_type="invalid_type",
                        task_config={}
                    )
                ]
            )
        assert "task_type" in str(exc_info.value)

    def test_update_workflow_request_duplicate_task_names(self):
        """Test UpdateWorkflowRequestV3 validation with duplicate task names"""
        with pytest.raises(ValidationError) as exc_info:
            UpdateWorkflowRequestV3(
                workflow_name="test_workflow",
                tasks=[
                    TaskV3(
                        task_name="duplicate_task",
                        task_type="pelican",
                        task_config=PelicanConfig(
                            artifact=PelicanArtifact(
                                file="s3://bucket/test1.jar",
                                class_name="org.example.TestClass1",
                                spark_version="3.5.0"
                            )
                        )
                    ),
                    TaskV3(
                        task_name="duplicate_task",  # Duplicate name
                        task_type="pelican",
                        task_config=PelicanConfig(
                            artifact=PelicanArtifact(
                                file="s3://bucket/test2.jar",
                                class_name="org.example.TestClass2",
                                spark_version="3.5.0"
                            )
                        )
                    )
                ]
            )
        assert "duplicate" in str(exc_info.value).lower()

    def test_update_workflow_request_default_values(self):
        """Test UpdateWorkflowRequestV3 default values"""
        request = UpdateWorkflowRequestV3(
            workflow_name="test_workflow"
        )
        
        assert request.display_name == ""  # Default value
        assert request.description == ""  # Default value
        assert request.tags == []  # Default value
        assert request.schedule == ""  # Default value
        assert request.retries == 0  # Default value
        assert request.notify_on == ""  # Default value
        assert request.max_concurrent_runs == 0  # Default value
        assert request.workflow_status == ""  # Default value
        assert request.tenant == "d11"  # Default value
        assert request.timezone == "UTC"  # Default value
        assert request.queue_enabled is False  # Default value
        assert request.parameters == {}  # Default value
        assert request.callback_urls == []  # Default value
        assert request.event_types == []  # Default value 