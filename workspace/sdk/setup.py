from setuptools import setup, find_packages
import shutil
import os
import sys
from pathlib import Path

package_name = "darwin-workspace"
version = "1.0.0"
source_dir = "src"
dest_dir = ""

def prepare_package():
    source_dir = Path("../app-layer/src/workspace_app_layer/models/workspace")
    dest_dir = Path("src/workspace_model")
    dest_dir.mkdir(parents=True, exist_ok=True)
    for file_path in source_dir.iterdir():
        if file_path.is_file() and file_path.name != "__init__.py":
            shutil.copy2(file_path, dest_dir)
    model_folder = Path(dest_dir)
    (model_folder / "__init__.py").touch(exist_ok=True)
    return dest_dir



def clean_up(dest_dir):
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)

if "sdist" in sys.argv:
    dest_dir = prepare_package()


if __name__ == "__main__":
    setup(
        name=package_name,
        version=version,
        description="Darwin Workspace SDK",
        platforms="any",
        classifiers=[
            "Programming Language :: Python :: 3.9",
            "Programming Language :: Python :: 3.10",
        ],
        install_requires=[
            "requests~=2.32.3",
            "typeguard~=4.4.2",
            "pydantic~=1.10.2",
        ],
        python_requires=">=3.9",
        include_package_data=True,
        packages=find_packages(where="src",include=["workspace_model*", "darwin_workspace*"]),
        package_dir={
            "darwin_workspace": "src/darwin_workspace",
            "workspace_model": "src/workspace_model",
        },
        zip_safe=False,
        extras_require={
            "testing": ["pytest>=6.0", "pytest-cov>=2.0", "mypy>=0.910", "flake8>=3.9"],
        },
        package_data={"darwin_workspace": ["py.typed"], "workspace_model": ["py.typed"]},
    )

try:
    clean_up(dest_dir)
except Exception:
    pass

