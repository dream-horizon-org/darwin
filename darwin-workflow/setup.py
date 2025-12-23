import os

from setuptools import setup, find_packages

with open('README.md') as f:
    readme = f.read()


def read_requirements(file_name: str):
    requirements_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), file_name)
    return [req.strip() for req in open(requirements_path, 'rU').read().splitlines() if req.strip()]


all_reqs = read_requirements('requirements.txt')

setup(
    name='workflow_sdk',
    version='1.0.0',
    description='Workflow manager SDK for darwin',
    long_description=readme,
    packages=find_packages(exclude=('tests', 'docs', 'sample_notebooks')),
    install_requires=all_reqs,
    include_package_data=True)
