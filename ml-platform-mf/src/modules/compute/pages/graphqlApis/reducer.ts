import {API_STATUS} from '../../../../utils/apiUtils'
import {SelectionOnGetEventTypes} from '../../graphQL/queries/getEventTypes'
import {SelectionOnGetLogComponents} from '../../graphQL/queries/getLogComponents'
import {SelectionOnGetLogGroups} from '../../graphQL/queries/getLogGroups'
import {SelectionOnGetLogLevels} from '../../graphQL/queries/getLogLevels'
import {SelectionOnGetLogLineDetails} from '../../graphQL/queries/getLogLineDetails'
import {SelectionOnGetLogs} from '../../graphQL/queries/getLogs'
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
import {SelectionOnData as IClusterStatusSelectionOnData} from './getClusterStatus/getClusterStatus'
import {GetComputeGpuPods} from './getComputeGpuPods'
import {
  GetComputeLibraries,
  SelectionOnGetComputeLibraries
} from './getComputeLibraries'
import {SelectionOnGetComputeLibraryDetails} from './getComputeLibraryDetails'
import {SelectionOnGetComputeLibraryStatus} from './getComputeLibraryStatus'
import {SelectionOnGetComputeLibraryStatuses} from './getComputeLibraryStatuses'
import {SelectionOnData as IComputeLimitsSelectionOnData} from './getComputeLimits/getComputeLimits'
import {GetComputeNodeTypes} from './getComputeNodeTypes'
import {SelectionOnGetComputeRuntime} from './getComputeRuntime'
import {SelectionOnGetComputeRuntimeDetails} from './getComputeRuntimeDetails'
import {SelectionOnGetMavenPackages} from './getMavenPackages'
import {SelectionOnGetMavenPackageVersions} from './getMavenPackageVersions'
import {SelectionOnGetSearchedClusters} from './getSearchedClusters'
import {SelectionOnGetSparkHistoryServer} from './getSparkHistoryServer'
import {SelectionOnInstallLibrary} from './installLibrary'
import {SelectionOnPredictClusterCost} from './predictClusterCost/predictClusterCost'
import {SelectionOnRetryInstallLibrary} from './retryInstallLibrary'
import {SelectionOnStartSparkHistoryServer} from './startSparkHistoryServer'
import {SelectionOnUninstallLibrary} from './uninstallLibrary'

export interface IComputeLimits {
  status: API_STATUS
  data: IComputeLimitsSelectionOnData
  error: any
}
export interface IClusterStatus {
  status: API_STATUS
  data: IClusterStatusSelectionOnData
  error: any
}
export interface IComputeGpuPods {
  status: API_STATUS
  data: GetComputeGpuPods['getComputeGpuPods']['data']
  error: any
}
export interface IComputeLibraries {
  status: API_STATUS
  data: GetComputeLibraries['getComputeLibraries']
  error: any
  cancel: () => void
}
export interface IComputeLibraryStatus {
  status: API_STATUS
  data: SelectionOnGetComputeLibraryStatuses
  error: any
}
export interface IComputeLibraryDetails {
  status: API_STATUS
  data: SelectionOnGetComputeLibraryDetails
  error: any
}
export interface IComputeUninstallLibrary {
  status: API_STATUS
  data: SelectionOnUninstallLibrary
  error: any
}
export interface IComputeInstallLibrary {
  status: API_STATUS
  data: SelectionOnInstallLibrary
  error: any
}
export interface IComputeMavenPackages {
  status: API_STATUS
  data: SelectionOnGetMavenPackages
  error: any
  cancel: () => void
}
export interface IComputeMavenPackageVersions {
  status: API_STATUS
  data: SelectionOnGetMavenPackageVersions
  error: any
}
export interface IComputeNodeTypes {
  status: API_STATUS
  data: GetComputeNodeTypes['getComputeNodeTypes']['data']
  error: any
}

export interface IComputeState {
  clusters: {
    status: API_STATUS
    data: SelectionOnGetSearchedClusters
    error: any
    cancel: () => void
  }
  computeLimits: IComputeLimits
  clusterStatus: IClusterStatus
  computeGpuPods: IComputeGpuPods
  computeNodeTypes: IComputeNodeTypes
  computeLibraries: {
    status: API_STATUS
    data: SelectionOnGetComputeLibraries
    error: any
    cancel: () => void
  }
  computeLibraryDetails: {
    status: API_STATUS
    data: SelectionOnGetComputeLibraryDetails
    error: any
  }
  computeLibraryStatus: {
    status: API_STATUS
    data: SelectionOnGetComputeLibraryStatus
    error: any
    cancel: () => void
  }
  computeLibraryStatuses: {
    status: API_STATUS
    data: SelectionOnGetComputeLibraryStatuses
    error: any
    cancel: () => void
  }
  computeUninstallLibrary: {
    status: API_STATUS
    data: SelectionOnUninstallLibrary
    error: any
  }
  computeInstallLibrary: {
    status: API_STATUS
    data: SelectionOnInstallLibrary
    error: any
  }
  retryInstallLibrary: {
    status: API_STATUS
    libraryId: number
    data: SelectionOnRetryInstallLibrary
    error: any
  }
  computeMavenPackages: {
    status: API_STATUS
    data: SelectionOnGetMavenPackages
    error: any
    cancel: () => void
  }
  computeMavenPackageVersions: {
    status: API_STATUS
    data: SelectionOnGetMavenPackageVersions
    error: any
  }
  predictClusterCost: {
    status: API_STATUS
    data: SelectionOnPredictClusterCost['data']
    error: any
    cancel: () => void
  }
  computeRuntime: {
    status: API_STATUS
    data: SelectionOnGetComputeRuntime['data']
    error: any
  }
  computeRuntimeDetails: {
    status: API_STATUS
    data: SelectionOnGetComputeRuntimeDetails['data']
    error: any
  }
  logGroups: {
    status: API_STATUS
    data: SelectionOnGetLogGroups['data']
    error: any
  }
  logComponents: {
    status: API_STATUS
    data: SelectionOnGetLogComponents['data']
    error: any
  }
  logLevels: {
    status: API_STATUS
    data: SelectionOnGetLogLevels['data']
    error: any
  }
  logs: {
    status: API_STATUS
    data: SelectionOnGetLogs['data']
    error: any
    cancel: () => void
  }
  logDetails: {
    status: API_STATUS
    data: SelectionOnGetLogLineDetails['data']
    error: any
  }
  eventTypes: {
    status: API_STATUS
    data: SelectionOnGetEventTypes['data']
    error: any
  }
  sparkHistoryServer: {
    status: API_STATUS
    data: SelectionOnGetSparkHistoryServer['data']
    error: any
  }
  startSparkHistoryServer: {
    status: API_STATUS
    data: SelectionOnStartSparkHistoryServer['data']
    error: any
  }
}

const initialState: IComputeState = {
  clusters: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  computeLimits: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  clusterStatus: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  computeGpuPods: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  computeLibraries: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  computeLibraryDetails: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  computeLibraryStatus: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  computeLibraryStatuses: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  computeUninstallLibrary: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  computeInstallLibrary: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  retryInstallLibrary: {
    status: API_STATUS.INIT,
    libraryId: null,
    data: null,
    error: null
  },
  computeMavenPackages: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  computeMavenPackageVersions: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  computeNodeTypes: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  logGroups: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  logComponents: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  logLevels: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  logs: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  logDetails: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  eventTypes: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  sparkHistoryServer: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  startSparkHistoryServer: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  predictClusterCost: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  computeRuntime: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  computeRuntimeDetails: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  }
}

export default function computeReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CLUSTERS: {
      return {
        ...state,
        clusters: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_COMPUTE_LIMITS: {
      return {
        ...state,
        computeLimits: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_CLUSTER_STATUS: {
      return {
        ...state,
        clusterStatus: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_COMPUTE_GPU_PODS: {
      return {
        ...state,
        computeGpuPods: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_COMPUTE_LIBRARIES: {
      return {
        ...state,
        computeLibraries: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_COMPUTE_LIBRARY_DETAILS: {
      return {
        ...state,
        computeLibraryDetails: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_COMPUTE_LIBRARY_STATUS: {
      return {
        ...state,
        computeLibraryStatus: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_COMPUTE_LIBRARY_STATUSES: {
      return {
        ...state,
        computeLibraryStatuses: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_UNINSTALL_LIBRARY: {
      return {
        ...state,
        computeUninstallLibrary: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_INSTALL_LIBRARY: {
      return {
        ...state,
        computeInstallLibrary: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_RETRY_INSTALL_LIBRARY: {
      return {
        ...state,
        retryInstallLibrary: {
          status: action.payload.status,
          libraryId: action.payload.libraryId,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_MAVEN_PACKAGES: {
      return {
        ...state,
        computeMavenPackages: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_MAVEN_PACKAGE_VERSIONS: {
      return {
        ...state,
        computeMavenPackageVersions: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_COMPUTE_NODE_TYPES: {
      return {
        ...state,
        computeNodeTypes: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_LOG_GROUPS: {
      return {
        ...state,
        logGroups: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_LOG_COMPONENTS: {
      return {
        ...state,
        logComponents: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_LOG_LEVELS: {
      return {
        ...state,
        logLevels: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_LOGS: {
      return {
        ...state,
        logs: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_LOG_DETAILS: {
      return {
        ...state,
        logDetails: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_EVENT_TYPES: {
      return {
        ...state,
        eventTypes: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_SPARK_HISTORY_SERVER: {
      return {
        ...state,
        sparkHistoryServer: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }

    case SET_START_SPARK_HISTORY_SERVER: {
      return {
        ...state,
        startSparkHistoryServer: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_PREDICT_CLUSTER_COST: {
      return {
        ...state,
        predictClusterCost: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_COMPUTE_RUNTIME: {
      return {
        ...state,
        computeRuntime: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_COMPUTE_RUNTIME_DETAILS: {
      return {
        ...state,
        computeRuntimeDetails: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }

    default:
      return state
  }
}
