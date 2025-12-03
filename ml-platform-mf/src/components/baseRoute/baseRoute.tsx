import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'
import {shouldRedirectTo} from './internals/helper'

class BaseRoute extends Component<any, any> {
  public render() {
    return <Redirect to={shouldRedirectTo(localStorage)} {...this.props} />
  }
}

export default BaseRoute
