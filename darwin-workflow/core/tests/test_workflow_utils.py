import os
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch, Mock

from workflow_core.constants.constants import GIT
from workflow_core.utils.workflow_utils import (
    extract_libraries_as_string,
    create_modified_entry_point,
    wait_for_api_success,
    github_repo_to_zip_link,
    update_cluster_details_in_workflow,
    get_all_output_notebooks,
    get_job_submit_details,
    get_params_value,
    is_run_id_required,
    get_date,
)


class TestWorkflowUtils(unittest.TestCase):
    def test_extract_libraries_as_string(self):
        self.assertEqual(
            extract_libraries_as_string({"pip": ["pandas", "scikit-learn"]}),
            "pandas,scikit-learn",
        )
        self.assertEqual(extract_libraries_as_string({"pip": ["pandas"]}), "pandas")
        self.assertEqual(extract_libraries_as_string({"pip": []}), "")

    @patch("workflow_core.constants.configs.Config")
    def test_modify_ipynb_entry_point(self, mock_config):
        """Tests modifying an entry point for a Jupyter Notebook."""
        entry_point = "my_notebook.ipynb"
        task_id = "test_task"
        env = "dev"
        dag_id = "my_dag"

        mock_config.return_value.get_airflow_s3_folder = "airflow_s3_folder"
        mock_config.return_value.get_s3_bucket = "your_s3_bucket"

        expected_entry_point = f"papermill {entry_point} s3://darwin-workflow-staging/darwin_workflow/airflow_artifacts/output_notebooks/{dag_id}/test_task.ipynb"
        expected_task_type = "notebook"

        result_entry_point, result_task_type = create_modified_entry_point(
            entry_point, task_id, env, dag_id
        )

        self.assertEqual(expected_entry_point, result_entry_point)
        self.assertEqual(expected_task_type, result_task_type)

    def test_modify_python_script(self):
        """Tests modifying an entry point for a Python script."""
        entry_point = "my_script.py"
        task_id = "another_task"

        expected_entry_point = f"ipython {entry_point}"
        expected_task_type = "script"

        result_entry_point, result_task_type = create_modified_entry_point(
            entry_point, task_id
        )

        self.assertEqual(expected_entry_point, result_entry_point)
        self.assertEqual(expected_task_type, result_task_type)

    @patch("workflow_core.utils.workflow_utils.is_valid_dag_id")
    def test_successful_wait(self, mock_is_valid):
        """Tests successful waiting for API response (mocked)."""
        dag_id = "my_dag"
        env = "dev"
        message = "Waiting for DAG deployment..."
        interval = 1

        mock_is_valid.side_effect = [
            False,
            False,
            True,
        ]  # Simulate initial failures and eventual success

        status = wait_for_api_success(dag_id, env, message, interval)

        # Assertions
        self.assertTrue(status)  # Successful wait
        mock_is_valid.assert_called_with(dag_id, env)

    @patch.object(os, "getenv")
    def test_url_with_git_suffix(self, mock_getenv):
        """Tests URL ending with .git suffix."""
        repo_url1 = "https://github.com/darwin/my-repo.git"
        repo_url2 = "https://github.com/darwin/my-repo/tree/feature-branch"
        repo_url3 = "https://github.com/darwin/my-repo"
        mock_getenv.return_value = "my-secret-token"

        expected_link1 = "https://darwin:my-secret-token@github.com/darwin/my-repo/archive/HEAD.zip"
        expected_link2 = "https://darwin:my-secret-token@github.com/darwin/my-repo/archive/refs/heads/feature-branch.zip"
        expected_link3 = "https://darwin:my-secret-token@github.com/darwin/my-repo/archive/HEAD.zip"

        result1 = github_repo_to_zip_link(repo_url1)
        result2 = github_repo_to_zip_link(repo_url2)
        result3 = github_repo_to_zip_link(repo_url3)

        self.assertEqual(result1, expected_link1)
        self.assertEqual(result2, expected_link2)
        self.assertEqual(result3, expected_link3)

    @patch.object(os, "getenv")
    def test_url_with_ds_fancode_organization(self, mock_getenv):
        """Tests URL with ds-fancode organization uses GIT_FC_TOKEN."""
        repo_url1 = "https://github.com/ds-fancode/fc-ds-forecast.git"
        repo_url2 = "https://github.com/ds-fancode/fc-ds-forecast/tree/feature-branch"
        repo_url3 = "https://github.com/ds-fancode/fc-ds-forecast"
        repo_url4 = "https://github.com/ds-fancode/another-repo"  # Additional test case
        
        # Mock both tokens
        def mock_getenv_side_effect(key):
            if key == "VAULT_SERVICE_GIT_TOKEN":
                return "darwin-token"
            elif key == "VAULT_SERVICE_GIT_FC_TOKEN":
                return "ds-fancode-token"
            return None
        
        mock_getenv.side_effect = mock_getenv_side_effect

        expected_link1 = "https://ds-fancode:ds-fancode-token@github.com/ds-fancode/fc-ds-forecast/archive/HEAD.zip"
        expected_link2 = "https://ds-fancode:ds-fancode-token@github.com/ds-fancode/fc-ds-forecast/archive/refs/heads/feature-branch.zip"
        expected_link3 = "https://ds-fancode:ds-fancode-token@github.com/ds-fancode/fc-ds-forecast/archive/HEAD.zip"
        expected_link4 = "https://ds-fancode:ds-fancode-token@github.com/ds-fancode/another-repo/archive/HEAD.zip"

        result1 = github_repo_to_zip_link(repo_url1)
        result2 = github_repo_to_zip_link(repo_url2)
        result3 = github_repo_to_zip_link(repo_url3)
        result4 = github_repo_to_zip_link(repo_url4)

        self.assertEqual(result1, expected_link1)
        self.assertEqual(result2, expected_link2)
        self.assertEqual(result3, expected_link3)
        self.assertEqual(result4, expected_link4)

    @patch.object(os, "getenv")
    def test_url_with_darwin_organization(self, mock_getenv):
        """Tests URL with darwin organization uses GIT_TOKEN."""
        repo_url1 = "https://github.com/darwin/darwin-workflow.git"
        repo_url2 = "https://github.com/darwin/darwin-workflow/tree/feature-branch"
        repo_url3 = "https://github.com/darwin/darwin-workflow"
        
        # Mock both tokens
        def mock_getenv_side_effect(key):
            if key == "VAULT_SERVICE_GIT_TOKEN":
                return "darwin-token"
            elif key == "VAULT_SERVICE_GIT_FC_TOKEN":
                return "ds-fancode-token"
            return None
        
        mock_getenv.side_effect = mock_getenv_side_effect

        expected_link1 = "https://darwin:darwin-token@github.com/darwin/darwin-workflow/archive/HEAD.zip"
        expected_link2 = "https://darwin:darwin-token@github.com/darwin/darwin-workflow/archive/refs/heads/feature-branch.zip"
        expected_link3 = "https://darwin:darwin-token@github.com/darwin/darwin-workflow/archive/HEAD.zip"

        result1 = github_repo_to_zip_link(repo_url1)
        result2 = github_repo_to_zip_link(repo_url2)
        result3 = github_repo_to_zip_link(repo_url3)

        self.assertEqual(result1, expected_link1)
        self.assertEqual(result2, expected_link2)
        self.assertEqual(result3, expected_link3)

    @patch.object(os, "getenv")
    def test_url_with_ds_fancode_false_positives(self, mock_getenv):
        """Tests that URLs containing 'ds-fancode' but not in the org position don't match."""
        # These should NOT match ds-fancode pattern
        repo_url1 = "https://github.com/darwin/ds-fancode-integration"  # ds-fancode in repo name
        repo_url2 = "https://github.com/darwin/my-ds-fancode-tool"      # ds-fancode in repo name
        repo_url3 = "https://github.com/darwin/ds-fancode"              # ds-fancode as repo name
        
        # Mock both tokens
        def mock_getenv_side_effect(key):
            if key == "VAULT_SERVICE_GIT_TOKEN":
                return "darwin-token"
            elif key == "VAULT_SERVICE_GIT_FC_TOKEN":
                return "ds-fancode-token"
            return None
        
        mock_getenv.side_effect = mock_getenv_side_effect

        # These should use darwin token, not ds-fancode token
        expected_link1 = "https://darwin:darwin-token@github.com/darwin/ds-fancode-integration/archive/HEAD.zip"
        expected_link2 = "https://darwin:darwin-token@github.com/darwin/my-ds-fancode-tool/archive/HEAD.zip"
        expected_link3 = "https://darwin:darwin-token@github.com/darwin/ds-fancode/archive/HEAD.zip"

        result1 = github_repo_to_zip_link(repo_url1)
        result2 = github_repo_to_zip_link(repo_url2)
        result3 = github_repo_to_zip_link(repo_url3)

        self.assertEqual(result1, expected_link1)
        self.assertEqual(result2, expected_link2)
        self.assertEqual(result3, expected_link3)

    @patch.object(os, "getenv")
    def test_unknown_organization_uses_default_token(self, mock_getenv):
        """Tests that unknown organizations use the default token."""
        repo_url1 = "https://github.com/unknown-org/some-repo"
        repo_url2 = "https://github.com/microsoft/vscode"
        
        # Mock both tokens
        def mock_getenv_side_effect(key):
            if key == "VAULT_SERVICE_GIT_TOKEN":
                return "darwin-token"
            elif key == "VAULT_SERVICE_GIT_FC_TOKEN":
                return "ds-fancode-token"
            return None
        
        mock_getenv.side_effect = mock_getenv_side_effect

        # These should use darwin token (default) for unknown organizations
        expected_link1 = "https://unknown-org:darwin-token@github.com/unknown-org/some-repo/archive/HEAD.zip"
        expected_link2 = "https://microsoft:darwin-token@github.com/microsoft/vscode/archive/HEAD.zip"

        result1 = github_repo_to_zip_link(repo_url1)
        result2 = github_repo_to_zip_link(repo_url2)

        self.assertEqual(result1, expected_link1)
        self.assertEqual(result2, expected_link2)

    @patch("workflow_core.utils.workflow_utils.github_repo_to_zip_link")
    def test_dynamic_artifact_git(self, mock_github_link):
        """Tests dynamic artifact with Git source."""
        dag_id = "my_dag"
        dynamic_artifact = True
        source_type = GIT
        source = "https://github.com/user/repo.git"
        entry_point = "main.py"
        runtime_env = {"pip": []}
        env = "dev"

        mock_github_link.return_value = "zip_link"
        expected_runtime_env = {"pip": ["smart_open"], "working_dir": "zip_link"}

        result_entry_point, result_runtime_env = get_job_submit_details(
            dag_id, dynamic_artifact, source_type, source, entry_point, runtime_env, env
        )

        self.assertEqual(
            entry_point, result_entry_point
        )  # Entry point remains unchanged
        self.assertEqual(expected_runtime_env, result_runtime_env)
        mock_github_link.assert_called_once_with(source)

    def test_ipynb_entry_point_with_string_params(self):
        entry_point = "notebook.ipynb"
        input_params = {"param1": "value1", "param2": "value2"}
        expected_parameters = '-p param1 "value1" -p param2 "value2"'

        result = get_params_value(entry_point, input_params)

        self.assertEqual(result, expected_parameters)

    def test_ipynb_entry_point_with_non_string_params(self):
        entry_point = "notebook.ipynb"
        input_params = {"param1": 10, "param2": True}
        expected_parameters = "-p param1 10 -p param2 True"

        result = get_params_value(entry_point, input_params)

        self.assertEqual(result, expected_parameters)

    def test_non_ipynb_entry_point_with_string_params(self):
        entry_point = "script.py"
        input_params = {"arg1": "value1", "arg2": "value2"}
        expected_parameters = '--arg1 "value1" --arg2 "value2"'

        result = get_params_value(entry_point, input_params)

        self.assertEqual(result, expected_parameters)

    def test_non_ipynb_entry_point_with_non_string_params(self):
        entry_point = "script.py"
        input_params = {"arg1": 42, "arg2": False}
        expected_parameters = "--arg1 42 --arg2 False"

        result = get_params_value(entry_point, input_params)

        self.assertEqual(result, expected_parameters)

    def test_empty_input_params(self):
        entry_point = "script.py"
        input_params = {}
        expected_parameters = ""

        result = get_params_value(entry_point, input_params)

        self.assertEqual(result, expected_parameters)

    @patch("workflow_core.utils.workflow_utils.requests")
    @patch("workflow_core.constants.configs.Config")
    def test_update_cluster_details_success(self, mock_config, mock_requests):
        # Mocking Config class and its method
        mock_config.return_value.get_app_layer.return_value = "mocked_url"

        # Mocking the response object
        mock_response = Mock()
        mock_response.status_code = 200
        mock_requests.request.return_value = mock_response

        # Calling the function
        result = update_cluster_details_in_workflow(
            "dag_id", "job_id", "task_id", "cluster_id", "stag"
        )

        # Assertions
        self.assertEqual(result, mock_response)

    def test_get_date(self):
        """Tests get_date function with various inputs."""

        # Valid date
        input_date = "2024-03-27"
        expected_date = datetime(2024, 3, 27, 0, 0)
        self.assertEqual(get_date(input_date), expected_date)

        # Invalid date format
        invalid_formats = ["invalid_date_format", "2024-02-32"]  # Test multiple formats
        for invalid_date in invalid_formats:
            with self.assertRaises(ValueError):
                get_date(invalid_date)

        # Out-of-range date
        out_of_range_dates = [
            "2024-13-01",
            "2024-02-30",
        ]  # Test different out-of-range cases
        for out_of_range_date in out_of_range_dates:
            with self.assertRaises(ValueError):
                get_date(out_of_range_date)

        # Empty date
        with self.assertRaises(ValueError):
            get_date("")

    @patch("requests.post")
    @patch("requests.get")
    @patch("workflow_core.constants.configs.Config")
    def test_run_id_required_true(self, mock_config, mock_get, mock_post):
        """Tests when run_id_required is True in workflow details."""
        workflow_name = "my_workflow"
        env = "stag"
        mock_config.return_value.get_app_layer.return_value = "app_layer_url"

        mock_workflow_id_response = MagicMock()
        mock_workflow_id_response.status_code = 200
        mock_workflow_id_response.json.return_value = {"workflow_id": "123"}
        mock_post.return_value = mock_workflow_id_response

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "data": {"tasks": [{"input_parameters": {"run_id_required": True}}]}
        }
        mock_get.return_value = mock_response

        result = is_run_id_required(workflow_name, env)

        self.assertTrue(result)

    @patch(
        "workflow_core.artifactory.s3_artifactory.S3Artifactory.get_all_output_notebooks"
    )
    def test_with_output_notebooks(self, mock_get_notebooks):
        """Tests with multiple output notebooks."""
        dag_id = "my_dag"
        run_id = "run123"
        task_id = "task_a"
        mock_get_notebooks.return_value = [
            "output_notebooks/my_dag/task_a/run123/notebook1_123.ipynb",
            "output_notebooks/my_dag/task_a/run123/notebook2_456.ipynb",
        ]

        expected_result = {
            123: "output_notebooks/my_dag/task_a/run123/notebook1_123.ipynb",
            456: "output_notebooks/my_dag/task_a/run123/notebook2_456.ipynb",
        }

        result = get_all_output_notebooks(dag_id, run_id, task_id)

        self.assertEqual(result, expected_result)
        mock_get_notebooks.assert_called_once_with(
            f"output_notebooks/{dag_id}/{task_id}/{run_id}/"
        )