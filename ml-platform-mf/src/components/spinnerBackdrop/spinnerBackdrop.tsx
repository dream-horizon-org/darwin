import {CircularProgress} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React, {Component} from 'react'
import styles from './spinnerBackdropJss'

export enum SpinnerDropTypes {
  BASIC,
  ADVANCE
}

interface SpinnerProp extends WithStyles<typeof styles> {
  size?: number
  show: boolean
  type?: SpinnerDropTypes
}
class SpinnerBackdrop extends Component<SpinnerProp, any> {
  public render() {
    const {classes, show, size, type = SpinnerDropTypes.ADVANCE} = this.props

    if (!show) return null

    const style = {}
    if (type === SpinnerDropTypes.BASIC) {
      Object.assign(style, {width: '100%', margin: 0})
    }

    return (
      <div className={classes.backdrop} style={style}>
        <div
          className={classes.fullBodyOverlay}
          style={{display: show ? 'block' : 'none'}}
        >
          <CircularProgress size={size || 60} className={classes.center} />
        </div>
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(SpinnerBackdrop)
