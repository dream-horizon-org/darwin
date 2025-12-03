import config from 'config'
import React from 'react'
import {Redirect, Route} from 'react-router-dom'

const accessibleRoute = (
  userPermissions: Array<string>,
  permissionsReq: string | Array<string>
) =>
  Array.isArray(permissionsReq)
    ? permissionsReq.some((perm) => userPermissions.includes(perm))
    : userPermissions.includes(permissionsReq)

const redirectUrl = window?.location?.href?.substr(
  window?.location?.origin?.length
)

const PrivateRoute = ({
  component: Component,
  userPermissions,
  routePermission,
  currentRoute,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => {
      /* ========== OPEN SOURCE MODE - AUTHENTICATION BYPASSED ==========
       * The following authentication checks have been commented out to allow
       * the application to run without login. Uncomment to re-enable authentication.
       */

      // COMMENTED OUT: Access token check and login redirect
      // const accessToken = localStorage.getItem('x-access-token')
      // if (!accessToken) {
      //   return (
      //     <Redirect
      //       to={{pathname: '/login', search: `returnUrl=${redirectUrl}`}}
      //     />
      //   )
      // }

      // COMMENTED OUT: Permission-based route access
      // if (routePermission === 'everyone') {
      //   return <Component {...props} />
      // }
      // if no permission defined on route or user doesn't have permission, redirect to home page
      // if (
      //   routePermission === undefined ||
      //   !userPermissions ||
      //   (userPermissions && !accessibleRoute(userPermissions, routePermission))
      // ) {
      //   return (
      //     <Redirect
      //       to={{pathname: '/login', search: `returnUrl=${redirectUrl}`}}
      //     />
      //   )
      // }

      /* ========== OPEN SOURCE MODE - All routes are now public ========== */
      return <Component {...props} />
    }}
  />
)

export default PrivateRoute
