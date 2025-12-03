import {withStyles, WithStyles} from '@mui/styles'
import React from 'react'
import {loaderTypes} from './constants'

import Spinner from '../../spinner/spinner'
import styles from './workspaceLevelLoadersJSS'

interface IProps extends WithStyles<typeof styles> {
  type: loaderTypes
}

const WorkspaceLevelLoaders = (props: IProps) => {
  const {classes, type} = props

  const ActivatingCluster = (
    <div className={classes.mainData}>
      <div>
        <Spinner show={true} size={40} />
      </div>
      <div className={classes.header}>Cluster activating...</div>
      <div className={classes.info}>
        Workspace will be available once the cluster is activated
      </div>
    </div>
  )

  return (
    <div className={classes.container}>
      {type === loaderTypes.ACTIVATING_CLUSTER ? ActivatingCluster : null}
    </div>
  )
}

export default withStyles(styles, {withTheme: true})(WorkspaceLevelLoaders)
