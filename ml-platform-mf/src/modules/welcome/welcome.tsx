import {WithStyles} from '@mui/styles'
import withStyles from '@mui/styles/withStyles'
import config from 'config'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import DarwinLogoHome from '../login/darwinLogoHome'

import {getUserDetails} from './duck/getUserDetails.thunk'
import styles from './welcomeJSS'

interface IState {}
interface IProps extends WithStyles<typeof styles> {
  getUserDetails: () => void
}

class Welcome extends Component<IProps, IState> {
  componentDidMount(): void {
    this.props.getUserDetails()
  }

  public render() {
    const {classes} = this.props

    return (
      <div className={classes.container}>
        <DarwinLogoHome onClick={() => {}} />
        <div className={classes.appText}>{config.uiConfig.applicationName}</div>
      </div>
    )
  }
}

const styleComponent = compose(
  connect((state) => ({}), {
    getUserDetails
  }),
  withStyles(styles, {withTheme: true})
)(Welcome)

export default styleComponent
