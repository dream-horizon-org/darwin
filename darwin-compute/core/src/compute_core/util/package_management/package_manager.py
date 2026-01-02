from typing import Optional

from loguru import logger

from compute_app_layer.models.request.library import SearchLibraryRequest, InstallRequest
from compute_app_layer.models.response.library import LibraryError
from compute_app_layer.utils.utils import download_file_content_from_s3
from compute_core.dao.library_management_dao import LibraryDao
from compute_core.dto.library_dto import LibraryDTO, LibraryStatus, DeleteLibrariesResponseDTO
from compute_core.util.package_management.package_installer import PackageInstaller
from compute_core.remote_command import RemoteCommand
from compute_model.cluster_status import ClusterStatus


class LibraryManager:
    def __init__(self):
        self._library_dao = LibraryDao()
        self._remote_command_manager = RemoteCommand()
        self._package_installer = PackageInstaller(self._remote_command_manager)

    def get_libraries(self, request: SearchLibraryRequest) -> [LibraryDTO]:
        # TODO: Mutating request.key with wildcards is a side effect - create a new variable instead
        request.key = "%" + request.key + "%"
        libraries = self._library_dao.search(request)
        # TODO: N+1 query pattern - checking status for each library individually is inefficient
        for library in libraries:
            new_status = self.check_and_update_status(library.id, library.execution_id, LibraryStatus(library.status))
            library.status = new_status.value
        return libraries

    def get_cluster_libraries(self, cluster_id: str) -> list[LibraryDTO]:
        return self._library_dao.get_cluster_libraries(cluster_id)

    def get_libraries_count(self, request: SearchLibraryRequest) -> int:
        request.key = "%" + request.key + "%"
        return self._library_dao.search_count(request)

    def get_library_details(self, library_id: str) -> LibraryDTO:
        return self._library_dao.get_with_id(library_id)

    def get_new_and_existing_libraries(
        self, cluster_id: str, new_request: list[InstallRequest]
    ) -> tuple[list[InstallRequest], list[LibraryDTO]]:
        """
        Compares the new request with existing libraries in the cluster and returns:
        - unique libraries that are not already installed in the cluster
        - libraries that are already installed in the cluster.
        """
        unique_libraries = []
        already_installed_libraries = []

        # Get existing libraries in the cluster
        existing_libraries = self.get_cluster_libraries(cluster_id)
        logger.debug(f"Existing libraries: {existing_libraries}")
        if not existing_libraries:
            return new_request, []

        # Convert existing libraries to InstallRequest for comparison
        existing_libraries_install_request = [
            InstallRequest.from_library_dto(existing_library) for existing_library in existing_libraries
        ]
        logger.debug(f"Existing libraries converted to InstallRequest: {existing_libraries_install_request}")

        # Get unique libraries
        # TODO: O(n*m) comparison - consider using a set or dict for O(n) lookup
        for library in new_request:
            skip = 0
            for i, existing_library_request in enumerate(existing_libraries_install_request):
                if existing_library_request == library:
                    # Add the original LibraryDTO instead of the converted InstallRequest
                    already_installed_libraries.append(existing_libraries[i])
                    skip = 1
                    break
            unique_libraries.append(library) if skip == 0 else None

        logger.debug(f"Unique libraries: {unique_libraries}")
        return unique_libraries, already_installed_libraries

    def add_library(self, cluster_id: str, cluster_status: str, request: list[InstallRequest]) -> list[LibraryDTO]:
        unique_request, already_installed_libraries = self.get_new_and_existing_libraries(cluster_id, request)
        if len(unique_request) == 0:
            logger.debug(f"No new libraries to install for cluster - {cluster_id}")
            return already_installed_libraries

        libraries: list[LibraryDTO] = self._package_installer.install(unique_request, cluster_id, cluster_status)
        logger.debug(f"Generated Libraries DTO: {libraries}")
        resp = self._library_dao.add_library(libraries)
        return resp + already_installed_libraries

    def update_libraries_for_cluster(self, cluster_id: str, status: str):
        logger.debug(f"Updating status - {status} for libraries for cluster - {cluster_id}")
        return self._library_dao.update_cluster_library_status(status, cluster_id)

    def check_and_update_status(
        self, library_id: str, execution_id: str, current_status: LibraryStatus
    ) -> LibraryStatus:
        if current_status != LibraryStatus.RUNNING:
            return current_status

        logger.debug("Library status is running, getting status from remote command layer")

        # If status is Running get status from remote command layer
        new_status = self._remote_command_manager.get_execution_status(execution_id)
        if not new_status:
            raise RuntimeError(f"Failed to get status for library: {library_id}")
        new_status = LibraryStatus(new_status["status"])

        logger.debug(f"Library status from remote command layer: {new_status.value}")

        # If new_status is not None and not equal to library.status then update the status in library table
        if new_status and new_status != current_status:
            self._library_dao.update_status(library_id, new_status)

        logger.debug(f"Updated status for library: {library_id} to {new_status.value}")

        return new_status

    def get_status(self, cluster_id: str, library_id: str) -> LibraryStatus:
        # Get status of library table
        library = self._library_dao.get_with_id(library_id)
        logger.debug(f"Library status from db: {library.status}")

        new_status = self.check_and_update_status(library_id, library.execution_id, library.status)

        return new_status

    def get_cluster_libraries_with_status(self, cluster_id: str, status: str) -> list[LibraryDTO]:
        logger.debug(f"Getting libraries with status - {status} for cluster - {cluster_id}")
        return self._library_dao.get_library_details_with_status_and_cluster_id(status, cluster_id)

    def delete_cluster_library(
        self, library_ids: list[int], cluster_id: str, cluster_status: str
    ) -> DeleteLibrariesResponseDTO:

        if cluster_status == ClusterStatus.inactive.value:
            logger.debug(f"Deleting libraries - {library_ids} for cluster - {cluster_id}")

            library_details: list[LibraryDTO] = self._library_dao.get_libraries_details_from_id(library_ids=library_ids)

            library_execution_ids = [library.execution_id for library in library_details]

            logger.debug(f"Deleting libraries with execution ids - {library_execution_ids}")
            # Remove the libraries from the cluster
            self._remote_command_manager.delete_from_cluster(cluster_id=cluster_id, execution_ids=library_execution_ids)

            logger.debug(f"Success in deleting libraries with execution ids - {library_execution_ids}")

            # Remove from libraries from the table
            self._library_dao.delete_libraries(library_ids=library_ids)

            logger.debug(f"Success in deleting libraries with library ids from db with ids - {library_ids}")
        else:
            logger.debug(f"Marking libraries - {library_ids} for uninstall for cluster - {cluster_id}")
            self._library_dao.update_status_of_library_having_id(LibraryStatus.UNINSTALL_PENDING.value, library_ids)

        resp = DeleteLibrariesResponseDTO(
            cluster_id=cluster_id, packages=[{"id": library_id} for library_id in library_ids]
        )
        return resp

    def get_error_details_for_library(self, execution_id: str) -> Optional[LibraryError]:
        resp = self._remote_command_manager.get_error_details_for_remote_command(execution_id)
        if not resp:
            return None
        return LibraryError(
            error_code=resp["error_code"],
            error_message=download_file_content_from_s3(resp["error_logs_path"]),
        )

    def delete_uninstalled_library(self, cluster_id: str):
        """
        Delete libraries with UNINSTALL_PENDING status for the cluster.
        Should be called when the cluster is stopped.
        """
        # Get libraries with UNINSTALL_PENDING status for the cluster
        status = LibraryStatus.UNINSTALL_PENDING.value
        cluster_libraries = self._library_dao.get_library_details_with_status_and_cluster_id(status, cluster_id)
        if not cluster_libraries or len(cluster_libraries) == 0:
            logger.debug(f"No uninstalled libraries found for cluster - {cluster_id}")
            return
        logger.debug(f"Deleting libraries - {cluster_libraries} for cluster - {cluster_id}")

        library_ids = [library.id for library in cluster_libraries]
        library_execution_ids = [library.execution_id for library in cluster_libraries]

        # Remove the remote executions from the cluster
        self._remote_command_manager.delete_from_cluster(cluster_id=cluster_id, execution_ids=library_execution_ids)
        logger.debug(f"Success in deleting libraries with execution ids - {library_execution_ids}")

        # Remove from libraries from the table
        self._library_dao.delete_libraries(library_ids=library_ids)

        logger.debug(f"Success in deleting libraries with library ids from db with ids - {library_ids}")

    def update_running_libraries_to_created(self, cluster_id: str):
        """
        Update libraries with RUNNING status to CREATED status for the cluster.
        Should be called when the cluster is stopped.
        """
        logger.debug(f"Updating libraries with RUNNING status to CREATED for cluster - {cluster_id}")
        self._library_dao.update_running_libraries_to_created(cluster_id)
        self._remote_command_manager.update_running_commands_status_to_created(cluster_id)

    def retry_install(self, cluster_id: str, library_id: str, cluster_status: str) -> LibraryDTO:
        # Get the library details
        library = self._library_dao.get_with_id(library_id)

        # Remove old remote command execution from the cluster
        self._remote_command_manager.delete_from_cluster(cluster_id=cluster_id, execution_ids=[library.execution_id])

        install_request = InstallRequest.from_library_dto(library)

        # Retry the installation
        libraries = self._package_installer.install([install_request], cluster_id, cluster_status)
        library = libraries[0]

        # Update the library status and execution id
        self._library_dao.update_status_and_execution_id(library_id, library.status, library.execution_id)

        return libraries[0]
