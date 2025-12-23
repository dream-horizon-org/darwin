from dataclasses import dataclass

from dataclasses_json import DataClassJsonMixin

# from mlp_commons
@dataclass
class MetaData(DataClassJsonMixin):
    """Base class for the meta data which can be serialised and stored in DAO"""
