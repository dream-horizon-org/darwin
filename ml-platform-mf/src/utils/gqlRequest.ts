import config from 'config'
import {
  clearAccessTokenFromLS,
  updateAccessAndRefreshToken
} from '../actionCreator'
import {setSelectedContest} from '../actions/checkerActions'
import {
  setLoading,
  setSnackBar,
  toggleFullDialog
} from '../actions/commonActions'
import {refreshTokenGql} from '../components/login/refreshTokenGql'
import store from '../store'

// showError is for not showing GQL errors (used for sub api's)
export const gqlRequest = (
  name,
  query,
  variables,
  previousResolve = null,
  showError = true
) => {
  /* ========== OPEN SOURCE MODE - AUTHENTICATION HEADERS REMOVED ==========
   * Authentication headers have been commented out to allow GraphQL requests
   * without authentication. Uncomment to re-enable authentication.
   */

  // COMMENTED OUT: Authentication headers
  // const skipTokenValidation = ['loginGQL']
  // const headers = {
  //   'content-type': 'application/json',
  //   'x-access-token': localStorage.getItem('x-access-token'),
  //   'x-skip-validation': '' + skipTokenValidation.includes(name)
  // }

  /* ========== OPEN SOURCE MODE - Headers without authentication ========== */
  const headers = {
    'content-type': 'application/json'
  }

  const redirectUrl = window.location.href.substr(window.location.origin.length)
  return new Promise((resolve) => {
    return fetch(config.uiConfig.gqlUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({query, variables}),
      credentials: 'include'
    })
      .then((response) => {
        /* ========== OPEN SOURCE MODE - TOKEN REFRESH LOGIC REMOVED ==========
         * The following refresh token logic has been commented out.
         * Uncomment to re-enable automatic token refresh on 403 errors.
         */

        // COMMENTED OUT: Refresh token logic on 403 error
        // if (!response.ok) {
        //   // create error object and reject if not a 2xx response code
        //   if (response.status === 403) {
        //     fetch(config.uiConfig.gqlUrl, {
        //       method: 'POST',
        //       headers: {
        //         'content-type': 'application/json',
        //         'x-refresh-token': localStorage.getItem('x-refresh-token'),
        //         'x-skip-validation': 'true'
        //       },
        //       body: JSON.stringify({query: refreshTokenGql, variables: {}}),
        //       credentials: 'include'
        //     })
        //       .then((res) => res.json())
        //       .then(
        //         (data) =>
        //           data as {
        //             errors?: Array<{
        //               status?: number
        //               code?: unknown
        //               message: string
        //               error?: {code: number; msg: unknown; message: string}
        //             }>
        //             data?: {
        //               refreshToken: {
        //                 accessToken: string
        //                 refreshToken: string
        //                 userId: number
        //                 code: string
        //               }
        //             }
        //           }
        //       )
        //       .then((refreshTokenResponse) => {
        //         // TODO Refactor this code
        //         if (
        //           refreshTokenResponse.errors &&
        //           refreshTokenResponse.errors[0] &&
        //           refreshTokenResponse.errors[0].message &&
        //           refreshTokenResponse.errors[0].message.indexOf('401') > -1
        //         ) {
        //           store.dispatch(
        //             setSnackBar({
        //               open: true,
        //               message: refreshTokenResponse.errors[0].message
        //             })
        //           )
        //           store.dispatch(clearAccessTokenFromLS())
        //           if (window.location.pathname !== '/login/') {
        //             window.location.href = `${window.location.origin.toString()}/login?returnUrl=${redirectUrl}`
        //           }
        //         } else if (refreshTokenResponse?.data?.refreshToken) {
        //           store.dispatch(
        //             updateAccessAndRefreshToken(
        //               refreshTokenResponse?.data?.refreshToken,
        //               () => {
        //                 gqlRequest(name, query, variables, resolve)
        //               }
        //             )
        //           )
        //         }
        //       })
        //   } else {
        //     return response
        //   }
        // } else {
        //   return response
        // }

        /* ========== OPEN SOURCE MODE - Direct response without auth checks ========== */
        return response
      })
      .then((res) => (res && res.json ? res.json() : {errors: {code: 401}}))
      .then((data: any) => {
        if (data?.errors?.code === 401) {
          return null
        }
        // Refactor this code
        if (
          showError &&
          data.errors &&
          (data.errors[0].status === 500 ||
            data.errors[0].status === 400 ||
            data.errors[0].status === 422 ||
            data.errors[0].code === 500 ||
            data.errors[0].code === 400 ||
            (data.errors[0] &&
              data.errors[0].error &&
              (data.errors[0].error.code === 500 ||
                data.errors[0].error.code === 400)) ||
            data.errors[0].message)
        ) {
          store.dispatch(setLoading(false))
          store.dispatch(setSelectedContest({loading: false}))
          store.dispatch(toggleFullDialog(false))
          setTimeout(() => {
            store.dispatch(
              setSnackBar({
                open: true,
                message:
                  data.errors[0].message ||
                  data.errors[0].error.msg ||
                  data.errors[0].error.message
              })
            )
          }, 100)
        }
        if (previousResolve) {
          previousResolve(data)
          resolve(data)
        } else {
          resolve(data)
        }
      })
  })
}
