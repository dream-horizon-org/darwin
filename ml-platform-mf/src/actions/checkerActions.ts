import {
  SET_APPROVE_CONTEST,
  SET_CHECKER_NAV,
  SET_REJECT_ERROR,
  SET_REJECT_OBJECT,
  SET_SELECTED_CONTEST,
  TOGGLE_CONFIRMATION_DIALOG
} from '../constants'

export function setSelectedContest(value) {
  return {
    type: SET_SELECTED_CONTEST,
    value
  }
}

export function setCheckerNav(value) {
  return {
    type: SET_CHECKER_NAV,
    value
  }
}

export function setApproveContest(value) {
  return {
    type: SET_APPROVE_CONTEST,
    value
  }
}

export function toggleConfirmationDialog(value) {
  return {
    type: TOGGLE_CONFIRMATION_DIALOG,
    value
  }
}

export function setRejectObject(value) {
  return {
    type: SET_REJECT_OBJECT,
    value
  }
}

export function setRejectErrorMessage(value) {
  return {
    type: SET_REJECT_ERROR,
    value
  }
}
