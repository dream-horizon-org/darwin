import os
import subprocess
import time
from datetime import datetime
from typing import TypeVar

import boto3
import httpx
import pytz

from workspace_core.constants.constants import *
from workspace_core.utils.event_states import WorkspaceState

State = TypeVar("State", bound=WorkspaceState)


def error_handler(message: str = None):
    if message:
        data = message
    else:
        data = GENERIC_ERROR_MESSAGE
    return {"status": ERROR, "data": data}


def get_ray_head_node_link(dashboard_link: str):
    return dashboard_link.split(":8265")[0]


def get_project_name_from_link(github_link: str):
    temp = github_link.split("/")
    return temp[len(temp) - 1].split(".git")[0]


class Dotdict(dict):
    """dot.notation access to dictionary attributes"""

    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__


def get_contents(path: str):
    contents = sorted(os.listdir(f"{BASE_EFS_PATH}/{path}"))
    files = []
    sub_folders = []
    for f in contents:
        if os.path.isdir(f"{BASE_EFS_PATH}/{path}/{f}"):
            sub_folders.append({"name": f})
        else:
            files.append({"name": f})
    return {"files": files, "sub_folders": sub_folders}
