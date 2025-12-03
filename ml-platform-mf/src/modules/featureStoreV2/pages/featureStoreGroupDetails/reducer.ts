import {API_STATUS} from '../../../../utils/apiUtils'
import {SelectionOnGetFeatureGroupDetails} from '../../graphqlAPIs/getFeatureGroupDetails'
import {SelectionOnGetFeatureGroupEntities} from '../../graphqlAPIs/getFeatureGroupEntities'
import {SelectionOnGetFeatureGroupRuns} from '../../graphqlAPIs/getFeatureGroupRuns'
import {GetFeatures} from '../../graphqlAPIs/getFeatures'
import {SelectionOnData as SelectionOnProdUsageList} from '../../graphqlAPIs/getProdUsageList'
import {
  SET_FEATURES,
  SET_FEATURE_COPY_CODES,
  SET_FEATURE_GROUP_DETAILS,
  SET_FEATURE_GROUP_ENTITIES,
  SET_FEATURE_GROUP_RUNS,
  SET_PROD_USAGE_LIST,
  SET_SELECTED_FEATURES
} from './constants'

export interface IFeatureGroupDetailsState {
  featureGroupDetails: {
    status: API_STATUS
    data: SelectionOnGetFeatureGroupDetails['data']
    error: any
  }
  features: {
    status: API_STATUS
    data: GetFeatures['getFeatures']['data']
    error: any
    totalRecordsCount: number
    cancel?: () => void
  }
  prodUsageList: {
    status: API_STATUS
    data: Array<SelectionOnProdUsageList | null> | null
    error: any
  }
  featureCopyCodes: {
    status: API_STATUS
    data: string | null
    error: any
  }
  selectedFeatures: GetFeatures['getFeatures']['data']
  featureGroupEntities: {
    status: API_STATUS
    data: SelectionOnGetFeatureGroupEntities['data']
    error: any
  }
  featureGroupRuns: {
    status: API_STATUS
    data: SelectionOnGetFeatureGroupRuns['data']
    error: any
  }
}

const initialState: IFeatureGroupDetailsState = {
  featureGroupDetails: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  features: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    totalRecordsCount: 0
  },
  prodUsageList: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  featureCopyCodes: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  selectedFeatures: [],
  featureGroupEntities: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  featureGroupRuns: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  }
}

// Use the initialState as a default value
export default function featureGroupDetailsReducer(
  state = initialState,
  action
): IFeatureGroupDetailsState {
  // The reducer normally looks at the action type field to decide what happens
  switch (action.type) {
    // Do something here based on the different types of actions
    case SET_FEATURES: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        features: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          totalRecordsCount:
            action.payload.totalRecordsCount === null
              ? state.features.totalRecordsCount
              : action.payload.totalRecordsCount,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_FEATURE_GROUP_DETAILS: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        featureGroupDetails: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_PROD_USAGE_LIST: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        prodUsageList: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_FEATURE_COPY_CODES: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        featureCopyCodes: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_SELECTED_FEATURES: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        selectedFeatures: action.payload
      }
    }
    case SET_FEATURE_GROUP_ENTITIES: {
      return {
        ...state,
        featureGroupEntities: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    }
    case SET_FEATURE_GROUP_RUNS: {
      return {
        ...state,
        featureGroupRuns: {
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
