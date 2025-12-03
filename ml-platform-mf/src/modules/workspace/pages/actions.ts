import {
  CREATE_CODESPACE,
  CREATE_PROJECT,
  GET_CODESPACES,
  LIST_PROJECT,
  PROJECT_DETAILS,
  SET_ATTACHED_CLUSTER,
  SET_ATTACH_CLUSTER,
  SET_CLUSTER_CANCELLATION_FOR_POLLING,
  SET_CLUSTER_RESOURCES,
  SET_COUNT_OF_PROJECTS,
  SET_DATABASES_FOR_ENVIRONMENT_AND_SOURCE,
  SET_DATA_FOR_ENVIRONMENT_AND_SOURCE,
  SET_DATA_SOURCES_FOR_ENVIRONMENT,
  SET_DELETE_CODESPACE,
  SET_DELETE_PROJECT,
  SET_DETACH_CLUSTER,
  SET_EDIT_CODESPACE,
  SET_EDIT_PROJECT,
  SET_ENVIRONMENT,
  SET_GENERIC_SNACKBAR,
  SET_GET_ALL_CLUSTERS,
  SET_IMPORT_PROJECT,
  SET_INFO_BAR,
  SET_LAST_SELECTED_CODESPACE,
  SET_LAST_SYNC_TIME,
  SET_LAUNCH_CODESPACE,
  SET_SAMPLE_DATA_FOR_DATA_SOURCE,
  SET_SELECTED_CODESPACE,
  SET_SELECTED_PROJECT,
  SET_SIDE_BAR_CONFIG,
  SET_START_CLUSTER,
  SET_STOP_CLUSTER,
  SET_UNIQUE_CODESPACE,
  SET_UNIQUE_LINK,
  SET_UNIQUE_PROJECT,
  SET_WORKSPACE_CLUSTER_STATUS
} from './constants'
import {IGenericSnackBarConfig, IWorkspaceState} from './reducer'

export function createProject(payload: IWorkspaceState['createProject']) {
  return {
    type: CREATE_PROJECT,
    payload
  }
}

export const createCodespace = (
  payload: IWorkspaceState['createCodespace']
) => {
  return {
    type: CREATE_CODESPACE,
    payload
  }
}

export function setProjectDetails(payload: IWorkspaceState['projectDetails']) {
  return {
    type: PROJECT_DETAILS,
    payload
  }
}

export const setProjectList = (payload: IWorkspaceState['projectList']) => {
  return {
    type: LIST_PROJECT,
    payload
  }
}

export const setCodespaces = (payload: IWorkspaceState['codespaces']) => {
  return {
    type: GET_CODESPACES,
    payload
  }
}

export const setLastSelectedCodespace = (
  payload: IWorkspaceState['lastSelectedCodespace']
) => {
  return {
    type: SET_LAST_SELECTED_CODESPACE,
    payload
  }
}

export const setGetAllClusters = (
  payload: IWorkspaceState['getAllClusters']
) => {
  return {
    type: SET_GET_ALL_CLUSTERS,
    payload
  }
}

export const setLaunchCodespace = (
  payload: IWorkspaceState['launchCodespace']
) => {
  return {
    type: SET_LAUNCH_CODESPACE,
    payload
  }
}

export const setDetachCluster = (payload: IWorkspaceState['detachCluster']) => {
  return {
    type: SET_DETACH_CLUSTER,
    payload
  }
}

export const setSelectedCodespace = (
  payload: IWorkspaceState['selectedCodespace']
) => {
  return {
    type: SET_SELECTED_CODESPACE,
    payload
  }
}

export const setSelectedProject = (
  payload: IWorkspaceState['selectedProject']
) => {
  return {
    type: SET_SELECTED_PROJECT,
    payload
  }
}

export const setAttachCluster = (payload: IWorkspaceState['attachCluster']) => {
  return {
    type: SET_ATTACH_CLUSTER,
    payload
  }
}

export const setStartCluster = (payload: IWorkspaceState['startCluster']) => {
  return {
    type: SET_START_CLUSTER,
    payload
  }
}

export const setStopCluster = (payload: IWorkspaceState['stopCluster']) => {
  return {
    type: SET_STOP_CLUSTER,
    payload
  }
}

export const setImportProject = (payload: IWorkspaceState['importProject']) => {
  return {
    type: SET_IMPORT_PROJECT,
    payload
  }
}

export const setAttachedCluster = (
  payload: IWorkspaceState['attachedCluster']
) => {
  return {
    type: SET_ATTACHED_CLUSTER,
    payload
  }
}

export const setLastSyncTime = (payload: IWorkspaceState['lastSyncTime']) => {
  return {
    type: SET_LAST_SYNC_TIME,
    payload
  }
}

export const setSideBarConfig = (payload: IWorkspaceState['sideBarConfig']) => {
  return {
    type: SET_SIDE_BAR_CONFIG,
    payload
  }
}

export const setGenericSnackBar = (payload: IGenericSnackBarConfig) => {
  return {
    type: SET_GENERIC_SNACKBAR,
    payload
  }
}

export const setUniqueLink = (payload: IWorkspaceState['uniqueLink']) => {
  return {
    type: SET_UNIQUE_LINK,
    payload
  }
}

export const setUniqueProject = (payload: IWorkspaceState['uniqueProject']) => {
  return {
    type: SET_UNIQUE_PROJECT,
    payload
  }
}

export const setUniqueCodespace = (
  payload: IWorkspaceState['uniqueCodespace']
) => {
  return {
    type: SET_UNIQUE_CODESPACE,
    payload
  }
}

export const setEnvironment = (payload: IWorkspaceState['environments']) => {
  return {
    type: SET_ENVIRONMENT,
    payload
  }
}

export const setSourcesForEnvironment = (
  payload: IWorkspaceState['sources']
) => {
  return {
    type: SET_DATA_SOURCES_FOR_ENVIRONMENT,
    payload
  }
}

export const setDataForEnvironmentAndSource = (
  payload: IWorkspaceState['dataSource']
) => {
  return {
    type: SET_DATA_FOR_ENVIRONMENT_AND_SOURCE,
    payload
  }
}

export const setDatabaseForEnvironmentAndSource = (
  payload: IWorkspaceState['databases']
) => {
  return {
    type: SET_DATABASES_FOR_ENVIRONMENT_AND_SOURCE,
    payload
  }
}

export const setSampleDataForDataSource = (
  payload: IWorkspaceState['sampleDataForDataSource']
) => {
  return {
    type: SET_SAMPLE_DATA_FOR_DATA_SOURCE,
    payload
  }
}

export const setClusterResources = (
  payload: IWorkspaceState['clusterResources']
) => {
  return {
    type: SET_CLUSTER_RESOURCES,
    payload
  }
}

export const setClusterCancellationForPolling = (
  payload: IWorkspaceState['clusterCancellationForPolling']
) => {
  return {
    type: SET_CLUSTER_CANCELLATION_FOR_POLLING,
    payload
  }
}

export const setDeleteProject = (payload: IWorkspaceState['deleteProject']) => {
  return {
    type: SET_DELETE_PROJECT,
    payload
  }
}

export const setDeleteCodespace = (
  payload: IWorkspaceState['deleteCodespace']
) => {
  return {
    type: SET_DELETE_CODESPACE,
    payload
  }
}

export const setEditCodespace = (payload: IWorkspaceState['editCodespace']) => {
  return {
    type: SET_EDIT_CODESPACE,
    payload
  }
}

export const setEditProject = (payload: IWorkspaceState['editProject']) => {
  return {
    type: SET_EDIT_PROJECT,
    payload
  }
}

export const setCountOfProjects = (
  payload: IWorkspaceState['countOfProjects']
) => {
  return {
    type: SET_COUNT_OF_PROJECTS,
    payload
  }
}

export const setInfoBar = (payload: IWorkspaceState['infoBar']) => {
  return {
    type: SET_INFO_BAR,
    payload
  }
}

export const setWorkspaceClusterStatus = (
  payload: IWorkspaceState['workspaceClusterStatus']
) => {
  return {
    type: SET_WORKSPACE_CLUSTER_STATUS,
    payload
  }
}
