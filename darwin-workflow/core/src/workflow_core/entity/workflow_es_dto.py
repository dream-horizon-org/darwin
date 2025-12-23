from dataclasses import dataclass

from workflow_core.models.identifier import Identifier


@dataclass
class WorkflowEsDtoIdentifier(Identifier):
    workflow_id: str

    def get_unique_id(self) -> str:
        return self.workflow_id


@dataclass
class RecentlyVisitedDtoIdentifier(Identifier):
    user_id: str

    def get_unique_id(self) -> str:
        return self.user_id
