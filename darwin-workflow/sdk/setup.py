from setuptools import setup, find_packages
import shutil
import os
import sys
package_name = 'darwin-workflow'
version = '2.0.7'
source_dir = 'src'
dest_dir = ""


def prepare_package():
    dest_dir = os.path.join(source_dir, 'workflow_model')
    src_dir = '../model/src/workflow_model'
    if not os.path.exists(dest_dir):
        shutil.copytree(src_dir, dest_dir)
    return dest_dir


def clean_up(dest_dir):
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)


# dest_dir = prepare_package()

if 'sdist' in sys.argv:
    dest_dir = prepare_package()

if __name__ == "__main__":
    setup(
        name=package_name,
        version=version,
        description='Darwin Workflow SDK',
        platforms='any',
        classifiers=[
            'Programming Language :: Python :: 3.9',
            'Programming Language :: Python :: 3.10',
            'Programming Language :: Python :: 3.11'
        ],
        install_requires=[
            'requests~=2.32.3',
            'shortuuid~=1.0.13',
            'darwin_compute~=2.0.2',
            'dataclasses-json~=0.5.7',
            'darwin-logger~=2.0.6',
            'pydantic~=1.10.12',
            'typing_extensions==4.13.2',
            'typer~=0.15.2',
            'croniter~=6.0.0',
            'urllib3<2'
        ],
        python_requires='>=3.6',
        include_package_data=True,
        packages=find_packages(where='src'),
        package_dir={
            'cli': 'src/cli',
            'darwin_workflow': 'src/darwin_workflow',
            'workflow_model': 'src/workflow_model'
        },
        zip_safe=False,
        entry_points={
            'console_scripts': [
                'workflow=cli.workflow_cli.darwin_workflow_cli:app',
            ],
        },
        extras_require={
            'testing': [
                'pytest>=6.0',
                'pytest-cov>=2.0',
                'mypy>=0.910',
                'flake8>=3.9'
            ]
        },
        package_data={
            'darwin_workflow': ['py.typed'],
            'workflow_model': ['py.typed']
        }
    )

try:
    clean_up(dest_dir)
except:
    pass
