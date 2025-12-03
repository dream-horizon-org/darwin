import config from 'config'
import * as React from 'react'
import {useEffect, useState} from 'react'
import {useHistory} from 'react-router'
import {toast} from 'react-tiny-toast'
import CircleLoader from './circleLoader'
import buttonJss from './loginButton.jss'
import loginGqlRequest from './loginGqlRequest'
import useStyles from './loginJss'
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
  useEffect(() => {
    const scriptElement = document.createElement('script')
    scriptElement.src = 'https://accounts.google.com/gsi/client'
    scriptElement.async = true
    scriptElement.defer = true
    document.body.appendChild(scriptElement)

    return () => {
      document.body.removeChild(scriptElement)
    }
  }, [])

  return (
    <div>
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
  const onGoogleClick = () => {}
  const classes = useStyles()
  const buttonClasses = buttonJss()
  /* Form hooks */
  const [userIdValue, setUserIdValue] = useState('')
  const [loginFieldErrors, setLoginFieldErrors] = useState<ErrorState>({})
  const [passwordValue, setPasswordValue] = useState('')
  const [loading, setFormLoading] = useState(false)
  const [quote, setQuote] = useState(null)
  const history = useHistory()

  useEffect(() => {
    const randomIndexForQuotes = Math.floor(Math.random() * quotes.length)
    setQuote(getQuote(randomIndexForQuotes))
  }, [])

  useEffect(() => {
    if (localStorage.getItem('x-access-token')) {
      const urlParams = new URLSearchParams(window.location.search)
      const returnUrl = urlParams.get('returnUrl') || `/dashboard`

      history.push(returnUrl)
    }
  }, [true])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (userIdValue && passwordValue) {
      setLoginFieldErrors({})
      setFormLoading(true)
      loginGqlRequest(userIdValue, passwordValue).then((response) => {
        setFormLoading(false)
        if (response && response.ok) {
          response.json().then((data) => {
            const gqlResponse = data as GQLResponse
            if (gqlResponse.errors) {
              toast.show(
                gqlResponse.errors[0]
                  ? gqlResponse.errors[0].message
                  : 'Something went wrong',
                {timeout: 30000, position: 'bottom-center', variant: 'default'}
              )
            } else if (gqlResponse.data && gqlResponse.data.login) {
              handleLoginSuccess(gqlResponse.data.login)
            }
          })
        } else {
          toast.show('Something went wrong', {timeout: 3000})
        }
      })
    } else {
      const userIdError = userIdValue ? '' : 'User Id cannot be empty'
      const passwordError = passwordValue ? '' : 'Password cannot be empty'
      setLoginFieldErrors({
        userId: userIdError,
        password: passwordError
      })
    }
  }
  return (
    <div className={classes.loginContent}>
      <div className={classes.background}>
        <div className={classes.loginContainerForCustom}>
          <img
            src={`${config.cfMsdAssetUrl}/images/msd_logo.png`}
            alt='Dream11 Icon'
            className={classes.dreamLogo}
          />
          <form
            data-test='login'
            className={classes.loginForm}
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(e)
            }}
          >
            <div className={classes.googleLoginContainer}>
              <GoogleLoginButton />
              {/* <a
                href={`${config.uiConfig.googleLoginUrl}`}
                onClick={onGoogleClick}
                className={classes.btnAnchor}
              >
                <div className={`${classes.googleBtn}`}>
                  <>
                    <img
                      src={`${config.cfMsdAssetUrl}/images/google_icon.png`}
                      className={classes.imageIcon}
                      alt='Dream11 Icon'
                    />
                    <span className={classes.gLoginText}>
                      LOGIN WITH GOOGLE
                    </span>
                  </>
                </div>
              </a> */}

              <div className={classes.borderContainer}>
                <span className={classes.border} />
                <span className={classes.borderText}>OR</span>
                <span className={classes.border} />
              </div>
            </div>

            <div className={classes.normalLoginContainer}>
              <div className={classes.usernameContainer}>
                <div className={classes.materialTextfield}>
                  <input
                    className={classes.input}
                    name='username'
                    placeholder=' '
                    type='text'
                    value={userIdValue}
                    onChange={(e) => {
                      setLoginFieldErrors({
                        ...loginFieldErrors,
                        userId: e.currentTarget.value
                          ? ''
                          : 'User Id cannot be empty'
                      })
                      setUserIdValue(e.currentTarget.value)
                    }}
                  />
                  <label className={classes.label}>User ID*</label>
                </div>
                <span className={classes.errorText}>
                  {loginFieldErrors?.userId}
                </span>
              </div>

              <div className={classes.usernameContainer}>
                <div className={classes.materialTextfield}>
                  <input
                    className={classes.input}
                    placeholder=' '
                    name='password'
                    type='password'
                    value={passwordValue}
                    onChange={(e) => {
                      setLoginFieldErrors({
                        ...loginFieldErrors,
                        password: e.currentTarget.value
                          ? ''
                          : 'Password cannot be empty'
                      })
                      setPasswordValue(e.currentTarget.value)
                    }}
                  />
                  <label className={classes.label}>Password*</label>
                </div>
                <span className={classes.errorText}>
                  {loginFieldErrors?.password}
                </span>
              </div>
              <div className={classes.loginBtnContainer}>
                <button
                  type='submit'
                  className={`${buttonClasses.materialButton}`}
                  disabled={loading}
                >
                  {loading ? <CircleLoader /> : 'LOGIN'}
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className={classes.quoteContainer}>
          <span className={classes.quote}>{`"${quote?.quote}"`}</span>
          <br />
          <br />
          <span className={classes.quoteBy}>{`- ${quote?.author}`}</span>
        </div>
      </div>
    </div>
  )
}

export default Login
