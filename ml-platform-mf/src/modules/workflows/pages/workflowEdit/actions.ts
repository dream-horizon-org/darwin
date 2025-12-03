import {
  RESET_CURRENT_WORKFLOW_JOB_CLUSTERS,
  SET_CURRENT_WORKFLOW_JOB_CLUSTERS
} from '../workflowCreate/constants'
import {RESET_UPDATE_WORKFLOW, SET_UPDATE_WORKFLOW} from './constants'
import {IWorkflowEditState} from './reducer'
export function setUpdateWorkflow(
  payload: IWorkflowEditState['updateWorkflow']
) {
  return {
    type: SET_UPDATE_WORKFLOW,
    payload: payload
  }
}

export function resetUpdateWorkflow() {
  return {
    type: RESET_UPDATE_WORKFLOW
  }
}
