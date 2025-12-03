import {API_STATUS} from '../../../utils/apiUtils'
import {SelectionOnGetCodespaces} from '../pages/graphqlApis/getCodespaces/getCodespaces'
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
import {
  SelectionOnAttachCluster,
  SelectionOnAttachedCluster
} from './graphqlApis/attachCluster/attachCluster'
import {SelectionOnData as CheckUniqueCodespaceSelectionOnData} from './graphqlApis/checkUniqueCodespace/checkUniqueCodespace'
import {SelectionOnData as CheckUniqueLinkSelectionOnData} from './graphqlApis/checkUniqueLink/checkUniqueLink'
import {SelectionOnData as CheckUniqueProjectSelectionOnData} from './graphqlApis/checkUniqueProject/checkUniqueProject'
import {SelectionOnCreateCodespace} from './graphqlApis/createCodespace/createCodespace'
import {SelectionOnDeleteCodespace} from './graphqlApis/deleteCodespace/deleteCodespace'
import {SelectionOnDeleteProject} from './graphqlApis/deleteProject/deleteProject'
import {SelectionOnEditCodespace} from './graphqlApis/editCodespace/editCodespace'
import {SelectionOnEditProject} from './graphqlApis/editProject/editProject'
import {GetClusterResources} from './graphqlApis/getClusterResources/getClusterResources'
import {GetComputeCluster} from './graphqlApis/getClusterStatusV2/getClusterStatus'
import {SelectionOnGetCountOfProjects} from './graphqlApis/getCountOfProjects/getCountOfProjects'
import {SelectionOnData as DatabasesForEnvironmentAndSource} from './graphqlApis/getDatabasesForEnvironmentAndSource'
import {SelectionOnData as DataForEnvironmentAndSource} from './graphqlApis/getDataForEnvironmentAndSource'
import {
  SelectionOnData as ILastSelectedCodespace,
  SelectionOnGetLastSelectedCodespace
} from './graphqlApis/getLastSelectedCodespace/getLastSelectedCodespace'
import {SelectionOnData as GetProjectsSelectionOnData} from './graphqlApis/getProjects/getProjects'
import {SelectionOnData as SampleDataForDataSource} from './graphqlApis/getSampleDataForDataSource/getSampleDataForDataSource'
import {SelectionOnImportProject} from './graphqlApis/importProject/importProject'
import {LaunchCodespace} from './graphqlApis/launchCodespace/launchCodespace'
import {SelectionOnData as StartClusterSelectionOnData} from './graphqlApis/startCluster/startCluster'
import {SelectionOnStopCluster} from './graphqlApis/stopCluster/stopCluster'
import {RightMenuItems, SideBarWidth} from './rightDrawer/constants'

interface IprojectDetails {
  status: API_STATUS
  data?: any
  error?: IprojectDetailsError
}
interface IprojectDetailsError {
  message: string
  component?: JSX.Element
}

export interface IProjectList {
  status: API_STATUS
  data?: GetProjectsSelectionOnData[]
  error?: IprojectDetailsError
}

export interface ISideBarConfig {
  isOpen: boolean
  selectedMenu: RightMenuItems
  width: SideBarWidth
}

export enum SnackbarType {
  SUCCESS,
  ERROR
}
export interface IGenericSnackBarConfig {
  open: boolean
  message: string
  type: SnackbarType
}

export interface IEnvironments {
  status: API_STATUS
  data?: Array<String>
  error?: any
}

export interface ISources {
  status: API_STATUS
  data?: Array<String>
  error?: any
}

export interface IDataSource {
  status: API_STATUS
  data?: DataForEnvironmentAndSource['tables']
  error?: any
  totalRecordsCount: number
}
export interface IDatabases {
  status: API_STATUS
  data: DatabasesForEnvironmentAndSource['databases']
  error: any
  totalRecordsCount: number
}

export interface ISampleDataForDataSource {
  status: API_STATUS
  data?: SampleDataForDataSource
  error?: any
}

export interface ISelectedCodespace {
  status: API_STATUS
  data: SelectionOnGetLastSelectedCodespace['data']
  error: any
}

export interface ICodespaces {
  status: API_STATUS
  data: SelectionOnGetCodespaces['data']
  error: any
}

export interface IDeleteProject {
  status: API_STATUS
  data: SelectionOnDeleteProject['data']
  error: any
}

export interface IDeleteCodespace {
  status: API_STATUS
  data: SelectionOnDeleteCodespace['data']
  error: any
}

export interface IEditCodespace {
  status: API_STATUS
  error: any
}

export interface IEditProject {
  status: API_STATUS
  error: any
}

export interface ICountOfProjects {
  status: API_STATUS
  data: SelectionOnGetCountOfProjects['data']
  error: any
}

export enum INFO_BAR_TYPE {
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

export interface IWorkspaceState {
  createProject: {
    status: API_STATUS
  }
  createCodespace: {
    status: API_STATUS
    data: SelectionOnCreateCodespace | null
  }
  projectDetails: IprojectDetails
  projectList: IProjectList
  codespaces: ICodespaces
  lastSelectedCodespace: {
    status: API_STATUS
    data: ILastSelectedCodespace
  }
  getAllClusters: {
    status: API_STATUS
    data: any
    error: any
    pageSize: number | null
    offset: number | null
    resultSize: number | null
    cancel?: () => void
  }
  launchCodespace: {
    status: API_STATUS
    data: LaunchCodespace['launchCodespace']
    error: any
  }
  selectedCodespace: ISelectedCodespace
  detachCluster: {
    status: API_STATUS
    data: any
    error: any
  }
  selectedProject: any
  attachCluster: {
    data: SelectionOnAttachCluster
    status: API_STATUS
    error: any
  }
  startCluster: {
    data: StartClusterSelectionOnData
    status: API_STATUS
    error: any
  }
  stopCluster: {
    data: SelectionOnStopCluster['data']
    status: API_STATUS
    error: any
  }
  importProject: {
    status: API_STATUS
    data: SelectionOnImportProject
    error: any
  }
  attachedCluster: SelectionOnAttachedCluster
  lastSyncTime: {
    status: API_STATUS
    data: string
    error: any
  }
  sideBarConfig: ISideBarConfig
  genericSnackBarConfig: IGenericSnackBarConfig
  uniqueLink: {
    status: API_STATUS
    data: CheckUniqueLinkSelectionOnData
    error: any
  }
  uniqueProject: {
    status: API_STATUS
    data: CheckUniqueProjectSelectionOnData
    error: any
  }
  uniqueCodespace: {
    status: API_STATUS
    data: CheckUniqueCodespaceSelectionOnData
    error: any
  }
  environments: IEnvironments
  sources: ISources
  dataSource: IDataSource
  sampleDataForDataSource: ISampleDataForDataSource
  clusterResources: {
    status: API_STATUS
    data: GetClusterResources['getClusterResources']['data']
    error: any
  }
  clusterCancellationForPolling: {
    cancel: () => void
  }
  deleteProject: IDeleteProject
  deleteCodespace: IDeleteCodespace
  editCodespace: IEditCodespace
  editProject: IEditProject
  countOfProjects: ICountOfProjects
  databases: IDatabases
  infoBar: {
    message: string
    type:
      | INFO_BAR_TYPE.ERROR
      | INFO_BAR_TYPE.SUCCESS
      | INFO_BAR_TYPE.WARNING
      | null
    open: boolean
    autoHideDuration?: number
  }
  workspaceClusterStatus: {
    status: API_STATUS
    data: GetComputeCluster['getComputeCluster']
    error: any
  }
}

const initialState: IWorkspaceState = {
  createProject: {
    status: API_STATUS.INIT
  },
  createCodespace: {
    status: API_STATUS.INIT,
    data: null
  },
  projectDetails: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  projectList: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  codespaces: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  lastSelectedCodespace: {
    status: API_STATUS.INIT,
    data: null
  },
  getAllClusters: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    pageSize: null,
    offset: null,
    resultSize: null
  },
  launchCodespace: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  detachCluster: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  selectedCodespace: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  selectedProject: {},
  attachCluster: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  startCluster: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  stopCluster: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  importProject: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  attachedCluster: null,
  lastSyncTime: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  sideBarConfig: {
    isOpen: false,
    selectedMenu: null,
    width: SideBarWidth.SmallWidth
  },
  genericSnackBarConfig: {
    open: false,
    message: '',
    type: null
  },
  uniqueLink: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  uniqueProject: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  uniqueCodespace: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  environments: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  sources: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  dataSource: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    totalRecordsCount: 0
  },
  sampleDataForDataSource: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  clusterResources: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  clusterCancellationForPolling: {
    cancel: null
  },
  deleteProject: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  deleteCodespace: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  editCodespace: {
    status: API_STATUS.INIT,
    error: null
  },
  editProject: {
    status: API_STATUS.INIT,
    error: null
  },
  countOfProjects: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  databases: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    totalRecordsCount: 0
  },
  infoBar: {
    message: '',
    type: null,
    open: false,
    autoHideDuration: null
  },
  workspaceClusterStatus: {
    data: null,
    error: null,
    status: API_STATUS.INIT
  }
}

// Use the initialState as a default value
export default function workspaceProjectReducer(
  state = initialState,
  action
): IWorkspaceState {
  // The reducer normally looks at the action type field to decide what happens
  switch (action.type) {
    // Do something here based on the different types of actions
    case CREATE_PROJECT: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        // but has a new array for the `todos` field
        createProject: {
          status: action.payload.status
        }
      }
    }
    case CREATE_CODESPACE: {
      return {
        ...state,
        createCodespace: {
          status: action.payload.status,
          data: action.payload.data
        }
      }
    }
    case PROJECT_DETAILS: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        // but has a new array for the `todos` field
        projectDetails: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case LIST_PROJECT: {
      return {
        ...state,
        projectList: {
          status: action.payload.status,
          data: action.payload.data || state.projectList.data,
          error: action.payload.error
        }
      }
    }
    case GET_CODESPACES: {
      return {
        ...state,
        codespaces: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_LAST_SELECTED_CODESPACE: {
      return {
        ...state,
        lastSelectedCodespace: {
          status: action.payload.status,
          data: action.payload.data
        }
      }
    }
    case SET_GET_ALL_CLUSTERS: {
      return {
        ...state,
        getAllClusters: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          pageSize: action.payload.pageSize,
          offset: action.payload.offset,
          resultSize: action.payload.resultSize,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_LAUNCH_CODESPACE: {
      return {
        ...state,
        launchCodespace: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_DETACH_CLUSTER: {
      return {
        ...state,
        detachCluster: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_SELECTED_CODESPACE: {
      return {
        ...state,
        selectedCodespace: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_SELECTED_PROJECT: {
      return {
        ...state,
        selectedProject: action.payload
      }
    }
    case SET_ATTACH_CLUSTER: {
      return {
        ...state,
        attachCluster: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_START_CLUSTER: {
      return {
        ...state,
        startCluster: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_STOP_CLUSTER: {
      return {
        ...state,
        stopCluster: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_IMPORT_PROJECT: {
      return {
        ...state,
        importProject: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_ATTACHED_CLUSTER: {
      return {
        ...state,
        attachedCluster: action.payload
      }
    }
    case SET_LAST_SYNC_TIME: {
      return {
        ...state,
        lastSyncTime: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_SIDE_BAR_CONFIG: {
      return {
        ...state,
        sideBarConfig: {
          isOpen: action.payload.isOpen,
          selectedMenu: action.payload.selectedMenu,
          width: action.payload.width
        }
      }
    }
    case SET_GENERIC_SNACKBAR: {
      return {
        ...state,
        genericSnackBarConfig: action.payload
      }
    }

    case SET_UNIQUE_LINK: {
      return {
        ...state,
        uniqueLink: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_UNIQUE_PROJECT: {
      return {
        ...state,
        uniqueProject: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_UNIQUE_CODESPACE: {
      return {
        ...state,
        uniqueCodespace: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_ENVIRONMENT: {
      return {
        ...state,
        environments: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_DATA_SOURCES_FOR_ENVIRONMENT: {
      return {
        ...state,
        sources: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_DATA_FOR_ENVIRONMENT_AND_SOURCE: {
      return {
        ...state,
        dataSource: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          totalRecordsCount: action.payload.totalRecordsCount
        }
      }
    }
    case SET_SAMPLE_DATA_FOR_DATA_SOURCE: {
      return {
        ...state,
        sampleDataForDataSource: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_DATABASES_FOR_ENVIRONMENT_AND_SOURCE: {
      return {
        ...state,
        databases: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          totalRecordsCount: action.payload.totalRecordsCount
        }
      }
    }
    case SET_CLUSTER_RESOURCES: {
      return {
        ...state,
        clusterResources: {
          status: action.payload.status,
          data: action.payload.data || state.clusterResources.data,
          error: action.payload.error
        }
      }
    }
    case SET_CLUSTER_CANCELLATION_FOR_POLLING: {
      return {
        ...state,
        clusterCancellationForPolling: {
          cancel: action.payload.cancel
        }
      }
    }
    case SET_DELETE_PROJECT: {
      return {
        ...state,
        deleteProject: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_DELETE_CODESPACE: {
      return {
        ...state,
        deleteCodespace: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_EDIT_CODESPACE: {
      return {
        ...state,
        editCodespace: {
          status: action.payload.status,
          error: action.payload.error
        }
      }
    }
    case SET_EDIT_PROJECT: {
      return {
        ...state,
        editProject: {
          status: action.payload.status,
          error: action.payload.error
        }
      }
    }
    case SET_COUNT_OF_PROJECTS: {
      return {
        ...state,
        countOfProjects: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_INFO_BAR: {
      return {
        ...state,
        infoBar: {
          message: action.payload.message,
          type: action.payload.type,
          open: action.payload.open,
          autoHideDuration: action.payload.autoHideDuration
        }
      }
    }
    case SET_WORKSPACE_CLUSTER_STATUS: {
      return {
        ...state,
        workspaceClusterStatus: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    default:
      // If this reducer doesn't recognize the action type, or doesn't
      // care about this specific action, return the existing state unchanged
      return state
  }
}
