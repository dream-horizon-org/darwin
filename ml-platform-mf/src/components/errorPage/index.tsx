import React, {useEffect} from 'react'
import {EventTypes, SeverityTypes} from '../../types/events.types'
import {logEvent} from '../../utils/events'

import {Button} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import {useHistory} from 'react-router-dom'
import {aliasTokens} from '../../theme.contants'
import BackButton from '../backButton/backButton'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {}

const ErrorPage = (props: IProps) => {
  const history = useHistory()
  const {classes} = props

  useEffect(() => {
    logEvent(EventTypes.GENERIC.ERROR, SeverityTypes.ERROR)
  }, [])

  const backButtonClickHandler = () => {
    window.location.href = '/dashboard'
  }
  return (
    <div className={classes.errorBoundary}>
      <div className={classes.errorContent}>
        <h1>Oops, something went wrong.</h1>
        <p>
          We're experiencing an issue. Please try refreshing the page or contact
          Darwin Team if the problem persists.
        </p>
        <img
          src='https://media.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.gif'
          alt='Error animation'
          className={classes.errorGif}
        />
        <Button
          variant={'outlined'}
          onClick={backButtonClickHandler}
          sx={{
            color: aliasTokens.cta_primary_text_color,
            borderColor: aliasTokens.cta_primary_text_color,
            '&:hover': {
              borderColor: aliasTokens.cta_primary_text_color, // Prevent hover border color change
              backgroundColor: 'transparent' // Ensure background color stays the same on hover
            }
          }}
        >
          Go Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

const styleComponent = withStyles(styles, {withTheme: true})(ErrorPage)

export default styleComponent
