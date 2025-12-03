import {HTMLAttributeAnchorTarget} from 'react'

export const OTP_SCREEN = 'OTP_SCREEN'
export const SET_USERNAME = 'SET_USERNAME'
export const SET_PASSWORD = 'SET_PASSWORD'
export const SET_OTP = 'SET_OTP'
export const SET_USER_PERMISSIONS = 'SET_USER_PERMISSIONS'
export const SET_USID = 'SET_USID'
export const SET_MSD_USER_INFO_DETAILS = 'SET_MSD_USER_INFO_DETAILS'
export const SET_SNACKBAR = 'SET_SNACKBAR'
export const SET_LOADING = 'SET_LOADING'
export const SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN'
export const SET_REFRESH_TOKEN = 'SET_REFRESH_TOKEN'
export const TOGGLE_FULL_DIALOG = 'TOGGLE_FULL_DIALOG'
export const SET_HEADING = 'SET_HEADING'
export const SET_ACTIVE_ROUTE = 'SET_ACTIVE_ROUTE'
export const SET_APPROVE_CONTEST = 'SET_APPROVE_CONTEST'
export const SET_CHECKER_NAV = 'SET_CHECKER_NAV'
export const SET_REJECT_ERROR = 'SET_REJECT_ERROR'
export const SET_REJECT_OBJECT = 'SET_REJECT_OBJECT'
export const SET_SELECTED_CONTEST = 'SET_SELECTED_CONTEST'
export const TOGGLE_CONFIRMATION_DIALOG = 'TOGGLE_CONFIRMATION_DIALOG'
export const SET_GLOBAL_SNACKBAR = 'SET_GLOBAL_SNACKBAR'
export const SET_SIDE_NAV_VISIBLE = 'SET_SIDE_NAV_VISIBLE'
export const SET_TOP_NAV_VISIBLE = 'SET_TOP_NAV_VISIBLE'
export const SET_SHOW_GLOBAL_SPINNER = 'SET_SHOW_GLOBAL_SPINNER'
export const SET_DIALOG_CONFIG = 'SET_DIALOG_CONFIG'

export const asyncAutoSuggestDefaultProps = {
  input: {
    onBlur: () => {},
    name: '',
    onDragStart: () => {},
    onDrop: () => {},
    onFocus: () => {}
  },
  meta: {
    autofilled: false,
    asyncValidating: false,
    dirty: false,
    dispatch: {type: null},
    form: '',
    initial: null,
    invalid: false,
    pristine: false,
    submitting: false,
    submitFailed: false,
    touched: false,
    valid: false,
    visited: false
  }
}

export const routes = {
  welecomePage: '/dashboard',
  featureJobsListingPage: '/features',
  featureJobDetailsPage: '/features/:featureGroupName/:version/details',
  compute: '/clusters',
  clusterCreatePage: '/create/cluster',
  clusterDetailsPage: '/compute/details',
  clusterEditPage: '/clusters/:clusterId/:tab',
  workspace: '/workspace',
  sharedWorkspace: '/workspace/:pId/:cId',
  featureGroupList: '/store',
  feature: '/store/:id/:version/:type/:tab',
  workflows: '/workflows',
  workflowDetails: '/workflows/:workflowId/:tab',
  createWorkflow: '/workflows/create',
  editWorkflow: '/workflows/:workflowId/edit',
  experiments: '/experimentation',
  models: '/models',
  settings: '/settings',
  edgeModels: '/edge-models',
  edgeModelDetails: '/edge-models/info/:deploymentId',
  edgeModelCreate: '/edge-models/create/:type',
  edgeModelEdit: '/edge-models/edit/:deploymentId'
}

export const headerStaticLinks: {
  name: string
  link: string
  target: HTMLAttributeAnchorTarget | undefined
}[] = [
  {
    name: 'DOCS',
    link: 'https://sporta-technologies-private-limi.gitbook.io/darwin/AsBV8aJtrgybhZsDfvZh',
    target: '_blank'
  },
  {
    name: 'FEEDBACK',
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSe4PlpoAVrIiCfgyOGaONV94TRvOMvMothfiDAmV2st_sFS0A/viewform',
    target: '_blank'
  }
]
