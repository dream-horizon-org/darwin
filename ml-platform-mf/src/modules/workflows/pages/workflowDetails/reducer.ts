import {API_STATUS} from '../../../../utils/apiUtils'
import {SelectionOnGetWorkflowDetails} from '../../graphqlAPIs/getWorkflowDetails/index'
import {SelectionOnGetWorkflowPathDetails} from '../../graphqlAPIs/getWorkflowPathIds'
import {GetWorkflowRunDetails} from '../../graphqlAPIs/getWorkflowRunDetails'
import {SelectionOnGetWorkflowRuns} from '../../graphqlAPIs/getWorkflowRuns'
import {
  GetWorkflowsMetaData,
  SelectionOnGetWorkflowsMetaData
} from '../../graphqlAPIs/getWorkflowsMetaData'
import {SelectionOnData} from '../../graphqlAPIs/getWorkflowTagStatus'
import {GetWorkflowTaskDetails} from '../../graphqlAPIs/getWorkflowTaskDetails'
import {GetWorkflowTaskDetailsWithoutRun} from '../../graphqlAPIs/getWorkflowTaskDetailsWithoutRun'
import {SelectionOnRepairWorkflowRun} from '../../graphqlAPIs/repairWorkflowRun'
import {SelectionOnUpdateWorkflowMaxConcurrentRuns} from '../../graphqlAPIs/updateWorkflowMaxConcurrentRuns'
import {SelectionOnUpdateWorkflowRetries} from '../../graphqlAPIs/updateWorkflowRetries'
import {SelectionOnUpdateWorkflowSchedule} from '../../graphqlAPIs/updateWorkflowSchedule'
import {SelectionOnUpdateWorkflowTags} from '../../graphqlAPIs/updateWorkflowTags'
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

export interface IWorkflowsDetailsState {
  workflowDetails: {
    status: API_STATUS
    data: SelectionOnGetWorkflowDetails['data']
    error: any
  }
  workflowsMetaData: {
    status: API_STATUS
    data: SelectionOnGetWorkflowsMetaData['data']
    error: any
  }
  workflowStatus: {
    status: API_STATUS
    data: SelectionOnData['workflow_status']
    error: any
  }
  workflowRuns: {
    status: API_STATUS
    data: SelectionOnGetWorkflowRuns
    error: any
  }
  workflowRunDetails: {
    status: API_STATUS
    data: GetWorkflowRunDetails['getWorkflowRunDetails']['data']
    error: any
  }
  workflowTaskDetails: {
    status: API_STATUS
    data: GetWorkflowTaskDetails['getWorkflowTaskDetails']['data']
    error: any
  }
  workflowTaskDetailsWithoutRun: {
    status: API_STATUS
    data: GetWorkflowTaskDetailsWithoutRun['getWorkflowTaskDetailsWithoutRun']['data']
    error: any
  }
  updateWorkflowSchedule: {
    status: API_STATUS
    data: SelectionOnUpdateWorkflowSchedule['data']
    error: any
  }
  updateWorkflowRetries: {
    status: API_STATUS
    data: SelectionOnUpdateWorkflowRetries['data']
    error: any
  }
  updateWorkflowConcurrentRuns: {
    status: API_STATUS
    data: SelectionOnUpdateWorkflowMaxConcurrentRuns['data']
    error: any
  }
  updateWorkflowTags: {
    status: API_STATUS
    data: SelectionOnUpdateWorkflowTags['data']
    error: any
  }
  repairRun: {
    status: API_STATUS
    data: SelectionOnRepairWorkflowRun['data']
    error: any
  }
  workflowPathIds: {
    status: API_STATUS
    data: SelectionOnGetWorkflowPathDetails['data']
    error: any
  }
}

const initialState: IWorkflowsDetailsState = {
  workflowDetails: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  workflowsMetaData: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  workflowStatus: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  workflowRuns: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  workflowRunDetails: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  workflowTaskDetails: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  workflowTaskDetailsWithoutRun: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  updateWorkflowSchedule: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  updateWorkflowRetries: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  updateWorkflowConcurrentRuns: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  updateWorkflowTags: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  repairRun: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  workflowPathIds: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  }
}

export default function workflowDetailsReducer(
  state = initialState,
  action
): IWorkflowsDetailsState {
  switch (action.type) {
    case SET_WORKFLOW_DETAILS:
      return {
        ...state,
        workflowDetails: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_WORKFLOW_STATUS:
      return {
        ...state,
        workflowStatus: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_WORKFLOWS_META_DATA:
      return {
        ...state,
        workflowsMetaData: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_WORKFLOW_DETAILS:
      return {
        ...state,
        workflowDetails: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_WORKFLOW_RUNS:
      return {
        ...state,
        workflowRuns: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_WORKFLOW_RUNS:
      return {
        ...state,
        workflowRuns: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_WORKFLOW_RUN_DETAILS:
      return {
        ...state,
        workflowRunDetails: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_WORKFLOW_RUN_DETAILS:
      return {
        ...state,
        workflowRunDetails: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_WORKFLOW_TASK_DETAILS:
      return {
        ...state,
        workflowTaskDetails: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }

    case SET_WORKFLOW_PATH_IDS:
      return {
        ...state,
        workflowPathIds: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_WORKFLOW_TASK_DETAILS:
      return {
        ...state,
        workflowTaskDetails: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }

    case SET_WORKFLOW_TASK_DETAILS_WITHOUT_RUN:
      return {
        ...state,
        workflowTaskDetailsWithoutRun: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_WORKFLOW_TASK_DETAILS_WITHOUT_RUN:
      return {
        ...state,
        workflowTaskDetailsWithoutRun: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_UPDATE_WORKFLOW_SCHEDULE:
      return {
        ...state,
        updateWorkflowSchedule: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_UPDATE_WORKFLOW_SCHEDULE:
      return {
        ...state,
        updateWorkflowSchedule: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_UPDATE_WORKFLOW_RETRIES:
      return {
        ...state,
        updateWorkflowRetries: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_UPDATE_WORKFLOW_RETRIES:
      return {
        ...state,
        updateWorkflowRetries: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_UPDATE_WORKFLOW_CONCURRENT_RUNS:
      return {
        ...state,
        updateWorkflowConcurrentRuns: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_UPDATE_WORKFLOW_CONCURRENT_RUNS:
      return {
        ...state,
        updateWorkflowConcurrentRuns: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_UPDATE_WORKFLOW_TAGS:
      return {
        ...state,
        updateWorkflowTags: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_UPDATE_WORKFLOW_TAGS:
      return {
        ...state,
        updateWorkflowTags: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_REPAIR_RUN:
      return {
        ...state,
        repairRun: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_REPAIR_RUN:
      return {
        ...state,
        repairRun: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    default:
      return state
  }
}
