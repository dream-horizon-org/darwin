import {datadogRum, DefaultPrivacyLevel} from '@datadog/browser-rum'
import config from 'config'
import {History} from 'history'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {ErrorBoundary} from 'react-error-boundary'
import {BrowserRouter, Router} from 'react-router-dom'
import packageJson from '../package.json'
import App from './app/app'
import ErrorPage from './components/errorPage'
import {headTagHtml} from './head-tag'

const addDatadogRum = () => {
  if (config.DATADOG_TRACE_ENV !== 'prod') return

  // pick version from package.json
  const version = packageJson?.version || '0.0.0'

  datadogRum.init({
    applicationId: process.env.DATADOG_APP_ID || 'your-datadog-app-id',
    clientToken: process.env.DATADOG_CLIENT_TOKEN || 'your-datadog-client-token',
    // `site` refers to the Datadog site parameter of your organization
    // see https://docs.datadoghq.com/getting_started/site/
    site: 'datadoghq.com',
    service: 'darwin.example.com',
    env: config.DATADOG_TRACE_ENV,
    // Specify a version number to identify the deployed version of your application in Datadog
    version: version,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    defaultPrivacyLevel: DefaultPrivacyLevel.ALLOW
  })
}

addDatadogRum()

export interface MicroFeWindow extends Window {
  rendermlplatform?: (containerId: string, history: History) => void
  headTagsmlplatform?: string
  unmountmlplatform?: (containerId: string) => void
  microEnv?: boolean
  getOtherScript?: () => void
}

const _window: MicroFeWindow = window
_window.rendermlplatform = (containerId: string, history: History) => {
  render(
    <React.StrictMode>
      <Router history={history}>
        <App />
      </Router>
    </React.StrictMode>,
    document.getElementById(`${containerId}`)
  )
}

_window.headTagsmlplatform = headTagHtml

_window.unmountmlplatform = (containerId: string) => {
  unmountComponentAtNode(document.getElementById(containerId) as any)
}

/* ========== OPEN SOURCE MODE - AUTO-INITIALIZE DUMMY AUTHENTICATION ==========
 * The following code automatically sets dummy authentication tokens in localStorage
 * to bypass login requirements. This allows the application to work without authentication.
 * 
 * To re-enable authentication:
 * 1. Comment out the initializeOpenSourceMode() function call below
 * 2. Uncomment the authentication code in other files (see comments marked with OPEN SOURCE MODE)
 * 3. Ensure your authentication backend is properly configured
 */
const initializeOpenSourceMode = () => {
  // Set dummy tokens to bypass auth checks in the application
  if (!localStorage.getItem('x-access-token')) {
    localStorage.setItem('x-access-token', 'open-source-dummy-token')
  }
  if (!localStorage.getItem('x-refresh-token')) {
    localStorage.setItem('x-refresh-token', 'open-source-dummy-refresh-token')
  }
  // Set all permissions to allow access to all features
  if (!localStorage.getItem('x-permissions')) {
    localStorage.setItem('x-permissions', JSON.stringify(['*']))
  }
  // Set dummy user details that will appear in the UI
  if (!localStorage.getItem('x-user-details')) {
    localStorage.setItem(
      'x-user-details',
      JSON.stringify({
        userId: 1,
        name: 'Open Source User',
        email: 'opensource@darwin.com',
        role: 'admin',
        active: true
      })
    )
  }
}

if (!_window.microEnv) {
  /* ========== OPEN SOURCE MODE - Initialize dummy auth before rendering ==========
   * Comment out this line to disable automatic authentication bypass
   */
  initializeOpenSourceMode()
  
  render(
    <ErrorBoundary fallback={<ErrorPage />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>,
    document.getElementById('app')
  )
}
