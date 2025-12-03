import React from 'react'
import {Route, Switch, useLocation} from 'react-router'
import {routes} from '../../constants'
import {Navigator} from './components'
import {
  RuntimeCreationPage,
  RuntimeDetailsPage,
  RuntimesListingPage
} from './pages/runtimes'
const Settings = () => {
  return (
    <Navigator
      title='Settings'
      routes={[
        {
          name: 'Runtimes',
          path: '/settings/runtimes',
          component: <RuntimesListingPage />,
          subRoutes: [
            {
              name: 'Runtime Details',
              path: '/settings/runtimes/details/:runtimeName',
              component: <RuntimeDetailsPage />
            },
            {
              name: 'Runtime Create',
              path: '/settings/runtimes/create',
              component: <RuntimeCreationPage />
            }
          ]
        }
      ]}
    />
  )
}

export default Settings
