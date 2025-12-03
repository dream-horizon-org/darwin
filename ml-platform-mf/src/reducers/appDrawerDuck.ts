import {createAction, SFA} from '../utils/createAction'
import {menu} from '../utils/menuConstants'
// Constants
export enum AppDrawerActionTypes {
  TOGGLE_APP_DRAWER = 'TOGGLE_APP_DRAWER',
  SET_APP_CONTEXT = 'SET_APP_CONTEXT',
  SET_MENU = 'SET_MENU',
  SET_DEFAULT_APP_CONTEXT = 'SET_DEFAULT_APP_CONTEXT',
  SET_SIDE_NAV_STATE = 'SET_SIDE_NAV_STATE'
}
type createAction = <T extends AppDrawerActionTypes, P>(
  type: T,
  payload?: P
) => SFA<T, P>
// Actions
export const toggleAppDrawerToggle = (value: unknown) =>
  (createAction as createAction)(AppDrawerActionTypes.TOGGLE_APP_DRAWER, value)
export const setAppContext = (value: unknown) =>
  (createAction as createAction)(AppDrawerActionTypes.SET_APP_CONTEXT, value)
export const setMenu = (value: unknown) =>
  (createAction as createAction)(AppDrawerActionTypes.SET_MENU, value)
export const setDefaultAppContext = (value: {
  appContext: unknown
  menu: unknown
}) =>
  (createAction as createAction)(
    AppDrawerActionTypes.SET_DEFAULT_APP_CONTEXT,
    value
  )
export const sideNavState = (value: unknown) =>
  (createAction as createAction)(AppDrawerActionTypes.SET_SIDE_NAV_STATE, value)

export const actions = {
  toggleAppDrawerToggle,
  setAppContext,
  setMenu,
  setDefaultAppContext,
  sideNavState
}
// Thunk

export const getMenu = (slug) => (dispatch) => {
  return dispatch(setMenu(menu[slug]))
}
// Reducer
type Action = ReturnType<typeof actions[keyof typeof actions]>
const appDrawerReducer = (state = {}, action: Action) => {
  switch (action.type) {
    case AppDrawerActionTypes.TOGGLE_APP_DRAWER:
      return {...state, appDrawerToggle: action.payload}
    case AppDrawerActionTypes.SET_MENU:
      return {...state, menu: action.payload}
    case AppDrawerActionTypes.SET_APP_CONTEXT:
      return {...state, appContext: action.payload}
    case AppDrawerActionTypes.SET_DEFAULT_APP_CONTEXT:
      return {
        ...state,
        appContext: action.payload.appContext,
        menu: action.payload.menu
      }
    case AppDrawerActionTypes.SET_SIDE_NAV_STATE:
      return {...state, sideNavState: action.payload}
    default:
      return state
  }
}

export default appDrawerReducer
