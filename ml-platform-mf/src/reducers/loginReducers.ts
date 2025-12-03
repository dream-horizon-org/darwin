import {
  OTP_SCREEN,
  SET_OTP,
  SET_PASSWORD,
  SET_USERNAME,
  SET_USER_PERMISSIONS,
  SET_USID
} from '../constants'

const showOtpScreen = (state = false, action) => {
  if (action.type === OTP_SCREEN) {
    return action.value
  }
  return state
}

const usId = (state = '', action) => {
  if (action.type === SET_USID) {
    return action.value
  }
  return state
}

const username = (state = '', action) => {
  if (action.type === SET_USERNAME) {
    return action.value
  }
  return state
}

const password = (state = '', action) => {
  if (action.type === SET_PASSWORD) {
    return action.value
  }
  return state
}

const otp = (state = '', action) => {
  if (action.type === SET_OTP) {
    return action.value
  }
  return state
}

const userPermissions = (state = '', action) => {
  if (action.type === SET_USER_PERMISSIONS) {
    return action.value
  }
  return state
}

export interface LoginState {
  showOtpScreen: ReturnType<typeof showOtpScreen>
  usId: ReturnType<typeof usId>
  username: ReturnType<typeof username>
  password: ReturnType<typeof password>
  otp: ReturnType<typeof otp>
  userPermissions: ReturnType<typeof userPermissions>
}

export default {showOtpScreen, usId, username, password, otp, userPermissions}
