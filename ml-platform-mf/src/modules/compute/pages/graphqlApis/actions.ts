import {API_STATUS} from '../../../../utils/apiUtils'
import {
  SET_CLUSTERS,
  SET_CLUSTER_STATUS,
  SET_COMPUTE_GPU_PODS,
  SET_COMPUTE_LIBRARIES,
  SET_COMPUTE_LIBRARY_DETAILS,
  SET_COMPUTE_LIBRARY_STATUS,
  SET_COMPUTE_LIBRARY_STATUSES,
  SET_COMPUTE_LIMITS,
  SET_COMPUTE_NODE_TYPES,
  SET_COMPUTE_RUNTIME,
  SET_COMPUTE_RUNTIME_DETAILS,
  SET_EVENT_TYPES,
  SET_INSTALL_LIBRARY,
  SET_LOGS,
  SET_LOG_COMPONENTS,
  SET_LOG_DETAILS,
  SET_LOG_GROUPS,
  SET_LOG_LEVELS,
  SET_MAVEN_PACKAGES,
  SET_MAVEN_PACKAGE_VERSIONS,
  SET_PREDICT_CLUSTER_COST,
  SET_RETRY_INSTALL_LIBRARY,
  SET_SPARK_HISTORY_SERVER,
  SET_START_SPARK_HISTORY_SERVER,
  SET_UNINSTALL_LIBRARY
} from './constants'
import {IComputeLibraries, IComputeState} from './reducer'

export const setClusters = (payload: IComputeState['clusters']) => {
  return {
    type: SET_CLUSTERS,
    payload
  }
}

export const setComputeLimits = (payload) => {
  return {
    type: SET_COMPUTE_LIMITS,
    payload
  }
}

export const setClusterStatus = (payload) => {
  return {
    type: SET_CLUSTER_STATUS,
    payload
  }
}

export const setComputeGpuPods = (payload) => {
  return {
    type: SET_COMPUTE_GPU_PODS,
    payload
  }
}

export const setComputeLibraries = (payload) => {
  return {
    type: SET_COMPUTE_LIBRARIES,
    payload
  }
}

export const setComputeLibraryStatus = (payload) => {
  return {
    type: SET_COMPUTE_LIBRARY_STATUS,
    payload
  }
}

export const setComputeLibraryStatuses = (payload) => {
  return {
    type: SET_COMPUTE_LIBRARY_STATUSES,
    payload
  }
}

export const setComputeLibraryDetails = (payload) => {
  return {
    type: SET_COMPUTE_LIBRARY_DETAILS,
    payload
  }
}

export const setUninstallLibrary = (payload) => {
  return {
    type: SET_UNINSTALL_LIBRARY,
    payload
  }
}

export const setInstallLibrary = (payload) => {
  return {
    type: SET_INSTALL_LIBRARY,
    payload
  }
}

export const setRetryInstallLibrary = (payload) => {
  return {
    type: SET_RETRY_INSTALL_LIBRARY,
    payload
  }
}

export const setMavenPackages = (payload) => {
  return {
    type: SET_MAVEN_PACKAGES,
    payload
  }
}
export const setMavenPackageVersions = (payload) => {
  return {
    type: SET_MAVEN_PACKAGE_VERSIONS,
    payload
  }
}
export const setComputeNodeTypes = (payload) => {
  return {
    type: SET_COMPUTE_NODE_TYPES,
    payload
  }
}

export const setLogGroups = (payload: IComputeState['logGroups']) => {
  return {
    type: SET_LOG_GROUPS,
    payload
  }
}

export const resetLogGroups = () => {
  return {
    type: SET_LOG_GROUPS,
    payload: {
      status: null,
      data: null,
      error: null
    }
  }
}

export const setLogComponents = (payload: IComputeState['logComponents']) => {
  return {
    type: SET_LOG_COMPONENTS,
    payload
  }
}

export const setLogLevels = (payload: IComputeState['logLevels']) => {
  return {
    type: SET_LOG_LEVELS,
    payload
  }
}

export const setLogs = (payload: IComputeState['logs']) => {
  return {
    type: SET_LOGS,
    payload
  }
}

export const resetLogs = () => {
  return {
    type: SET_LOGS,
    payload: {
      status: null,
      data: null,
      error: null,
      cancel: null
    }
  }
}

export const setLogDetails = (payload: IComputeState['logDetails']) => {
  return {
    type: SET_LOG_DETAILS,
    payload
  }
}

export const setEventTypes = (payload: IComputeState['eventTypes']) => {
  return {
    type: SET_EVENT_TYPES,
    payload
  }
}

export const setSparkHistoryServer = (
  payload: IComputeState['sparkHistoryServer']
) => {
  return {
    type: SET_SPARK_HISTORY_SERVER,
    payload
  }
}

export const setStartSparkHistoryServer = (
  payload: IComputeState['startSparkHistoryServer']
) => {
  return {
    type: SET_START_SPARK_HISTORY_SERVER,
    payload
  }
}

export const setPredictClusterCost = (
  payload: IComputeState['predictClusterCost']
) => {
  return {
    type: SET_PREDICT_CLUSTER_COST,
    payload
  }
}

export const setComputeRuntime = (payload) => {
  return {
    type: SET_COMPUTE_RUNTIME,
    payload
  }
}

export const setComputeRuntimeDetails = (payload) => {
  return {
    type: SET_COMPUTE_RUNTIME_DETAILS,
    payload
  }
}

export const resetComputeRuntimeDetails = () => {
  return {
    type: SET_COMPUTE_RUNTIME_DETAILS,
    payload: {
      status: API_STATUS.INIT,
      data: null,
      error: null
    }
  }
}

export const resetComputRuntime = () => {
  return {
    type: SET_COMPUTE_RUNTIME,
    payload: {
      status: API_STATUS.INIT,
      data: null,
      error: null
    }
  }
}
