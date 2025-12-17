import unittest
from unittest.mock import MagicMock, patch

from workflow_core.constants.constants import JOB_CLUSTER, BASIC_CLUSTER
from workflow_core.error.errors import InvalidWorkflowException
from workflow_model.workflow import WorkflowTaskRequest
from workflow_core.utils.validation_utils import (
    _is_valid_name,
    is_valid_cluster_type,
    is_valid_cluster_id,
    is_valid_git_source,
    is_valid_entry_point,
    validate_workflow,
)
from workflow_model.utils.validators import is_valid_timetable


class TestWorkflowValidation(unittest.TestCase):
    def test_is_valid_name(self):
        self.assertTrue(_is_valid_name("valid_name"))
        self.assertTrue(_is_valid_name("valid-name"))
        self.assertTrue(_is_valid_name("valid_name.123"))
        self.assertFalse(_is_valid_name("invalid$name"))
        self.assertFalse(_is_valid_name("invalid name"))

    def test_is_valid_timetable(self):
        self.assertTrue(is_valid_timetable("* * * * *"))
        self.assertTrue(is_valid_timetable("0 * * * *"))
        self.assertFalse(is_valid_timetable("0 * * * *???"))
        self.assertFalse(is_valid_timetable("not a cron expression"))

    def test_is_valid_cluster_type(self):
        self.assertTrue(is_valid_cluster_type("job"))
        self.assertTrue(is_valid_cluster_type("basic"))
        self.assertFalse(is_valid_cluster_type("invalid_cluster"))

    @patch("workflow_core.utils.validation_utils.is_valid_job_cluster_definition")
    def test_valid_job_cluster(self, mock_is_valid_job_cluster):
        cluster_type = JOB_CLUSTER
        cluster_id = "job-123"
        compute_utils = MagicMock()

        mock_is_valid_job_cluster.return_value = True

        self.assertTrue(is_valid_cluster_id(cluster_type, cluster_id, compute_utils))

        # Assert that compute_utils.get_cluster_details is not called
        compute_utils.get_cluster_details.assert_not_called()
        mock_is_valid_job_cluster.assert_called_once_with(cluster_id)

    def test_valid_basic_cluster(self):
        cluster_type = BASIC_CLUSTER
        cluster_id = "id-123"
        compute_utils = MagicMock()
        compute_utils.get_cluster_details.return_value = {
            "status": "SUCCESS",
            "data": {},
        }
        self.assertTrue(is_valid_cluster_id(cluster_type, cluster_id, compute_utils))

    def test_invalid_basic_cluster(self):
        cluster_type = BASIC_CLUSTER
        cluster_id = "unknown123"
        compute_utils = MagicMock()
        compute_utils.get_cluster_details.return_value = {"status": "ERROR", "data": {}}
        self.assertFalse(is_valid_cluster_id(cluster_type, cluster_id, compute_utils))

    @patch("workflow_core.utils.validation_utils.is_valid_job_cluster_definition")
    def test_invalid_job_cluster(self, mock_is_valid_job_cluster):
        cluster_type = JOB_CLUSTER
        cluster_id = "unknown123"
        compute_utils = MagicMock()
        mock_is_valid_job_cluster.return_value = False
        self.assertFalse(is_valid_cluster_id(cluster_type, cluster_id, compute_utils))

    def test_is_valid_git_source(self):
        valid_task_id = MagicMock(source="https://github.com/example/repo")
        self.assertTrue(is_valid_git_source(valid_task_id))
        invalid_task_id = MagicMock(source="invalid_task_id")
        self.assertFalse(is_valid_git_source(invalid_task_id))

    def test_is_valid_entry_point(self):
        with unittest.mock.patch("os.path.isfile", return_value=True):
            result = is_valid_entry_point("example.py", "workspace")
            self.assertTrue(result)
        with unittest.mock.patch("os.path.isfile", return_value=True):
            result = is_valid_entry_point("example.ipynb", "workspace")
            self.assertTrue(result)
        with unittest.mock.patch("os.path.isfile", return_value=True):
            result = is_valid_entry_point("example.txt", "workspace")
            self.assertFalse(result)
        with unittest.mock.patch("os.path.isfile", return_value=False):
            result = is_valid_entry_point("invalid_file.py", "workspace")
            self.assertFalse(result)

    @patch("workflow_core.utils.validation_utils._is_valid_name")
    def test_invalid_workflow_name(self, mock_is_valid_name):
        mock_is_valid_name.return_value = False
        request = MagicMock()
        request.workflow_name = "invalid_name"

        with self.assertRaises(InvalidWorkflowException):
            validate_workflow(request)

    @patch("workflow_core.utils.validation_utils.is_valid_timetable")
    def test_invalid_timetable(self, mock_is_valid_timetable):
        mock_is_valid_timetable.return_value = False
        request = MagicMock()
        request.workflow_name = "valid_workflow"
        request.display_name = "valid_workflow"
        request.schedule = "invalid_cron_expression"

        with self.assertRaises(InvalidWorkflowException):
            validate_workflow(request)

    @patch("workflow_core.utils.validation_utils.is_valid_cluster_id")
    def test_invalid_cluster_id(self, mock_is_valid_cluster_id):
        mock_is_valid_cluster_id.return_value = False
        request = MagicMock()
        request.workflow_name = "valid_workflow"
        request.display_name = "valid_workflow"
        request.schedule = "* * * * *"
        request.tasks = [
            WorkflowTaskRequest(
                task_name="task1",
                cluster_type="basic",
                cluster_id="invalid_id",
                depends_on=[],
                source="source",
                source_type="source_type",
                file_path="entry_point",
                dynamic_artifact=False,
                dependent_libraries="",
                input_parameters={},
                retries=0,
                timeout=0,
            )
        ]

        with self.assertRaises(InvalidWorkflowException):
            validate_workflow(request)

    @patch("workflow_core.utils.validation_utils.is_valid_cluster_id")
    def test_invalid_dependencies(self, mock_is_valid_cluster_id):
        mock_is_valid_cluster_id.return_value = True
        request = MagicMock()
        request.workflow_name = "valid_workflow"
        request.display_name = "valid_workflow"
        request.schedule = "* * * * *"
        request.tasks = [
            WorkflowTaskRequest(
                task_name="task1",
                cluster_type="basic",
                cluster_id="valid_id",
                depends_on=["task2"],
                source="source",
                source_type="source_type",
                file_path="entry_point",
                dynamic_artifact=False,
                dependent_libraries="",
                input_parameters={},
                retries=0,
                timeout=0,
            )
        ]

        with self.assertRaises(InvalidWorkflowException):
            validate_workflow(request)

    @patch("workflow_core.utils.validation_utils.is_valid_cluster_id")
    @patch("workflow_core.utils.validation_utils.is_valid_src_code_path")
    def test_invalid_src_code_path(
        self, mock_is_valid_src_code_path, mock_is_valid_cluster_id
    ):
        mock_is_valid_cluster_id.return_value = True
        mock_is_valid_src_code_path.return_value = False
        request = MagicMock()
        request.workflow_name = "valid_workflow"
        request.display_name = "valid_workflow"
        request.schedule = "* * * * *"
        request.tasks = [
            WorkflowTaskRequest(
                task_name="task1",
                cluster_type="basic",
                cluster_id="valid_id",
                depends_on=[],
                source="source",
                source_type="workspace",
                file_path="entry_point",
                dynamic_artifact=False,
                dependent_libraries="",
                input_parameters={},
                retries=0,
                timeout=0,
            )
        ]

        with self.assertRaises(InvalidWorkflowException):
            validate_workflow(request)

    @patch("workflow_core.utils.validation_utils.is_valid_cluster_id")
    @patch("workflow_core.utils.validation_utils.is_valid_entry_point")
    @patch("workflow_core.utils.validation_utils.is_valid_src_code_path")
    def test_invalid_entry_point(
        self,
        mock_is_valid_src_code_path,
        mock_is_valid_entry_point,
        mock_is_valid_cluster_id,
    ):
        mock_is_valid_cluster_id.return_value = True
        mock_is_valid_src_code_path.return_value = True
        mock_is_valid_entry_point.return_value = False
        request = MagicMock()
        request.workflow_name = "valid_workflow"
        request.display_name = "valid_workflow"
        request.schedule = "* * * * *"
        request.tasks = [
            WorkflowTaskRequest(
                task_name="task1",
                cluster_type="basic",
                cluster_id="valid_id",
                depends_on=[],
                source="source",
                source_type="workspace",
                file_path="entry_point",
                dynamic_artifact=False,
                dependent_libraries="",
                input_parameters={},
                retries=0,
                timeout=0,
            )
        ]

        with self.assertRaises(InvalidWorkflowException):
            validate_workflow(request)


if __name__ == "__main__":
    unittest.main()