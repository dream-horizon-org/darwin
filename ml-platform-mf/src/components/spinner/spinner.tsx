import {CircularProgress} from '@mui/material'
import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import React, {Component} from 'react'
import styles from './spinnerJss'

interface SpinnerProp extends WithStyles<typeof styles> {
  size?: number
  show: boolean
}
class Spinner extends Component<SpinnerProp, any> {
  public render() {
    const {classes} = this.props
    return (
      <div
        className={classes.fullBodyOverlay}
        style={{display: this.props.show ? 'block' : 'none'}}
      >
        <CircularProgress
          size={this.props.size ? this.props.size : 60}
          className={classes.center}
        />
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(Spinner)
