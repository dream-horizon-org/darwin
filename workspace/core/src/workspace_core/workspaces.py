from typing import Optional, List

from typeguard import typechecked

from workspace_core.actors.create_codespace_v2 import create_codespace
from workspace_core.actors.delete_folder_v2 import delete_folder
from workspace_core.actors.edit_folder_v2 import edit_folder
from workspace_core.actors.import_project_v2 import import_project
from workspace_core.constants.config import Config
from workspace_core.dao.mysql_dao import MySQLDao
from workspace_core.dao.queries.sql_queries import *
from workspace_core.dto.response import ProjectResponse, CodespaceResponse
from workspace_core.dto.response.workspace_and_codespace_response import WorkspaceAndCodespaceResponse
from workspace_core.entities.codespace import Codespace
from workspace_core.entities.project import Project
from workspace_core.generic_workspaces import Workspaces
from workspace_core.service.compute import Compute
from workspace_core.utils.events_mapper import chronos_events_mapper
from workspace_core.utils.events_utils import EventAPIClient
from workspace_core.utils.logging_util import get_logger
from workspace_core.utils.s3_utils import S3Utils
from workspace_core.utils.utils import *

logger = get_logger(__name__)


@typechecked
class WorkspacesSDK(Workspaces):
    def __init__(self, env: str):
        self.compute = Compute(env)
        self.dao = MySQLDao(env)
        self.ray_job_location = Config(env).ray_job_location
        self.s3_bucket = Config(env).s3_bucket
        self.fsx_root = Config(env).fsx_root
        self.app_layer_url = Config(env).app_layer_url
        self.darwin_host_internal = Config(env).get_darwin_host_internal
        self.env = env
        self.event_client = EventAPIClient(env=env)
        self.s3_client = S3Utils()

    def _send_event(
        self,
        state: State,
        codespace: CodespaceResponse = None,
        project: ProjectResponse = None,
        cluster: dict = None,
        response: dict = None,
    ):
        """
        Sends event to kafka
        :param state: state of workspace
        :param codespace: CodespaceResponse
        :param project: ProjectResponse
        :param cluster: cluster
        :param response: response
        :return: None
        """
        data = {"cluster": cluster, "state": state.event_name, "severity": state.severity}

        data = chronos_events_mapper(codespace, project, data)

        if response:
            data["response"] = response
        self.event_client.create_event(event_data=data, source="WORKSPACE_APP_LAYER")

    def list_projects_of_user(self, user_id: str, query_str: Optional[str] = "") -> List[ProjectResponse]:
        """
        Gets list of projects
        :param user_id: id of user
        :param query_str: query search string
        :return: List [ProjectResponse]
        """
        query_str = query_str + "%"
        data = {"user_id": user_id, "query_str": query_str}
        result = self.dao.read(GET_PROJECTS_WITH_USERID, data)
        logger.debug(f"list_projects_of_user: {result}")
        projects = [ProjectResponse.from_dict(project) for project in result]
        return projects

    def list_codespaces(self, project_id: int) -> List[CodespaceResponse]:
        """
        List of codespaces for a project
        :param project_id: id of project to fetch codespaces for
        :return: List [CodespaceResponse]
        """
        data = {"project_id": project_id}
        result = self.dao.read(GET_CODESPACES_WITH_PROJECTID, data)
        logger.debug(f"list_codespaces: {result}")
        codespaces = [CodespaceResponse.from_dict(codespace) for codespace in result]
        return codespaces

    def list_workspaces_and_codespaces(self, cluster_id: str) -> list[WorkspaceAndCodespaceResponse]:
        """
        List of workspaces and codespaces for a cluster_id
        :param cluster_id: id of cluster to fetch workspaces and codespaces for
        :return: List [WorkspaceAndCodespaceResponse]
        """
        data = {"cluster_id": cluster_id}
        result = self.dao.read(GET_WORKSPACES_AND_CODESPACES, data)
        workspaces_and_codespaces = [
            WorkspaceAndCodespaceResponse(
                project_id=row["project_id"],
                project_name=row["project_name"],
                codespace_id=row["codespace_id"],
                codespace_name=row["codespace_name"],
            )
            for row in result
        ]
        logger.debug(f"list_workspaces_and_codespaces: {result}")
        return workspaces_and_codespaces

    def project_details(self, project_id: int) -> ProjectResponse:
        """
        Gets details of a project
        :param project_id: id of project.
        :return: ProjectResponse
        """
        data = {"project_id": project_id}
        result = self.dao.read_one(GET_PROJECT_WITH_PROJECTID, data)
        logger.debug(f"project_details for project_id {project_id}: {result}")
        project = ProjectResponse.from_dict(result)
        return project

    def codespace_details(self, codespace_id: int) -> CodespaceResponse:
        """
        Gets details of a codespace
        :param codespace_id: id of codespace.
        :return: CodespaceResponse
        """
        data = {"codespace_id": codespace_id}
        result = self.dao.read_one(GET_CODESPACE_WITH_CODESPACEID, data)
        logger.debug(f"codespace_details for codespace id {codespace_id}: {result}")
        codespace = CodespaceResponse.from_dict(result)
        logger.debug(f"Codespace class for codespace id {codespace_id}: {codespace}")
        return codespace

    def get_codespace_from_name(self, codespace_name: str, project_id: int) -> CodespaceResponse:
        """
        Gets details of codespace from name
        :param project_id: id of project to which codespace belongs
        :param codespace_name: name of codespace
        :return: CodespaceResponse
        """
        data = {"project_id": project_id, "codespace_name": codespace_name}
        result = self.dao.read_one(GET_CODESPACE_FROM_NAME, data)
        logger.debug(f"get_codespace_from_name: {result}")
        codespace = CodespaceResponse.from_dict(result)
        return codespace

    def insert_last_selected_codespace(self, codespace_id: int, user_id: str):
        data = {"codespace_id": codespace_id, "user_id": user_id}
        logger.debug(f"Updating last selected codespace: {data}")
        result, _ = self.dao.create(INSERT_LAST_SELECTED_CODESPACE, data)
        logger.debug(f"Updated last selected codespace with result {result}")

    def launch_codespace_v2(self, codespace_id: int, user_id: str, cloned_from: Optional[str] = None):
        """
        Creates a jupyter environment in a cluster with codespace
        :param codespace_id: id of codespace to launch
        :param user_id: id of user who launches the codespace
        :param cloned_from: cloned from codespace
        :return: obj
        """
        codespace = self.codespace_details(codespace_id)
        project = self.project_details(codespace.project_id)
        cluster = None
        if codespace.cluster_id is not None:
            cluster = self.compute.get_cluster_details(codespace.cluster_id)
        logger.debug(
            f"launch_codespace_v2 with {codespace_id} and {codespace.project_id}: {codespace} {project} {cluster}"
        )
        self._send_event(WorkspaceState.LAUNCH_CODESPACE_REQUESTED, codespace, project, cluster)

        try:
            logger.debug(f"Creating codespace {codespace_id} in fsx")
            create_codespace(
                user_id=project.user_id,
                project_name=project.name,
                codespace_name=codespace.name,
                cloned_from=cloned_from,
                fsx_root=self.fsx_root,
            )
            logger.debug(f"Created codespace {codespace_id} in fsx")

            if cluster is not None:
                cluster_notebook_link = cluster["dashboards"]["data"]["jupyter_lab_url"]
                jupyter_link = f"{cluster_notebook_link}{CODESPACE_URL}{self.fsx_root}{project.user_id}/{project.name}/{codespace.name}"
                code_server_link = f'{cluster["dashboards"]["data"]["code_server_url"]}?folder=/home/ray/{self.fsx_root}{project.user_id}/{project.name}/{codespace.name}'
            else:
                jupyter_link = None
                code_server_link = None

            data = {"jupyter_link": jupyter_link, "codespace_id": codespace_id}
            logger.debug(f"Updating codespace {codespace_id} jupyter link: {data}")
            result, _ = self.dao.update(UPDATE_CODESPACE_JUPYTER_LINK, data)
            logger.debug(f"Updated codespace {codespace_id} jupyter link: {result}")
            self._send_event(WorkspaceState.LAUNCH_CODESPACE_SUCCESSFUL, codespace, project, cluster)
            time.sleep(2)

            data = {"codespace_id": codespace_id, "user_id": user_id}
            logger.debug(f"Updating last selected codespace: {data}")
            result, _ = self.dao.create(INSERT_LAST_SELECTED_CODESPACE, data)

            return {
                "project": project,
                "codespace": codespace,
                "cluster": cluster,
                "jupyter_link": jupyter_link,
                "code_server_link": code_server_link,
            }
        except Exception as err:
            logger.error(f"Error in launch_codespace_v2 for codespace {codespace_id}: {err}")
            self._send_event(WorkspaceState.LAUNCH_CODESPACE_FAILED, codespace, project, cluster)
            raise err

    def create_project(self, project: Project):
        """
        Creates a new project of the user
        :param project: Project object
        :return: obj
        """
        data = {"user_id": project.user_id, "name": project.name, "cloned_from": project.cloned_from}
        project_id, _ = self.dao.create(CREATE_PROJECT_QUERY, data)
        project = self.project_details(project_id)
        self._send_event(WorkspaceState.CREATE_PROJECT_SUCCESSFUL, None, project)

        return {"project_id": project_id, "name": project.name, "cloned_from": project.cloned_from}

    def create_codespace(self, codespace: Codespace):
        """
        Creates a new codespace for a project
        :param codespace: Codespace entity
        :return: Codespace
        """

        data = {"project_id": codespace.project_id, "name": codespace.name, "user": codespace.user}
        codespace_id, _ = self.dao.create(CREATE_CODESPACE_QUERY, data)
        codespace = self.codespace_details(codespace_id)
        project = self.project_details(codespace.project_id)
        self._send_event(WorkspaceState.CREATE_CODESPACE_SUCCESSFUL, codespace, project)

        return {"codespace_id": codespace_id, "name": codespace.name}

    def attach_cluster(self, codespace_id: int, cluster_id: str):
        """
        Adds cluster to codespace
        :param codespace_id: id of codespace
        :param cluster_id: id of cluster
        :return: No. of rows updated
        """
        data = {"cluster_id": cluster_id, "codespace_id": codespace_id}
        result, _ = self.dao.update(ATTACH_CLUSTER, data)
        logger.debug(f"Attached cluster for codespace_id {codespace_id}: {result}")
        codespace = self.codespace_details(codespace_id)
        project = self.project_details(codespace.project_id)
        self._send_event(WorkspaceState.ATTACHED_CLUSTER, codespace, project)

        return result

    def detach_cluster_v2(self, codespace_id: int):
        """
        Adds cluster to codespace
        :param codespace_id: id of codespace
        :return: Codespace
        """
        data = {"codespace_id": codespace_id}
        result, _ = self.dao.update(DETACH_CLUSTER, data)
        logger.debug(f"Detached cluster for codespace_id {codespace_id}: {result}")

        return result

    def launch_imported_project_v2(self, codespace_id: int, github_link: str, user_id: str):
        codespace = self.codespace_details(codespace_id)
        project = self.project_details(codespace.project_id)
        cluster = self.compute.get_cluster_details(codespace.cluster_id)
        self._send_event(WorkspaceState.IMPORT_PROJECT_REQUESTED, codespace, project, cluster)

        import_project(
            fsx_root=self.fsx_root,
            user_id=project.user_id,
            cloned_from=github_link,
            codespace_name=codespace.name,
            project_name=project.name,
        )

        if cluster["status"] == "active":
            cluster_notebook_link = cluster["dashboards"]["data"]["jupyter_lab_url"]
            jupyter_link = f"{cluster_notebook_link}{CODESPACE_URL}{self.fsx_root}{project.user_id}/{project.name}/{codespace.name}"
            code_server_link = f'{cluster["dashboards"]["data"]["code_server_url"]}?folder=/home/ray/{self.fsx_root}{project.user_id}/{project.name}/{codespace.name}'
            data = {"jupyter_link": jupyter_link, "codespace_id": codespace_id}
            result, _ = self.dao.update(UPDATE_CODESPACE_JUPYTER_LINK, data)
            logger.debug(f"Updated codespace with jupyter link: {result}")
        else:
            jupyter_link = None
            code_server_link = None

        self._send_event(WorkspaceState.IMPORT_PROJECT_SUCCESSFUL, codespace, project, cluster)

        time.sleep(2000 / 1000)

        data = {"codespace_id": codespace_id, "user_id": user_id}
        result, _ = self.dao.create(INSERT_LAST_SELECTED_CODESPACE, data)
        return {
            "project": project,
            "codespace": codespace,
            "cluster": cluster,
            "jupyter_link": jupyter_link,
            "code_server_link": code_server_link,
        }

    def import_project(self, user_id: str, cloned_from: str):
        """
        Import project function
        :param user_id:
        :param cloned_from:
        :return:
        """
        project_name = get_project_name_from_link(cloned_from)
        new_project = Project(user_id=user_id, name=project_name, cloned_from=cloned_from)
        return self.create_project(new_project)

    def _validate(self, query: str) -> bool:
        """
        :param query: query to validate with
        :return: True/False
        """
        result = self.dao.read(query)
        return False if result[0]["count"] > 0 else True

    def check_unique_project_name(self, user_id: str, project_name: str) -> bool:
        """
        Checks if the project name is unique or not
        :param user_id: id of user.
        :param project_name: name of project
        :return: True/False
        """
        check_unique_project_query = CHECK_UNIQUE_PROJECT % project_name
        return self._validate(check_unique_project_query)

    def check_unique_github_link(self, user_id: str, cloned_from: str) -> bool:
        """
        Checks if the imported project is unique or not
        :param user_id: id of user
        :param cloned_from: link used for importing project
        :return: True/False
        """
        project_name = get_project_name_from_link(cloned_from)
        check_unique_imported_project = CHECK_UNIQUE_PROJECT % project_name
        return self._validate(check_unique_imported_project)

    def check_unique_codespace_name(self, project_id: int, codespace_name: str) -> bool:
        """
        Checks if the codespace name is unique or not
        :param project_id: id of project
        :param codespace_name: name of codespace
        :return: True/False
        """
        check_unique_codespace_query = CHECK_UNIQUE_CODESPACE % (project_id, codespace_name)
        return self._validate(check_unique_codespace_query)

    def last_selected_codespace(self, user_id: str):
        """
        Get Last Selected codespace by the user
        :param user_id: id of user
        :return:
        """
        data = {"user_id": user_id}
        result = self.dao.read_one(GET_LAST_SELECTED_CODESPACE, data)

        if not result:
            return result

        result["cluster"] = {"name": None, "status": None, "dashboard_link": None}

        if not result["cluster_id"]:
            return result

        try:
            cluster_response = self.compute.get_cluster_details(result["cluster_id"])
            result["cluster"]["name"] = cluster_response["name"]
            result["cluster"]["status"] = cluster_response["status"]
            result["cluster"]["dashboard_link"] = cluster_response["dashboards"]["data"]["ray_dashboard_url"]
        except Exception as err:
            logger.error(f"Error while getting cluster details: {err}")
            result["cluster_id"] = None

        return result

    def delete_project_from_db(self, project_id: int):
        data = {"project_id": project_id}
        result, _ = self.dao.delete(DELETE_PROJECT, data)
        return result

    def delete_project_v2(self, project_id: int):
        """
        Delete Project and all its codespaces
        :param project_id: id of project
        :return: SUCCESS/ERROR
        """
        project = self.project_details(project_id)
        codespaces = self.list_codespaces(project_id)
        for codespace in codespaces:
            self.delete_codespace_from_db(codespace.id)

        self._delete_from_fsx(user_id=project.user_id, project_name=project.name)

        result = self.delete_project_from_db(project_id)
        return result

    def delete_codespace_from_db(self, codespace_id: int):
        data = {"codespace_id": codespace_id}
        result, _ = self.dao.delete(DELETE_CODESPACE, data)
        return result

    def _delete_from_fsx(self, user_id: str, project_name: str, codespace_name: Optional[str] = None):
        delete_folder(fsx_root=self.fsx_root, user_id=user_id, project_name=project_name, codespace_name=codespace_name)

    def delete_codespace_v2(self, codespace_id: int):
        """
        Deletes Codespace from cluster, db and s3
        :param codespace_id: id of codespace
        :return: No. of deleted rows
        """
        codespace = self.codespace_details(codespace_id)
        project = self.project_details(codespace.project_id)

        self._delete_from_fsx(user_id=project.user_id, project_name=project.name, codespace_name=codespace.name)
        result = self.delete_codespace_from_db(codespace_id)
        return result

    def attached_codespaces_count(self, cluster_id: str) -> int:
        data = {"cluster_id": cluster_id}
        result = self.dao.read_one(ATTACHED_CODESPACES_COUNT, data)
        logger.debug(f"Attached codespaces count for cluster {cluster_id}: {result}")
        return result["count"]

    def list_projects(self, user_id: str, query_str: str, my_projects: bool, sort_by: str):
        """
        Gets list of projects
        :param user_id: id of user
        :param query_str: query search string
        :param my_projects: fetch your projects or other workspaces
        :param sort_by: sort by parameter
        :return: List [Project]
        """
        query = GET_USER_PROJECTS if my_projects else GET_OTHER_PROJECTS
        query = query + ("name ASC" if sort_by == "name" else "updated_at DESC")

        query_str = f"%{query_str}%"
        data = {"query_str": query_str, "user_id": user_id}
        result = self.dao.read(query, data)
        logger.debug(f"List projects: {result}")
        return result

    def get_playground(self, user_id: str):
        data = {"user_id": user_id}
        result = self.dao.read_one(GET_PLAYGROUND, data)
        logger.debug(f"Playground: {result}")
        return result

    def _edit_codespace_in_db(self, codespace_name: str, codespace_id: int, user: str):
        data = {"codespace_id": codespace_id, "codespace_name": codespace_name, "user": user}
        result, _ = self.dao.update(UPDATE_CODESPACE_NAME, data)
        return result

    def _edit_project_in_db(self, project_name: str, project_id: int, user: str):
        data = {"project_id": project_id, "project_name": project_name, "user": user}
        result, _ = self.dao.update(UPDATE_PROJECT, data)
        return result

    def _edit_from_fsx(
        self,
        user_id: str,
        project_name: str,
        codespace_name: Optional[str] = None,
        new_codespace_name: Optional[str] = None,
        new_project_name: Optional[str] = None,
    ):
        edit_folder(
            fsx_root=self.fsx_root,
            user_id=user_id,
            project_name=project_name,
            codespace_name=codespace_name,
            new_project_name=new_project_name,
            new_codespace_name=new_codespace_name,
        )

    def edit_codespace_v2(self, codespace_id: int, codespace_name: str, user: str):
        """
        Edits codespace name
        :param codespace_id: id of codespace to edit
        :param codespace_name: new name of codespace
        :param user: user that edited the codespace
        :return: SUCCESS/ERROR
        """
        codespace = self.codespace_details(codespace_id)
        project = self.project_details(codespace.project_id)

        self._edit_from_fsx(
            user_id=user, project_name=project.name, codespace_name=codespace.name, new_codespace_name=codespace_name
        )

        result = self._edit_codespace_in_db(codespace_name, codespace_id, user)
        return result

    def edit_project_v2(self, project_id: int, project_name: str, user: str):
        """
        Edits project name
        :param project_id: id of project
        :param project_name: new name of project
        :param user: requested by user
        :return: SUCCESS/ERROR
        """
        project = self.project_details(project_id)

        self._edit_from_fsx(user_id=user, project_name=project.name, new_project_name=project_name)

        result = self._edit_project_in_db(project_name, project_id, user)
        return result

    def get_project_count(self, user_id: str):
        """
        Gets count of projects by user and other users
        :param user_id: User id to fetch count for
        :return: Count of user projects and other projects
        """
        data = {"user_id": user_id}
        result = self.dao.read_one(GET_PROJECT_COUNT, data)
        logger.debug(f"get_project_count: {result}")
        return result

    def get_workspaces(self):
        """
        Returns all Workspaces currently available
        """
        result = self.dao.read(GET_WORKSPACES)
        logger.debug(f"get_workspaces: {result}")
        return result

    def folder_contents(self, folder_path: str):
        """
        Returns Files and Folders in storage relative to the path provided
        :param folder_path: Path to folder
        :return: List of files and folders in the path provided
        """
        return get_contents(folder_path)

    def upload_to_s3(self, source_path: str, s3_bucket: str, destination_path: str):
        """
        Uploads file to S3
        :param source_path: Path of file to upload
        :param s3_bucket: S3 Bucket to upload to
        :param destination_path: Destination path in S3
        """
        return self.s3_client.upload_file(source_path, s3_bucket, destination_path)

    def get_project_id_and_codespace_id_from_codespace_path(self, user_id: str, project_name: str, codespace_name: str):
        """
        Given user_id , project_name, and codespace_name,
        fetches project_id and codespace_id
        """
        query = GET_PROJECT_ID_AND_CODESPACE_ID_FROM_CODESPACE_PATH
        params = {"user_id": user_id, "project_name": project_name, "codespace_name": codespace_name}
        result = self.dao.read(query=query, data=params)
        logger.debug(f"Geting project_id and codespace_id from codespace path: {result}")
        return result
