from dataclasses import dataclass

from workflow_core.models.identifier import Identifier


@dataclass
class JobClusterEsDtoIdentifier(Identifier):
    job_cluster_definition_id: str

    def get_unique_id(self) -> str:
        return self.job_cluster_definition_id
