from __future__ import annotations

import logging
import os
import subprocess
import zipfile
from abc import ABC
from typing import List, Any
import boto3

from workflow_core.constants.configs import Config

LOGGER = logging.getLogger('main')
LOGGER.setLevel(logging.INFO)


class S3Artifactory(ABC):
    """
        S3 darwin artifactory,
        We can build, upload and retrieve artifacts to S3
    """

    def __init__(self):
        # Configure S3 client with endpoint override for LocalStack/local development
        s3_config = {}
        self.endpoint_url = os.getenv("AWS_ENDPOINT_OVERRIDE") or os.getenv("AWS_ENDPOINT_URL")
        if self.endpoint_url:
            s3_config['endpoint_url'] = self.endpoint_url
            # For LocalStack, we may need credentials even if they're dummy values
            aws_access_key = os.getenv("AWS_ACCESS_KEY_ID", "minioadmin")
            aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "minioadmin")
            s3_config['aws_access_key_id'] = aws_access_key
            s3_config['aws_secret_access_key'] = aws_secret_key

        self.s3 = boto3.client('s3', **s3_config)
        self.env = 'stag' if os.getenv("ENV", "stag") in ['dev', 'stag'] else os.getenv("ENV")
        self._config = Config(self.env)
        self.airflow_s3_folder = self._config.get_airflow_s3_folder
        self.s3_bucket = self._config.get_s3_bucket
        
    def ensure_bucket_exists(self):
        """
        Ensures the S3 bucket exists, creating it if it doesn't.
        Only creates bucket for local/darwin-local environments.
        Similar to ensure_database_exists() pattern for MySQL.
        """
        # Only create bucket for local environments
        local_envs = ['local', 'darwin-local']
        if self.env not in local_envs:
            LOGGER.info(f"⏭️  Skipping S3 bucket creation for environment '{self.env}' (only done for local/darwin-local)")
            return
        
        try:
            # Check if bucket exists
            self.s3.head_bucket(Bucket=self.s3_bucket)
            LOGGER.info(f"✅ S3 bucket '{self.s3_bucket}' already exists.")
        except self.s3.exceptions.ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            if error_code == '404' or error_code == 'NoSuchBucket':
                # Bucket doesn't exist, create it
                try:
                    self.s3.create_bucket(Bucket=self.s3_bucket)
                    LOGGER.info(f"✅ Created S3 bucket '{self.s3_bucket}' for local environment.")
                except Exception as create_err:
                    LOGGER.error(f"❌ Failed to create S3 bucket '{self.s3_bucket}': {create_err}")
                    raise
            else:
                # Other error (permissions, etc.)
                LOGGER.warning(f"⚠️  Could not verify S3 bucket '{self.s3_bucket}': {e}")
                # Don't raise - allow operation to continue (bucket might exist but no permissions to check)

    def build_artifact(self, local_folder_path: str, temp_save_location: str = ".", folder_exclude: str = "venv"):
        """
        Builds an artifact/zip from the given local folder path and saves it in the specified location.

        :param local_folder_path: str, the local folder path to be zipped
        :param temp_save_location: str, the location where the zip file will be saved, default is "."
        :param folder_exclude: str, the folder to be excluded from the zip, default is ""
        :return: str, the zip file location
        :raise: Exception, error message if building the artifact fails
        """
        try:
            cmd = f"zip -r {temp_save_location} {local_folder_path} -x {folder_exclude}"
            subprocess.run(cmd.split(), capture_output=True, text=True)
            return temp_save_location
        except Exception as e:
            LOGGER.info("Error while building Artifact", e)

    def upload_artifact(self, local_artifact_path: str, s3_bucket: str, s3_key: str) -> str:
        """
        Upload an artifact to an S3 bucket.

        :param local_artifact_path: The local path of the artifact to upload.
        :param s3_bucket: The name of the S3 bucket to upload the artifact to.
        :param s3_key: The key (i.e., the file path within the S3 bucket) to upload the artifact to.
        :return: The S3 URL of the uploaded artifact (or HTTP URL for local development).
        :raise Exception: If there was an error while uploading the artifact.
        """
        try:
            self.s3.upload_file(local_artifact_path, s3_bucket, s3_key)
            url = "s3://" + s3_bucket + "/" + s3_key
            LOGGER.info("Artifact uploaded successfully to %s", url)
            return url
        except Exception as e:
            LOGGER.info("Error while Uploading artifact", e)
            raise Exception(f"Error while Uploading artifact {str(e)}")

    def upload_folder(self, local_directory: str, bucket: str, destination: str):
        """
        Upload a local directory to an S3 bucket
        :param local_directory: Directory to upload
        :param bucket: Bucket to upload to
        :param destination: S3 path to upload to
        :return: None
        """
        try:
            for root, dirs, files in os.walk(local_directory):
                for filename in files:
                    local_path = os.path.join(root, filename)
                    relative_path = os.path.relpath(local_path, local_directory)
                    s3_path = os.path.join(destination, relative_path)
                    print("Uploading %s..." % s3_path)
                    self.s3.upload_file(local_path, bucket, s3_path)
        except Exception as e:
            LOGGER.info("Error while Uploading folder", e)

    def download_artifact(self, remote_url: str, bucket_name: str, local_path_to_save: str = ".") -> str:
        """
        Download an artifact from a remote URL and save it in a specified location.

        :param remote_url: The URL of the artifact to be downloaded.
        :param bucket_name: The name of the bucket where the artifact is stored.
        :param local_path_to_save: The local path where the artifact will be saved.
        :return: The local path where the artifact was saved.
        """
        try:
            self.s3.download_file(bucket_name, remote_url, local_path_to_save)
            return local_path_to_save
        except Exception as e:
            LOGGER.info("Error while Downloading folder", e)

    def build_and_upload_artifact(self, local_folder_path: str, temp_save_location: str, bucket_name: str,
                                  remote_url: str) -> str:
        """
        :param local_folder_path: local folder path to zip
        :param temp_save_location: location to save the zip file
        :param bucket_name: bucket name to upload the zip file
        :param remote_url: remote url to upload the zip file
        :return: s3 url
        """
        self.build_artifact(local_folder_path, temp_save_location)
        return self.upload_artifact(temp_save_location, bucket_name, remote_url)

    def build_artefact_abs_path(self, path, artefact_name: str = None, s3_bucket: str = ""):

        abs_path = os.path.abspath(path)

        # Create a zipfile object with the desired name
        zip_name = f"{os.path.basename(abs_path)}.zip"
        zip_path = os.path.join(os.path.dirname(abs_path), zip_name)
        zip_file = zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED)
        # Walk through the folder and add each file to the zipfile
        for root, dirs, files in os.walk(abs_path):
            for file in files:
                file_path = os.path.join(root, file)
                zip_file.write(file_path, os.path.relpath(file_path, abs_path))
        # Close the zipfile
        zip_file.close()
        if artefact_name is None:
            s3_key = f"{self.airflow_s3_folder}/zips/{zip_name}"
        else:
            s3_key = artefact_name
        self.s3.upload_file(zip_path, s3_bucket, s3_key)
        os.remove(zip_path)
        return "s3://" + s3_bucket + "/" + s3_key

    def check_file_exists_in_s3_bucket(self, folder_path, file_name):
        """
        Check if a file exists in a specific folder of an S3 bucket.

        Parameters:
            bucket_name (str): The name of the S3 bucket.
            folder_path (str): The path of the folder in the S3 bucket (e.g., 'folder/subfolder/').
            file_name (str): The name of the file to check for in the folder.

        Returns:
            bool: True if the file exists, False otherwise.
        """
        complete_path = f'{self._config.get_airflow_s3_folder}/{folder_path}'
        # Normalize folder_path to ensure it ends with a slash ('/') if it's not empty.
        if complete_path and not complete_path.endswith('/'):
            complete_path += '/'
        object_key = complete_path + file_name

        try:
            response = self.s3.head_object(Bucket=self._config.get_s3_bucket, Key=object_key)
            if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                return True
        except self.s3.exceptions.ClientError as e:
            if e.response['Error']['Code'] != '404':
                LOGGER.error("Error while checking if file exists in S3 bucket.", exc_info=True)
            return False

    def get_all_output_notebooks(self, folder_path: str) -> list[Any]:
        """
        Get all output notebooks from S3
        :param folder_path: Folder path in S3
        :return: List of output notebooks
        """
        complete_path = f'{self._config.get_airflow_s3_folder}/{folder_path}'
        objects = self.s3.list_objects_v2(Bucket=self._config.get_s3_bucket, Prefix=complete_path).get('Contents')
        output_notebooks = []

        for obj in objects:
            if obj['Key'].endswith('.ipynb'):
                output_notebooks.append(obj['Key'].split('output_notebooks')[-1])

        return output_notebooks

    def check_if_folder_exist(self, folder_path: str) -> bool:
        """
        check if folder exists in s3
        :param folder_path: Folder path in S3
        :return: True if exists, False otherwise
        """
        complete_path = f'{self._config.get_airflow_s3_folder}/{folder_path}'
        objects = self.s3.list_objects_v2(Bucket=self._config.get_s3_bucket, Prefix=complete_path).get('Contents')

        if objects is not None and len(objects) > 0:
            return True

        return False

    def delete_from_s3(self, bucket: str, key: str):
        """
        Delete an object from an S3 bucket.

        :param bucket: The name of the S3 bucket.
        :param key: The key (i.e., the file path within the S3 bucket) of the object to delete.
        """
        self.s3.delete_object(Bucket=bucket, Key=key)
        LOGGER.info(f"Deleted object s3://{bucket}/{key}")
