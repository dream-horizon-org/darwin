import {API_STATUS} from '../../../../utils/apiUtils'
import {CodespaceFolders} from '../../graphqlAPIs/codespaceFolders'
import {CreateJobClusterDefinition} from '../../graphqlAPIs/createJobClusterDefinition'
import {SelectionOnDeleteWorkflow} from '../../graphqlAPIs/deleteWorkflow'
import {GetCodespaces} from '../../graphqlAPIs/getCodespaces/getCodespaces'
import {GetProjects} from '../../graphqlAPIs/getProjects/getProjects'
import {SelectionOnGetRecentlyVisitedWorkflows} from '../../graphqlAPIs/getRecentlyVisitedWorkflows/index'
import {SelectionOnGetWorkflowFilters} from '../../graphqlAPIs/getWorkflowFilters'
import {SelectionOnGetWorkflows} from '../../graphqlAPIs/getWorkflows'
import {SelectionOnGetWorkflowYaml} from '../../graphqlAPIs/getWorkflowYaml'
import {JobClusterDefinition} from '../../graphqlAPIs/jobClusterDefinition'
import {SelectionOnPauseWorkflowSchedule} from '../../graphqlAPIs/pauseWorkflowSchedule'
import {SelectionOnResumeWorkflowSchedule} from '../../graphqlAPIs/resumeWorkflowSchedule'
import {SelectionOnRunWorkflowRun} from '../../graphqlAPIs/runWorkflowRun'
import {SelectionOnStopWorkflowRun} from '../../graphqlAPIs/stopWorkflowRun'
import {UpdateJobClusterDefinition} from '../../graphqlAPIs/updateJobClusterDefinition'
import {Workspaces} from '../../graphqlAPIs/workspaces'
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

export interface IWorkflowsState {
  filters: {
    status: API_STATUS
    data: SelectionOnGetWorkflowFilters['data']
    error: any
  }
  recentlyVisited: {
    status: API_STATUS
    data: SelectionOnGetRecentlyVisitedWorkflows['data']
    error: any
  }
  recentlyCreated: {
    status: API_STATUS
    data: SelectionOnGetWorkflows
    error: any
  }
  workflows: {
    status: API_STATUS
    data: SelectionOnGetWorkflows
    error: any
    cancel: () => void
  }
  allWorkspaces: {
    status: API_STATUS
    data: Workspaces['workspaces']['data']
    error: any
  }
  allProjects: {
    [workspaceId: string]: {
      status: API_STATUS
      data: GetProjects['getProjects']['data']
      error: any
    }
  }
  projectCodespaces: {
    [projectId: string]: {
      status: API_STATUS
      data: GetCodespaces['getCodespaces']['data']
      error: any
    }
  }
  codespaceFolders: {
    [codespaceId: string]: {
      [folderPath: string]: {
        status: API_STATUS
        data: CodespaceFolders['codespaceFolders']['data']
        error: any
      }
    }
  }
  stopWorkflowRun: {
    status: API_STATUS
    data: SelectionOnStopWorkflowRun['data']
    error: any
  }
  runWorkflowRun: {
    status: API_STATUS
    data: SelectionOnRunWorkflowRun['data']
    error: any
  }
  deleteWorkflow: {
    status: API_STATUS
    data: SelectionOnDeleteWorkflow['data']
    error: any
  }
  pauseWorkflowSchedule: {
    status: API_STATUS
    data: SelectionOnPauseWorkflowSchedule['data']
    error: any
  }
  resumeWorkflowSchedule: {
    status: API_STATUS
    data: SelectionOnResumeWorkflowSchedule['data']
    error: any
  }
  getWorkflowYaml: {
    status: API_STATUS
    data: SelectionOnGetWorkflowYaml['data']
    error: any
  }
  createJobClusterDefinition: {
    status: API_STATUS
    data: CreateJobClusterDefinition['createJobClusterDefinition']['data']
    error: any
  }
  jobClusterDefinition: {
    status: API_STATUS
    data: JobClusterDefinition['jobClusterDefinition']['data']
    error: any
  }
  updateJobClusterDefinition: {
    status: API_STATUS
    data: UpdateJobClusterDefinition['updateJobClusterDefinition']['data']
    error: any
  }
}

const initialState: IWorkflowsState = {
  filters: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  recentlyVisited: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  recentlyCreated: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  workflows: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  allWorkspaces: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  stopWorkflowRun: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  allProjects: {},
  projectCodespaces: {},
  codespaceFolders: {},
  runWorkflowRun: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  deleteWorkflow: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  pauseWorkflowSchedule: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  resumeWorkflowSchedule: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  getWorkflowYaml: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  createJobClusterDefinition: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  jobClusterDefinition: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  updateJobClusterDefinition: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  }
}

export default function workflowsReducer(
  state = initialState,
  action
): IWorkflowsState {
  switch (action.type) {
    case SET_RECENTLY_VISITED:
      return {
        ...state,
        recentlyVisited: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_RECENTLY_CREATED:
      return {
        ...state,
        recentlyCreated: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_WORKFLOWS:
      return {
        ...state,
        workflows: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    case SET_WORKFLOW_FILTERS:
      return {
        ...state,
        filters: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }

    case SET_ALL_WORKSPACES:
      return {
        ...state,
        allWorkspaces: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_STOP_WORKFLOW_RUN:
      return {
        ...state,
        stopWorkflowRun: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_ALL_PROJECTS: {
      const {status, data, error, workspaceId} = action.payload
      const allProjects = state.allProjects || {}
      allProjects[workspaceId] = {
        status,
        data,
        error
      }

      return {
        ...state,
        allProjects: {...allProjects}
      }
    }

    case SET_PROJECT_CODESPACES: {
      const {status, data, projectId, error} = action.payload
      const projectCodespaces = state.projectCodespaces || {}
      projectCodespaces[projectId] = {
        status,
        data,
        error
      }
      return {
        ...state,
        projectCodespaces: {...projectCodespaces}
      }
    }

    case SET_CODESPACE_FOLDERS: {
      const {status, data, codespaceId, folderPath, error} = action.payload
      const codespaceFolders = state.codespaceFolders || {}
      codespaceFolders[codespaceId] = codespaceFolders[codespaceId] || {}
      codespaceFolders[codespaceId][folderPath] = {
        status,
        data,
        error
      }
      return {
        ...state,
        codespaceFolders: {...codespaceFolders}
      }
    }

    case SET_RUN_WORKFLOW_RUN:
      return {
        ...state,
        runWorkflowRun: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_DELETE_WORKFLOW:
      return {
        ...state,
        deleteWorkflow: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_DELETE_WORKFLOW:
      return {
        ...state,
        deleteWorkflow: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_PAUSE_WORKFLOW_SCHEDULE:
      return {
        ...state,
        pauseWorkflowSchedule: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_RESUME_WORKFLOW_SCHEDULE:
      return {
        ...state,
        resumeWorkflowSchedule: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_GET_WORKFLOW_YAML:
      return {
        ...state,
        getWorkflowYaml: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_WORKFLOW_YAML:
      return {
        ...state,
        getWorkflowYaml: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_CREATE_JOB_CLUSTER_DEFINITION:
      return {
        ...state,
        createJobClusterDefinition: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_JOB_CLUSTER_DEFINITION:
      return {
        ...state,
        jobClusterDefinition: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_UPDATE_JOB_CLUSTER_DEFINITION:
      return {
        ...state,
        updateJobClusterDefinition: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    default:
      return state
  }
}
