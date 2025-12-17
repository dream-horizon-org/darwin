from __future__ import annotations


class ArtifactoryInterface:
    """
        Base class for darwin artifactory,
        We can build, upload and retrieve artifacts using this
    """

    def build(self, local_folder_path: str, temp_save_location: str = ".") -> str:
        """

        :param local_folder_path:
        :param temp_save_location:
        :return:
        """
        pass

    def upload_artifact(self, local_artifact_path: str, remote_url: str) -> str:
        """

        :param local_artifact_path:
        :param remote_url:
        :return:
        """
        pass

    def download_artrifact(self, remote_url: str, local_path_to_save: str = ".") -> str:
        """

        :param remote_url:
        :param local_path_to_save:
        :return:
        """
        pass

    def build_and_upload_artifact(self, local_folder_path: str, remote_url: str) -> str:
        temp_save_location = self.build(local_folder_path)
        return self.upload_artifact(temp_save_location, remote_url)

    def check_file_exists_in_s3_bucket(self, bucket_name, folder_path, file_name) -> str:
        """
        Check if a file exists in a specific folder of an S3 bucket.

        Parameters:
            bucket_name (str): The name of the S3 bucket.
            folder_path (str): The path of the folder in the S3 bucket (e.g., 'folder/subfolder/').
            file_name (str): The name of the file to check for in the folder.

        Returns:
            bool: True if the file exists, False otherwise.
        """
        pass
