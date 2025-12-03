import {API_STATUS} from '../../../../utils/apiUtils'
import {SelectionOnUpdateWorkflow} from '../../graphqlAPIs/updateWorkflow'
import {RESET_UPDATE_WORKFLOW, SET_UPDATE_WORKFLOW} from './constants'

export interface IWorkflowEditState {
  updateWorkflow: {
    status: API_STATUS
    data: SelectionOnUpdateWorkflow['data']
    error: any
  }
}

const initialState: IWorkflowEditState = {
  updateWorkflow: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  }
}

export default function workflowEditReducer(
  state = initialState,
  action
): IWorkflowEditState {
  switch (action.type) {
    case SET_UPDATE_WORKFLOW:
      return {
        ...state,
        updateWorkflow: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_UPDATE_WORKFLOW:
      return {
        ...state,
        updateWorkflow: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    default:
      return state
  }
}
