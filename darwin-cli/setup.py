from setuptools import setup, find_packages
import shutil
import os
import sys
from pathlib import Path

package_name = "darwin-cli"
version = "1.0.0"
dest_dirs = []


def prepare_package():
    global dest_dirs
    
    dest_dir1 = "darwin_compute"
    src_dir1 = "../darwin-compute/sdk/src/darwin_compute"
    if not os.path.exists(dest_dir1):
        shutil.copytree(src_dir1, dest_dir1)
        dest_dirs.append(dest_dir1)
    
    dest_dir2 = "compute_model"
    src_dir2 = "../darwin-compute/model/src/compute_model"
    if not os.path.exists(dest_dir2):
        shutil.copytree(src_dir2, dest_dir2)
        dest_dirs.append(dest_dir2)

    dest_dir3 = "darwin_workspace"
    src_dir3 = "../workspace/sdk/src/darwin_workspace"
    if not os.path.exists(dest_dir3):
        shutil.copytree(src_dir3, dest_dir3)
        dest_dirs.append(dest_dir3)

    dest_dir4 = "workspace_model"
    if not os.path.exists(dest_dir4):
        source_dir = Path("../workspace/app-layer/src/workspace_app_layer/models/workspace")
        dest_path = Path(dest_dir4)
        dest_path.mkdir(parents=True, exist_ok=True)
        for file_path in source_dir.iterdir():
            if file_path.is_file() and file_path.name != "__init__.py":
                shutil.copy2(file_path, dest_path)
        # Ensure workspace_model is a package
        (dest_path / "__init__.py").touch(exist_ok=True)
        dest_dirs.append(dest_dir4)

    dest_dir5 = "hermes"
    src_dir5 = "../hermes-cli/hermes"
    if not os.path.exists(dest_dir5):
        shutil.copytree(src_dir5, dest_dir5)
        dest_dirs.append(dest_dir5)

    dest_dir6 = "darwin_mlflow"
    src_dir6 = "../mlflow/sdk/darwin_mlflow"
    if not os.path.exists(dest_dir6):
        shutil.copytree(src_dir6, dest_dir6)
        dest_dirs.append(dest_dir6)

    dest_dir7 = "darwin_fs"
    src_dir7 = "../feature-store/python/darwin_fs/darwin_fs"
    if not os.path.exists(dest_dir7):
        shutil.copytree(src_dir7, dest_dir7)
        dest_dirs.append(dest_dir7)

    dest_dir8 = "darwin_catalog"
    src_dir8 = "../darwin-catalog/sdk/darwin_catalog"
    if not os.path.exists(dest_dir8):
        shutil.copytree(src_dir8, dest_dir8)
        dest_dirs.append(dest_dir8)

    dest_dir9 = "darwin_workflow"
    src_dir9 = "../darwin-workflow/sdk/src/darwin_workflow"
    if not os.path.exists(dest_dir9):
        shutil.copytree(src_dir9, dest_dir9)
        dest_dirs.append(dest_dir9)

    dest_dir10 = "workflow_model"
    src_dir10 = "../darwin-workflow/model/src/workflow_model"
    if not os.path.exists(dest_dir10):
        shutil.copytree(src_dir10, dest_dir10)
        dest_dirs.append(dest_dir10)

    return dest_dirs


def clean_up(dest_dirs):
    """Clean up copied packages - same pattern as compute SDK."""
    for dest_dir in dest_dirs:
        if os.path.exists(dest_dir):
            shutil.rmtree(dest_dir)


if any(cmd in sys.argv for cmd in ["sdist", "build", "install", "develop", "wheel"]):
    dest_dirs = prepare_package()

if __name__ == "__main__":
    setup(
        name=package_name,
        version=version,
        description="Unified CLI for Darwin ML Platform with integrated SDKs",
        author="Darwin Team",
        author_email="darwin@example.com",
        platforms="any",
        
        packages=find_packages(
            include=[
                "darwin_cli*",
                "darwin_compute*",
                "compute_model*",
                "darwin_workspace*",
                "workspace_model*",
                "hermes*",
                "darwin_mlflow*",
                "darwin_fs*",
                "darwin_catalog*",
                "darwin_workflow*",
                "workflow_model*",
            ]
        ),
        package_dir={
            "darwin_compute": "darwin_compute",
            "compute_model": "compute_model",
            "darwin_workspace": "darwin_workspace",
            "workspace_model": "workspace_model",
            "hermes": "hermes",
            "darwin_mlflow": "darwin_mlflow",
            "darwin_fs": "darwin_fs",
            "darwin_catalog": "darwin_catalog",
            "darwin_workflow": "darwin_workflow",
            "workflow_model": "workflow_model",
        },
    python_requires=">=3.9.7",
    install_requires=[
        "typer>=0.9.0",
        "pydantic~=1.10.2",
        "pyyaml>=6.0.0",
        "loguru>=0.7.0",
        "requests~=2.32.3",
        "dataclasses-json~=0.5.7",
        "typeguard~=4.4.2",
        "cookiecutter==2.6.0",
        "dependency-injector==4.45.0",
        "python-slugify==8.0.4",
        "binaryornot==0.4.4",
        "Jinja2==3.1.5",
        "questionary>=1.13.0",
        "aiohttp >= 3.8.0",
        "mlflow>=2.12.0",
        "shortuuid~=1.0.13",
        "croniter~=6.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
            "isort>=5.12.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "darwin=darwin_cli.main:main",
        ],
    },
    include_package_data=True,
    package_data={
            "darwin_compute": ["py.typed", "request.yaml"],
            "compute_model": ["py.typed"],
            "darwin_workspace": ["py.typed"],
            "workspace_model": ["py.typed"],
            "hermes": ["*", "**/*"],
            "darwin_fs": ["py.typed"],
            "darwin_catalog": ["py.typed"],
            "darwin_workflow": ["py.typed", "constant/*.conf"],
            "workflow_model": ["py.typed"],
        },
    zip_safe=False,
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)

# Only clean up for sdist/wheel builds, not for editable installs
if any(cmd in sys.argv for cmd in ["sdist", "wheel"]):
    try:
        clean_up(dest_dirs)
    except:
        pass

