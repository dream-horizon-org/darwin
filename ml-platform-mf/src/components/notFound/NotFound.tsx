import React, {Component} from 'react'
import {Redirect} from 'react-router'
import {routes} from '../../constants'

export default class NotFound extends Component<any, any> {
  public render() {
    return <Redirect to={'/login'} />
  }
}
