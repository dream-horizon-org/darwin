"""Utility functions to replace mlp_commons.utils.utils"""
from typing import Optional, Callable, TypeVar

T = TypeVar('T')


def map_optional(value: Optional[T], func: Callable[[T], T]) -> Optional[T]:
    """Apply a function to an optional value if it's not None"""
    if value is not None:
        return func(value)
    return None

