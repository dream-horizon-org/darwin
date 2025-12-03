import {API_STATUS} from '../../../../utils/apiUtils'
import {SelectionOnData as SelectionOnGetFeatureGroupFilters} from '../../graphqlAPIs/getFeatureGroupFilters'
import {SelectionOnData as SelectionOnGetFeatureGroups} from '../../graphqlAPIs/getFeatureGroups'
import {SelectionOnGetFeatureGroupsCount} from '../../graphqlAPIs/getFeatureGroupsCount'
import {
  SET_FEATURE_GROUPS,
  SET_FEATURE_GROUPS_COUNT,
  SET_FEATURE_GROUP_FILTERS
} from './constants'

export interface IFeatureGroupsState {
  featureGroups: {
    status: API_STATUS
    data: Array<SelectionOnGetFeatureGroups | null> | null
    error: any
    totalRecordsCount: number
    cancel?: () => void
  }
  featureGroupFilters: {
    status: API_STATUS
    data: Array<SelectionOnGetFeatureGroupFilters | null> | null
    error: any
  }
  featureGroupsCount: {
    status: API_STATUS
    data: SelectionOnGetFeatureGroupsCount['data']
    error: any
  }
}

const initialState: IFeatureGroupsState = {
  featureGroups: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    totalRecordsCount: 0
  },
  featureGroupFilters: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  featureGroupsCount: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  }
}

// Use the initialState as a default value
export default function featureGroupsReducer(
  state = initialState,
  action
): IFeatureGroupsState {
  // The reducer normally looks at the action type field to decide what happens
  switch (action.type) {
    // Do something here based on the different types of actions
    case SET_FEATURE_GROUPS: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        featureGroups: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          totalRecordsCount:
            action.payload.totalRecordsCount ||
            action.payload.totalRecordsCount,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_FEATURE_GROUP_FILTERS: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        featureGroupFilters: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_FEATURE_GROUPS_COUNT: {
      return {
        ...state,
        featureGroupsCount: {
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
