import config from 'config'
import * as React from 'react'
import {useEffect, useState} from 'react'
import {useHistory} from 'react-router'
import {toast} from 'react-tiny-toast'
import {EventTypes, SeverityTypes} from '../../types/events.types'
import {logEvent} from '../../utils/events'
import CircleLoader from './circleLoader'
import DarwinLogo from './darwinLogo'
import DarwinTextLogo from './darwinTextLogo'
import DarwinTrophyLogo from './darwinTrophyLogo'
import GoogleLoginLogo from './googleLoginLogo'
import useStyles from './login-v2Jss'
import buttonJss from './loginButton.jss'
import loginGqlRequest from './loginGqlRequest'
import {getQuote, quotes} from './loginQuotes'
import {handleLoginSuccess} from './utils'

export type GQLError = {
  locations?: {
    line: number
    column: number
  }[]
  error?: any
  status?: number
  message: string
  path?: string[]
}

export interface GQLResponse {
  data?: any | null
  errors?: GQLError[]
}

interface ErrorState {
  userId?: string
  password?: string
}

interface ILogin {}

function GoogleLoginButton() {
  const classes = useStyles()

  useEffect(() => {
    const scriptElement = document.createElement('script')
    scriptElement.src = 'https://accounts.google.com/gsi/client'
    scriptElement.async = true
    scriptElement.defer = true
    document.body.appendChild(scriptElement)

    logEvent(EventTypes.GENERIC.LOGIN_OPEN, SeverityTypes.INFO)

    return () => {
      document.body.removeChild(scriptElement)
    }
  }, [])

  return (
    <div className={classes.googleLoginBtn}>
      <div
        id='g_id_onload'
        data-client_id={config.uiConfig.googleClientId}
        data-context='signin'
        data-ux_mode='tab'
        data-auto_prompt=''
        data-login_uri={config.uiConfig.googleLoginCallback}
      />

      <div
        className='g_id_signin'
        data-type='standard'
        data-shape='rectangular'
        data-theme='filled_blue'
        data-text='signin_with'
        data-size='large'
        data-logo_alignment='left'
      />
    </div>
  )
}

/* eslint-disable no-unused-vars */
const Login = (props: ILogin) => {
  const classes = useStyles()
  const history = useHistory()

  useEffect(() => {
    if (localStorage.getItem('x-access-token')) {
      const urlParams = new URLSearchParams(window.location.search)
      const returnUrl = urlParams.get('returnUrl') || `/dashboard`

      history.push(returnUrl)
    }
  }, [true])

  return (
    <div className={classes.loginWrapper}>
      <div className={classes.loginWrapperContainer}>
        <div className={classes.loginBox}>
          <div className={classes.logoContainer}>
            <div className={classes.logo1}>
              <DarwinTrophyLogo onClick={() => {}} />
            </div>
            <div className={classes.logo2}>
              <DarwinTextLogo onClick={() => {}} />
            </div>
          </div>
          <div className={classes.subHeading}>
            Evolution of Machine Learning
          </div>
          <div className={classes.loginButtonContainer}>
            <GoogleLoginButton />
            {/* <a
              href={`${config.uiConfig.googleLoginUrl}`}
              onClick={onGoogleClick}
              className={classes.loginButton}
            >
              <GoogleLoginLogo onClick={() => {}} />
              <span>Sign in using Google</span>
            </a> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
