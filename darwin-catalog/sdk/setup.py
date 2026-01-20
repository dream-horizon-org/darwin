"""Setup for Darwin Catalog SDK."""

from setuptools import setup, find_packages

setup(
    name="darwin-catalog",
    version="1.0.0",
    description="Python SDK for Darwin Catalog Service",
    author="Darwin Team",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "requests>=2.28.0",
        "dataclasses-json>=0.5.7",
    ],
    package_data={
        "darwin_catalog": ["py.typed"],
    },
)

