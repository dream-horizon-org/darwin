import React, {Component} from 'react'
import Spinner from '../components/spinner/spinner'

/**
 * @function AsyncComponent
 * Helper function which creates asynchronous instance of the getComponent.
 * getComponent is a chunk loading promise function, passed as an argument to AsyncComponent.
 * compProps {object} , used to pass props to the component rendered.
 * @param getComponent
 * @param compProps
 */
export default function AsyncComponent(getComponent: any, compProps?: any) {
  return class extends Component<any, any> {
    public state = {AsyncComp: null}

    public componentDidMount() {
      getComponent().then((cmp) => {
        this.setState({AsyncComp: cmp.default || cmp})
      })
    }

    public render() {
      const {AsyncComp} = this.state

      if (AsyncComp) {
        return <AsyncComp {...this.props} {...compProps} />
      }
      return <Spinner show={true} />
    }
  }
}
