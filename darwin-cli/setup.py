from setuptools import setup, find_packages
import shutil
import os
import sys

package_name = "darwin-cli"
version = "1.0.0"
dest_dirs = []


def prepare_package():
    """Copy external SDK packages - same pattern as compute SDK."""
    global dest_dirs
    
    print(' Copy darwin_compute')
    dest_dir1 = "darwin_compute"
    src_dir1 = "../darwin-compute/sdk/src/darwin_compute"
    if not os.path.exists(dest_dir1):
        shutil.copytree(src_dir1, dest_dir1)
        dest_dirs.append(dest_dir1)
    
    print(' Copy compute_model')
    dest_dir2 = "compute_model"
    src_dir2 = "../darwin-compute/model/src/compute_model"
    if not os.path.exists(dest_dir2):
        shutil.copytree(src_dir2, dest_dir2)
        dest_dirs.append(dest_dir2)
    
    return dest_dirs


def clean_up(dest_dirs):
    """Clean up copied packages - same pattern as compute SDK."""
    for dest_dir in dest_dirs:
        print(' Clean up {}'.format(dest_dir))
        if os.path.exists(dest_dir):
            shutil.rmtree(dest_dir)


# Same pattern as compute SDK - copy packages when building
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
        
        # Find all packages  
        packages=find_packages(include=["darwin_cli", "darwin_cli.*", "darwin_compute", "darwin_compute.*", "compute_model", "compute_model.*"]),
        
        # Map package names to their actual locations (same as compute SDK)
        package_dir={
            "darwin_compute": "darwin_compute", 
            "compute_model": "compute_model",
        },
    
    python_requires=">=3.9",
    install_requires=[
        # Darwin CLI dependencies
        "typer>=0.9.0",
        "click>=8.1.0",
        "pydantic>=2.0.0",
        "pyyaml>=6.0.0",
        "rich>=13.0.0",
        "httpx>=0.24.0",
        "questionary>=1.10.0",
        "loguru>=0.7.0",
        # Darwin Compute SDK dependencies
        "requests~=2.32.3",
        "dataclasses-json~=0.5.7",
        "typeguard~=4.4.2",
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
            "darwin-cli=darwin_cli.main:main",
        ],
    },
    
    # Include package data (py.typed files for type hints)
    include_package_data=True,
    package_data={
        "darwin_compute": ["py.typed", "request.yaml"],
        "compute_model": ["py.typed"],
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

# Same cleanup pattern as compute SDK
try:
    clean_up(dest_dirs)
except:
    pass

