import {
  SET_ACCESS_TOKEN,
  SET_ACTIVE_ROUTE,
  SET_DIALOG_CONFIG,
  SET_GLOBAL_SNACKBAR,
  SET_HEADING,
  SET_LOADING,
  SET_MSD_USER_INFO_DETAILS,
  SET_REFRESH_TOKEN,
  SET_SHOW_GLOBAL_SPINNER,
  SET_SIDE_NAV_VISIBLE,
  SET_SNACKBAR,
  SET_TOP_NAV_VISIBLE,
  TOGGLE_FULL_DIALOG
} from '../constants'
import {ICommonState, IGlobalSnackBarConfig} from '../reducers/commonReducer'

export function getAppContext(val) {
  if (val.includes('fantasy')) {
    return 'fantasy'
  } else if (val.includes('fancode')) {
    return 'fancode'
  } else if (val.includes('marketing')) {
    return 'marketing'
  } else if (val.includes('customerSupport')) {
    return 'customerSupport'
  } else if (val.includes('mlplatform')) {
    return 'mlplatform'
  }
}

export const setMsdUserInfoDetails = (value) => ({
  type: SET_MSD_USER_INFO_DETAILS,
  value
})

export function setSnackBar(value) {
  return {
    type: SET_SNACKBAR,
    value
  }
}

export function setLoading(value) {
  return {
    type: SET_LOADING,
    value
  }
}

export function setAccessToken(value) {
  return {
    type: SET_ACCESS_TOKEN,
    value
  }
}

export function setRefreshToken(value: string) {
  return {
    type: SET_REFRESH_TOKEN,
    value
  }
}

export function toggleFullDialog(value) {
  return {
    type: TOGGLE_FULL_DIALOG,
    value
  }
}

export function setHeading(value: string) {
  return {
    type: SET_HEADING,
    value
  }
}

export function setActiveRoute(value) {
  return {
    type: SET_ACTIVE_ROUTE,
    value
  }
}

export const setGlobalSnackBar = (payload: IGlobalSnackBarConfig) => {
  return {
    type: SET_GLOBAL_SNACKBAR,
    payload
  }
}

export function setTopNavVisible(value: boolean) {
  return {
    type: SET_TOP_NAV_VISIBLE,
    payload: value
  }
}

export function setSideNavVisible(value: boolean) {
  return {
    type: SET_SIDE_NAV_VISIBLE,
    payload: value
  }
}

export function setShowGlobalSpinner(value: boolean) {
  return {
    type: SET_SHOW_GLOBAL_SPINNER,
    payload: value
  }
}

export function setDialogConfig(value: ICommonState['dialogConfig']) {
  return {
    type: SET_DIALOG_CONFIG,
    payload: value
  }
}
