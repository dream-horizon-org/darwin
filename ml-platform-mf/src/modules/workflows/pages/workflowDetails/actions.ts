import {
  RESET_REPAIR_RUN,
  RESET_UPDATE_WORKFLOW_CONCURRENT_RUNS,
  RESET_UPDATE_WORKFLOW_RETRIES,
  RESET_UPDATE_WORKFLOW_SCHEDULE,
  RESET_UPDATE_WORKFLOW_TAGS,
  RESET_WORKFLOW_DETAILS,
  RESET_WORKFLOW_RUNS,
  RESET_WORKFLOW_RUN_DETAILS,
  RESET_WORKFLOW_TASK_DETAILS,
  RESET_WORKFLOW_TASK_DETAILS_WITHOUT_RUN,
  SET_REPAIR_RUN,
  SET_UPDATE_WORKFLOW_CONCURRENT_RUNS,
  SET_UPDATE_WORKFLOW_RETRIES,
  SET_UPDATE_WORKFLOW_SCHEDULE,
  SET_UPDATE_WORKFLOW_TAGS,
  SET_WORKFLOWS_META_DATA,
  SET_WORKFLOW_DETAILS,
  SET_WORKFLOW_PATH_IDS,
  SET_WORKFLOW_RUNS,
  SET_WORKFLOW_RUN_DETAILS,
  SET_WORKFLOW_STATUS,
  SET_WORKFLOW_TASK_DETAILS,
  SET_WORKFLOW_TASK_DETAILS_WITHOUT_RUN
} from './constants'
import {IWorkflowsDetailsState} from './reducer'

export function setWorkflowDetails(
  payload: IWorkflowsDetailsState['workflowDetails']
) {
  return {
    type: SET_WORKFLOW_DETAILS,
    payload
  }
}
export function setWorkflowsMetaData(
  payload: IWorkflowsDetailsState['workflowsMetaData']
) {
  return {
    type: SET_WORKFLOWS_META_DATA,
    payload
  }
}
export function setWorkflowStatus(
  payload: IWorkflowsDetailsState['workflowStatus']
) {
  return {
    type: SET_WORKFLOW_STATUS,
    payload
  }
}
export function resetWorkflowDetails() {
  return {
    type: RESET_WORKFLOW_DETAILS
  }
}

export function setWorkflowRuns(
  payload: IWorkflowsDetailsState['workflowRuns']
) {
  return {
    type: SET_WORKFLOW_RUNS,
    payload
  }
}

export function resetWorkflowRuns() {
  return {
    type: RESET_WORKFLOW_RUNS
  }
}

export function setWorkflowRunDetails(
  payload: IWorkflowsDetailsState['workflowRunDetails']
) {
  return {
    type: SET_WORKFLOW_RUN_DETAILS,
    payload
  }
}

export function resetWorkflowRunDetails() {
  return {
    type: RESET_WORKFLOW_RUN_DETAILS
  }
}

export function setWorkflowTaskDetails(
  payload: IWorkflowsDetailsState['workflowTaskDetails']
) {
  return {
    type: SET_WORKFLOW_TASK_DETAILS,
    payload
  }
}

export function resetWorkflowTaskDetails() {
  return {
    type: RESET_WORKFLOW_TASK_DETAILS
  }
}

export function setWorkflowTaskDetailsWithoutRun(
  payload: IWorkflowsDetailsState['workflowTaskDetailsWithoutRun']
) {
  return {
    type: SET_WORKFLOW_TASK_DETAILS_WITHOUT_RUN,
    payload
  }
}

export function resetWorkflowTaskDetailsWithoutRun() {
  return {
    type: RESET_WORKFLOW_TASK_DETAILS_WITHOUT_RUN
  }
}

export function setUpdateWorkflowSchedule(
  payload: IWorkflowsDetailsState['updateWorkflowSchedule']
) {
  return {
    type: SET_UPDATE_WORKFLOW_SCHEDULE,
    payload
  }
}

export function resetUpdateWorkflowSchedule() {
  return {
    type: RESET_UPDATE_WORKFLOW_SCHEDULE
  }
}

export function setUpdateWorkflowRetries(
  payload: IWorkflowsDetailsState['updateWorkflowRetries']
) {
  return {
    type: SET_UPDATE_WORKFLOW_RETRIES,
    payload
  }
}

export function resetUpdateWorkflowRetries() {
  return {
    type: RESET_UPDATE_WORKFLOW_RETRIES
  }
}

export function setUpdateWorkflowConcurrentRuns(
  payload: IWorkflowsDetailsState['updateWorkflowConcurrentRuns']
) {
  return {
    type: SET_UPDATE_WORKFLOW_CONCURRENT_RUNS,
    payload
  }
}

export function resetUpdateWorkflowConcurrentRuns() {
  return {
    type: RESET_UPDATE_WORKFLOW_CONCURRENT_RUNS
  }
}

export function setUpdateWorkflowTags(
  payload: IWorkflowsDetailsState['updateWorkflowTags']
) {
  return {
    type: SET_UPDATE_WORKFLOW_TAGS,
    payload
  }
}

export function resetUpdateWorkflowTags() {
  return {
    type: RESET_UPDATE_WORKFLOW_TAGS
  }
}

export function setRepairWorkflowRun(
  payload: IWorkflowsDetailsState['repairRun']
) {
  return {
    type: SET_REPAIR_RUN,
    payload
  }
}

export function resetRepairWorkflowRun() {
  return {
    type: RESET_REPAIR_RUN
  }
}

export function setWorkflowPathIds(
  payload: IWorkflowsDetailsState['workflowPathIds']
) {
  return {
    type: SET_WORKFLOW_PATH_IDS,
    payload
  }
}
