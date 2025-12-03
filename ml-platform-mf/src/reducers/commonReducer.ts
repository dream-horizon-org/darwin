import {
  SET_DIALOG_CONFIG,
  SET_GLOBAL_SNACKBAR,
  SET_MSD_USER_INFO_DETAILS,
  SET_SHOW_GLOBAL_SPINNER,
  SET_SIDE_NAV_VISIBLE,
  SET_SNACKBAR,
  SET_TOP_NAV_VISIBLE
} from '../constants'
import computeReducer from '../modules/compute/pages/graphqlApis/reducer'
import edgeModelsReducer from '../modules/edgeModels/data/reducer'
import featureGroupDetailsReducer from '../modules/featureStoreV2/pages/featureStoreGroupDetails/reducer'
import featureGroupsReducer from '../modules/featureStoreV2/pages/featureStoreGroups/reducer'
import workflowCreateReducer from '../modules/workflows/pages/workflowCreate/reducer'
import workflowDetailsReducer from '../modules/workflows/pages/workflowDetails/reducer'
import workflowEditReducer from '../modules/workflows/pages/workflowEdit/reducer'
import workflowsReducer from '../modules/workflows/pages/workflows/reducer'
import workspaceProjectReducer from '../modules/workspace/pages/reducer'
import appDrawerDuck from './appDrawerDuck'

const msdUserInfoDetails = (state = {}, action) => {
  const {type, value} = action
  if (type === SET_MSD_USER_INFO_DETAILS) {
    return value
  }
  return state
}

const snackbar = (state = {}, action) => {
  if (action.type === SET_SNACKBAR) {
    return action.value
  }
  return state
}

export enum SnackbarType {
  SUCCESS,
  ERROR
}

export interface IGlobalSnackBarConfig {
  open: boolean
  message: string
  type: SnackbarType
}

interface IDialogConfig {
  title: string
  open: boolean
  message: string
  primaryBtnText: string
  secondaryBtnText: string
  onClose: () => void
  onPrimaryBtnClicked: () => void
  onSecondaryBtnClicked: () => void
  dataTestId?: string
}

export interface ICommonState {
  globalSnackBar: IGlobalSnackBarConfig
  sideNavVisible: boolean
  topNavVisible: boolean
  showGlobalSpinner: boolean
  dialogConfig: IDialogConfig
}

export const defaultDialogConfig: IDialogConfig = {
  title: '',
  open: false,
  message: '',
  primaryBtnText: '',
  secondaryBtnText: '',
  onClose: () => {},
  onPrimaryBtnClicked: () => {},
  onSecondaryBtnClicked: () => {}
}

const commonInitialState: ICommonState = {
  globalSnackBar: {
    open: false,
    message: '',
    type: null
  },
  sideNavVisible: true,
  topNavVisible: true,
  showGlobalSpinner: false,
  dialogConfig: defaultDialogConfig
}

const commonReducer = (state = commonInitialState, action): ICommonState => {
  switch (action.type) {
    case SET_GLOBAL_SNACKBAR: {
      // We need to return a new state object
      return {
        // that has all the existing state data
        ...state,
        // but has a new array for the `todos` field
        globalSnackBar: action.payload
      }
    }
    case SET_TOP_NAV_VISIBLE: {
      return {
        ...state,
        sideNavVisible: action.payload
      }
    }
    case SET_SIDE_NAV_VISIBLE: {
      return {
        ...state,
        topNavVisible: action.payload
      }
    }
    case SET_SHOW_GLOBAL_SPINNER: {
      return {
        ...state,
        showGlobalSpinner: action.payload
      }
    }
    case SET_DIALOG_CONFIG: {
      return {
        ...state,
        dialogConfig: action.payload
      }
    }
    default:
      return state
  }
}

export interface CommonState {
  snackbar: ReturnType<typeof snackbar>
  msdUserInfoDetails: ReturnType<typeof msdUserInfoDetails>
  workspaceProjectReducer: ReturnType<typeof workspaceProjectReducer>
  featureGroupsReducer: ReturnType<typeof featureGroupsReducer>
  featureGroupDetailsReducer: ReturnType<typeof featureGroupDetailsReducer>
  computeReducer: ReturnType<typeof computeReducer>
  commonReducer: ReturnType<typeof commonReducer>
  appDrawerDuck: ReturnType<typeof appDrawerDuck>
  workflowsReducer: ReturnType<typeof workflowsReducer>
  workflowDetailsReducer: ReturnType<typeof workflowDetailsReducer>
  workflowCreateReducer: ReturnType<typeof workflowCreateReducer>
  workflowEditReducer: ReturnType<typeof workflowEditReducer>
  edgeModelsReducer: ReturnType<typeof edgeModelsReducer>
}

export default {
  msdUserInfoDetails,
  snackbar,
  workspaceProjectReducer,
  featureGroupsReducer,
  featureGroupDetailsReducer,
  computeReducer,
  commonReducer,
  appDrawerDuck,
  workflowsReducer,
  workflowDetailsReducer,
  workflowCreateReducer,
  workflowEditReducer,
  edgeModelsReducer
}
