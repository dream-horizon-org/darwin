import config from 'config'
import React from 'react'
import {Redirect, Route, Switch} from 'react-router'
import IFrameData from '../../components/iFrameData'
import GoogleLoginCallback from '../../modules/login/GoogleLoginCallback'
import OldLogin from '../../modules/login/login'
import Login from '../../modules/login/login-v2'
import routeConfig from '../../route.config'
import PrivateRoute from '../privateRoute/privateRoute'

interface IProps {
  permissions: Array<string>
  currentRoute: string
}

const SwitchRoute = (props: IProps) => {
  const {permissions, currentRoute} = props
  return (
    <Switch>
      {/* ========== OPEN SOURCE MODE - LOGIN ROUTES REDIRECTED ==========
        * Login routes now redirect to dashboard to bypass authentication.
        * 
        * To re-enable login:
        * 1. Uncomment the login routes below
        * 2. Comment out the Redirect components
        * 3. Re-enable authentication in other files
        */}

      {/* COMMENTED OUT: Original login routes */}
      {/* <Route path={`/login`}>
        {config.oldLoginFlow ? <OldLogin /> : <Login />}
      </Route>
      <Route path={`/mlp-google-login-callback`}>
        <GoogleLoginCallback />
      </Route> */}

      {/* ========== OPEN SOURCE MODE - Redirect login to dashboard ========== */}
      <Route path={`/login`}>
        <Redirect to="/dashboard" />
      </Route>
      <Route path={`/mlp-google-login-callback`}>
        <Redirect to="/dashboard" />
      </Route>

      {routeConfig.map((routeObj) => (
        <PrivateRoute
          exact={routeObj.exact}
          path={`${routeObj.path}`}
          key={routeObj.key}
          component={routeObj.component}
          userPermissions={permissions}
          routePermission={routeObj.permissions}
          currentRoute={currentRoute}
        />
      ))}
    </Switch>
  )
}

export default SwitchRoute
