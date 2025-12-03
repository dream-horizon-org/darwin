import {CircularProgress} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React from 'react'

import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  size?: number
  show: boolean
}

const GlobalSpinner = (props: IProps) => {
  const {classes, size, show} = props
  return (
    <div className={classes.backdrop} style={{display: show ? 'flex' : 'none'}}>
      <CircularProgress size={size || 60} />
    </div>
  )
}

export default withStyles(styles, {withTheme: true})(GlobalSpinner)
