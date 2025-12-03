import {
  RESET_DELETE_WORKFLOW,
  RESET_WORKFLOW_YAML,
  SET_ALL_PROJECTS,
  SET_ALL_WORKSPACES,
  SET_CODESPACE_FOLDERS,
  SET_CREATE_JOB_CLUSTER_DEFINITION,
  SET_DELETE_WORKFLOW,
  SET_GET_WORKFLOW_YAML,
  SET_JOB_CLUSTER_DEFINITION,
  SET_PAUSE_WORKFLOW_SCHEDULE,
  SET_PROJECT_CODESPACES,
  SET_RECENTLY_CREATED,
  SET_RECENTLY_VISITED,
  SET_RESUME_WORKFLOW_SCHEDULE,
  SET_RUN_WORKFLOW_RUN,
  SET_STOP_WORKFLOW_RUN,
  SET_UPDATE_JOB_CLUSTER_DEFINITION,
  SET_WORKFLOWS,
  SET_WORKFLOW_FILTERS
} from './constants'
import {IWorkflowsState} from './reducer'

export function setRecentlyVisited(
  payload: IWorkflowsState['recentlyVisited']
) {
  return {
    type: SET_RECENTLY_VISITED,
    payload
  }
}

export function setRecentlyCreated(
  payload: IWorkflowsState['recentlyCreated']
) {
  return {
    type: SET_RECENTLY_CREATED,
    payload
  }
}

export function setWorkflows(payload: IWorkflowsState['workflows']) {
  return {
    type: SET_WORKFLOWS,
    payload
  }
}

export function setWorkflowFilters(payload: IWorkflowsState['filters']) {
  return {
    type: SET_WORKFLOW_FILTERS,
    payload
  }
}

export const setAllWorkspaces = (payload) => ({
  type: SET_ALL_WORKSPACES,
  payload
})

export const setAllProjects = (payload) => ({
  type: SET_ALL_PROJECTS,
  payload
})

export const setProjectCodespaces = (payload) => ({
  type: SET_PROJECT_CODESPACES,
  payload
})

export const setCodespaceFolders = (payload) => ({
  type: SET_CODESPACE_FOLDERS,
  payload
})

export function setStopWorkflowRun(
  payload: IWorkflowsState['stopWorkflowRun']
) {
  return {
    type: SET_STOP_WORKFLOW_RUN,
    payload
  }
}

export function setRunWorkflowRun(payload: IWorkflowsState['runWorkflowRun']) {
  return {
    type: SET_RUN_WORKFLOW_RUN,
    payload
  }
}

export function setDeleteWorkflow(payload: IWorkflowsState['deleteWorkflow']) {
  return {
    type: SET_DELETE_WORKFLOW,
    payload
  }
}

export function resetDeleteWorkflow() {
  return {
    type: RESET_DELETE_WORKFLOW
  }
}

export function setPauseWorkflowSchedule(
  payload: IWorkflowsState['pauseWorkflowSchedule']
) {
  return {
    type: SET_PAUSE_WORKFLOW_SCHEDULE,
    payload
  }
}

export function setResumeWorkflowSchedule(
  payload: IWorkflowsState['resumeWorkflowSchedule']
) {
  return {
    type: SET_RESUME_WORKFLOW_SCHEDULE,
    payload
  }
}

export function setGetWorkflowYaml(
  payload: IWorkflowsState['getWorkflowYaml']
) {
  return {
    type: SET_GET_WORKFLOW_YAML,
    payload
  }
}

export function resetWorkflowYaml() {
  return {
    type: RESET_WORKFLOW_YAML
  }
}

export function setCreateJobClusterDefinition(
  payload: IWorkflowsState['createJobClusterDefinition']
) {
  return {
    type: SET_CREATE_JOB_CLUSTER_DEFINITION,
    payload
  }
}

export function setJobClusterDefinition(
  payload: IWorkflowsState['jobClusterDefinition']
) {
  return {
    type: SET_JOB_CLUSTER_DEFINITION,
    payload
  }
}

export function setUpdateJobClusterDefinition(
  payload: IWorkflowsState['updateJobClusterDefinition']
) {
  return {
    type: SET_UPDATE_JOB_CLUSTER_DEFINITION,
    payload
  }
}
