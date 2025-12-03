import {withStyles} from '@mui/styles'
import React from 'react'
import {compose} from 'redux'
import CreateModelBody from '../../components/CreateModelBody'
import CreateModelFooter from '../../components/CreateModelFooter'
import CreateModelHeader from '../../components/CreateModelHeader'
import {Flow} from '../../data/types'
import styles from './indexJSS'

const EdgeModelsCreatePage = ({classes}) => {
  return (
    <div className={classes.container}>
      <CreateModelHeader flow={Flow.CREATE} />
      <div className={classes.body}>
        <CreateModelBody flow={Flow.CREATE} deploymentDetails={undefined} />
      </div>
      <CreateModelFooter flow={Flow.CREATE} />
    </div>
  )
}

const styleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  EdgeModelsCreatePage
)

export default styleComponent
