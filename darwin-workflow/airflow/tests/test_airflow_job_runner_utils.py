import pytest
from unittest.mock import patch, MagicMock

# Mock Airflow Variables before importing any modules that use them
with patch('airflow.models.Variable.get') as mock_get:
    mock_get.return_value = "test_value"
    from airflow.models import Variable
    from airflow_core.constants.constants import WORKSPACE, FSX_BASE_PATH_DYNAMIC_TRUE
    from airflow_core.utils.airflow_job_runner_utils import get_updated_entry_point_cmd


@pytest.fixture
def common_params():
    """Fixture providing common test parameters"""
    return {
        "try_number": 1,
        "source": "/test/source",
        "dynamic_artifact": "test_artifact",
        "file_path": "/path/to/notebook.ipynb"
    }


def test_papermill_command_with_dynamic_artifact(common_params):
    """Test papermill command with dynamic artifact and workspace source type"""
    entry_point_cmd = "papermill /path/to/notebook.ipynb"
    source_type = WORKSPACE

    expected_cmd = (
        f"papermill /path/to/notebook/try_{common_params['try_number']}.ipynb "
        f"--cwd {FSX_BASE_PATH_DYNAMIC_TRUE}{common_params['source']}/path/to "
        f"-k python3"
    )

    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=common_params["dynamic_artifact"],
        source_type=source_type,
        source=common_params["source"],
        file_path=common_params["file_path"],
        try_number=common_params["try_number"]
    )

    assert result == expected_cmd


def test_papermill_command_without_dynamic_artifact(common_params):
    """Test papermill command without dynamic artifact"""
    entry_point_cmd = "papermill /path/to/notebook.ipynb"
    source_type = WORKSPACE
    dynamic_artifact = ""

    expected_cmd = (
        f"papermill /path/to/notebook/try_{common_params['try_number']}.ipynb "
        f"--cwd /path/to "
        f"-k python3"
    )

    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=dynamic_artifact,
        source_type=source_type,
        source=common_params["source"],
        file_path=common_params["file_path"],
        try_number=common_params["try_number"]
    )

    assert result == expected_cmd


def test_papermill_command_with_different_source_type(common_params):
    """Test papermill command with non-WORKSPACE source type"""
    entry_point_cmd = "papermill /path/to/notebook.ipynb"
    source_type = "GIT"

    expected_cmd = (
        f"papermill /path/to/notebook/try_{common_params['try_number']}.ipynb "
        f"--cwd /path/to "
        f"-k python3"
    )

    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=common_params["dynamic_artifact"],
        source_type=source_type,
        source=common_params["source"],
        file_path=common_params["file_path"],
        try_number=common_params["try_number"]
    )

    assert result == expected_cmd


def test_non_papermill_command(common_params):
    """Test non-papermill command"""
    entry_point_cmd = "python script.py"
    source_type = WORKSPACE

    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=common_params["dynamic_artifact"],
        source_type=source_type,
        source=common_params["source"],
        file_path=common_params["file_path"],
        try_number=common_params["try_number"]
    )

    assert result == entry_point_cmd


def test_papermill_command_with_multiple_path_segments(common_params):
    """Test papermill command with complex path structure"""
    entry_point_cmd = "papermill /complex/path/structure/notebook.ipynb"
    source_type = WORKSPACE
    file_path = "/complex/path/structure/notebook.ipynb"

    expected_cmd = (
        f"papermill /complex/path/structure/notebook/try_{common_params['try_number']}.ipynb "
        f"--cwd {FSX_BASE_PATH_DYNAMIC_TRUE}{common_params['source']}/complex/path/structure "
        f"-k python3"
    )

    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=common_params["dynamic_artifact"],
        source_type=source_type,
        source=common_params["source"],
        file_path=file_path,
        try_number=common_params["try_number"]
    )

    assert result == expected_cmd


def test_papermill_command_with_spaces(common_params):
    """Test papermill command with spaces in path"""
    entry_point_cmd = "papermill /path with spaces/notebook.ipynb"
    source_type = WORKSPACE
    file_path = "/path with spaces/notebook.ipynb"

    expected_cmd = (
        f"papermill /path with spaces/notebook/try_{common_params['try_number']}.ipynb "
        f"--cwd {FSX_BASE_PATH_DYNAMIC_TRUE}{common_params['source']}/path with spaces "
        f"-k python3"
    )

    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=common_params["dynamic_artifact"],
        source_type=source_type,
        source=common_params["source"],
        file_path=file_path,
        try_number=common_params["try_number"]
    )

    assert result == expected_cmd


def test_papermill_command_with_trailing_spaces(common_params):
    """Test papermill command with trailing spaces"""
    entry_point_cmd = "papermill /path/to/notebook.ipynb  "
    source_type = WORKSPACE

    expected_cmd = (
        f"papermill /path/to/notebook/try_{common_params['try_number']}.ipynb "
        f"--cwd {FSX_BASE_PATH_DYNAMIC_TRUE}{common_params['source']}/path/to "
        f"-k python3"
    )

    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=common_params["dynamic_artifact"],
        source_type=source_type,
        source=common_params["source"],
        file_path=common_params["file_path"],
        try_number=common_params["try_number"]
    )

    assert result == expected_cmd


def test_empty_entry_point_cmd(common_params):
    """Test with empty entry point command"""
    entry_point_cmd = ""
    source_type = WORKSPACE

    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=common_params["dynamic_artifact"],
        source_type=source_type,
        source=common_params["source"],
        file_path=common_params["file_path"],
        try_number=common_params["try_number"]
    )

    assert result == ""


@pytest.mark.parametrize("entry_point_cmd,file_path,source_type,expected_suffix", [
    (
        "papermill /path/to/notebook.ipynb",
        "/path/to/notebook.ipynb",
        WORKSPACE,
        f"{FSX_BASE_PATH_DYNAMIC_TRUE}/test/source/path/to"
    ),
    (
        "papermill /path/to/notebook.ipynb",
        "/path/to/notebook.ipynb",
        "GIT",
        "/path/to"
    ),
    (
        "python script.py",
        "/path/to/script.py",
        WORKSPACE,
        "script.py"
    ),
])
def test_parameterized_entry_point_cmd(common_params, entry_point_cmd, file_path, source_type, expected_suffix):
    """Test get_updated_entry_point_cmd with different parameter combinations"""
    result = get_updated_entry_point_cmd(
        entry_point_cmd=entry_point_cmd,
        dynamic_artifact=common_params["dynamic_artifact"],
        source_type=source_type,
        source=common_params["source"],
        file_path=file_path,
        try_number=common_params["try_number"]
    )

    if entry_point_cmd.startswith("papermill"):
        assert f"try_{common_params['try_number']}.ipynb" in result
        assert expected_suffix in result
        assert "-k python3" in result
    else:
        assert result == entry_point_cmd 