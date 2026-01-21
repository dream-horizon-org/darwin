from typing import Optional, List

from pydantic import BaseModel, validator


class CreateRunRequest(BaseModel):
    run_name: Optional[str] = None
    tags: List[dict[str, str]] = []


class MetricsData(BaseModel):
    key: str
    value: float


class ParamsData(BaseModel):
    key: str
    value: str

    @validator("key")
    def key_must_be_valid(cls, key: str):  # pylint: disable=no-self-argument
        if len(key.encode("utf-8")) > 255:
            raise ValueError("Key length cannot exceed 255 bytes")
        return key

    @validator("value")
    def value_must_be_valid(cls, value: str):  # pylint: disable=no-self-argument
        if len(value.encode("utf-8")) > 6000:
            raise ValueError("Value length cannot exceed 6000 bytes")
        return value


class LogRunDataRequest(BaseModel):
    metrics: Optional[MetricsData] = None
    params: Optional[ParamsData] = None
