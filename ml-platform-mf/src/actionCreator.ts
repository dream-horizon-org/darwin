import {
  setAccessToken,
  setLoading,
  setRefreshToken
} from './actions/commonActions'
import {setUserPermissions} from './actions/loginActions'
import {IUserDetails} from './components/login/login.thunk'

export const clearAccessTokenFromLS = () => (dispatch) =>
  new Promise((resolve) => {
    localStorage.removeItem('x-access-token')
    localStorage.removeItem('x-permissions')
    localStorage.removeItem('x-user-details')
    localStorage.removeItem('x-refresh-token')
    dispatch(setLoading(false))
    dispatch(setAccessToken(null))
    dispatch(setUserPermissions([]))
    resolve({})
  })

export const updateAccessAndRefreshToken =
  (
    userDetails: {
      accessToken: string
      refreshToken: string
    },
    callback = () => {}
  ) =>
  (dispatch) =>
    new Promise((resolve) => {
      localStorage.setItem('x-access-token', userDetails.accessToken)
      localStorage.setItem('x-refresh-token', userDetails.refreshToken)
      resolve(userDetails)
    }).then((userDetails: IUserDetails) => {
      dispatch(setAccessToken(userDetails.accessToken))
      dispatch(setRefreshToken(userDetails.refreshToken))
      callback()
    })
