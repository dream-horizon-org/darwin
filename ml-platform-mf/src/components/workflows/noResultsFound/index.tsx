import config from 'config'
import React from 'react'

import {WithStyles, withStyles} from '@mui/styles'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  message?: string
}

const NoResultsFound = (props: IProps) => {
  const {classes, message} = props

  return (
    <div className={classes.noResultsFoundContainer}>
      <img
        src={`${config.cfMsdAssetUrl}/icons/darwin-no-results-found.svg`}
        alt='No Results Found'
      />
      <p className={classes.noResultsFoundText}>
        {message ? message : 'No Results Found'}
      </p>
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(NoResultsFound)

export default StyleComponent
