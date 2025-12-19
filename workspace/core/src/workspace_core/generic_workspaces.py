from abc import ABC, abstractmethod
from typing import Optional, List

from typeguard import typechecked

from workspace_core.dto.response import ProjectResponse, CodespaceResponse
from workspace_core.entities.codespace import Codespace
from workspace_core.entities.project import Project


@typechecked
class Workspaces(ABC):
    @abstractmethod
    def list_projects_of_user(self, user_id: str, query_str: Optional[str] = "") -> List[ProjectResponse]:
        """
        Gets list of projects
        :param user_id: id of user
        :param query_str: query search string
        :return: List [ProjectResponse]
        """
        pass

    @abstractmethod
    def list_codespaces(self, project_id: int) -> List[CodespaceResponse]:
        """
        List of codespaces for a project
        :param project_id: id of project to fetch codespaces for
        :return: List [CodespaceResponse]
        """
        pass

    @abstractmethod
    def project_details(self, project_id: int) -> ProjectResponse:
        """
        Gets details of a project
        :param project_id: id of project.
        :return: ProjectResponse
        """
        pass

    @abstractmethod
    def codespace_details(self, codespace_id: int) -> CodespaceResponse:
        """
        Gets details of a codespace
        :param codespace_id: id of codespace.
        :return: CodespaceResponse
        """
        pass

    @abstractmethod
    def get_codespace_from_name(self, codespace_name: str, project_id: int) -> CodespaceResponse:
        """
        Gets details of codespace from name
        :param project_id: id of project to which codespace belongs
        :param codespace_name: name of codespace
        :return: CodespaceResponse
        """
        pass

    @abstractmethod
    def launch_codespace_v2(self, codespace_id: int, user_id: str, cloned_from: Optional[str] = None):
        """
        Creates a jupyter environment in a cluster with codespace
        :param codespace_id: id of codespace to launch
        :param user_id: id of user that launched the codespace
        :param cloned_from: cloned from codespace
        :return: obj
        """
        pass

    @abstractmethod
    def create_project(self, project: Project):
        """
        Creates a new project of the user
        :param project: Project object
        :return: obj
        """
        pass

    @abstractmethod
    def create_codespace(self, codespace: Codespace):
        """
        Creates a new codespace for a project
        :param codespace: Codespace entity
        :return: Codespace
        """
        pass

    @abstractmethod
    def attach_cluster(self, codespace_id: int, cluster_id: str):
        """
        Adds cluster to codespace
        :param codespace_id: id of codespace
        :param cluster_id: id of cluster
        :return: No. of rows updated
        """
        pass

    @abstractmethod
    def detach_cluster_v2(self, codespace_id: int):
        """
        Adds cluster to codespace
        :param codespace_id: id of codespace
        :return: Codespace
        """
        pass

    @abstractmethod
    def launch_imported_project_v2(self, codespace_id: int, github_link: str, user_id: str):
        pass

    @abstractmethod
    def import_project(self, user_id: str, cloned_from: str):
        """
        Import project function
        :param user_id:
        :param cloned_from:
        :return:
        """
        pass

    @abstractmethod
    def check_unique_project_name(self, user_id: str, project_name: str) -> bool:
        """
        Checks if the project name is unique or not
        :param user_id: id of user.
        :param project_name: name of project
        :return: True/False
        """
        pass

    @abstractmethod
    def check_unique_github_link(self, user_id: str, cloned_from: str) -> bool:
        """
        Checks if the imported project is unique or not
        :param user_id: id of user
        :param cloned_from: link used for importing project
        :return: True/False
        """
        pass

    @abstractmethod
    def check_unique_codespace_name(self, project_id: int, codespace_name: str) -> bool:
        """
        Checks if the codespace name is unique or not
        :param project_id: id of project
        :param codespace_name: name of codespace
        :return: True/False
        """
        pass

    @abstractmethod
    def last_selected_codespace(self, user_id: str):
        """
        Get Last Selected codespace by the user
        :param user_id: id of user
        :return:
        """
        pass

    @abstractmethod
    def delete_project_v2(self, project_id: int):
        """
        Delete Project and all its codespaces
        :param project_id: id of project
        :return: SUCCESS/ERROR
        """
        pass

    @abstractmethod
    def delete_codespace_v2(self, codespace_id: int):
        """
        Deletes Codespace from cluster, db and s3
        :param codespace_id: id of codespace
        :return: No. of deleted rows
        """
        pass

    @abstractmethod
    def attached_codespaces_count(self, cluster_id: str) -> int:
        pass

    @abstractmethod
    def list_projects(self, user_id: str, query_str: str, my_projects: bool, sort_by: str):
        """
        Gets list of projects
        :param user_id: id of user
        :param query_str: query search string
        :param my_projects: fetch your projects or other workspaces
        :param sort_by: sort by parameter
        :return: List [Project]
        """
        pass

    @abstractmethod
    def get_playground(self, user_id: str):
        pass

    @abstractmethod
    def edit_codespace_v2(self, codespace_id: int, codespace_name: str, user: str):
        """
        Edits codespace name
        :param codespace_id: id of codespace to edit
        :param codespace_name: new name of codespace
        :param user: user that edited the codespace
        :return: SUCCESS/ERROR
        """
        pass

    @abstractmethod
    def edit_project_v2(self, project_id: int, project_name: str, user: str):
        """
        Edits project name
        :param project_id: id of project
        :param project_name: new name of project
        :param user: requested by user
        :return: SUCCESS/ERROR
        """
        pass

    @abstractmethod
    def get_project_count(self, user_id: str):
        """
        Gets count of projects by user and other users
        :param user_id: User id to fetch count for
        :return: Count of user projects and other projects
        """
        pass
