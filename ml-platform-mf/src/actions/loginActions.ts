import {SET_USER_PERMISSIONS} from '../constants'

export function setUserPermissions(value) {
  return {
    type: SET_USER_PERMISSIONS,
    value
  }
}
