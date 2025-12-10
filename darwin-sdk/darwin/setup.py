import os

from setuptools import setup, find_packages

_here = os.path.abspath(os.path.dirname(__file__))

with open("README.md") as f:
    readme = f.read()

with open("requirements.txt") as f:
    required = f.read().splitlines()


def get_version():
    """Prepare the version string based on environment variables."""
    version_file = os.path.join(os.path.dirname(__file__), "version.txt")
    spark_version = "unknown"
    sdk_version = "unknown"
    if os.path.exists(version_file):
        with open(version_file) as vf:
            for line in vf:
                if line.startswith("SPARK_VERSION="):
                    spark_version = line.strip().split("=")[1]
                elif line.startswith("BUILD_VERSION="):
                    sdk_version = line.strip().split("=")[1]
    return f"{spark_version}+{sdk_version}"


setup(
    name="darwin",
    version=get_version(),
    description="Darwin Spark Python SDK",
    long_description=readme,
    packages=find_packages(exclude=("tests", "docs")),
    install_requires=required,
    include_package_data=True,
    package_data={
        # If any package contains *.ini files, include them
        "": ["*.ini"],
        # If any folder contains *.jar files, include them
        "darwin": ["jars/*.jar"],
    },
    zip_safe=False,
    dependency_links=["http://pypi-server.darwin.org-k8s.local/simple"],
)
