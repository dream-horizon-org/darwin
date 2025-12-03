import {WithStyles, withStyles} from '@mui/styles'
import React, {useMemo} from 'react'

import {useSelector} from 'react-redux'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {CurrentWorkflowClusters} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  onClickHandler: () => void
}

const CREATE_CLUSTER_BTN_LABEL = 'Attach Cluster'

const ClusterListFooter = (props: IProps) => {
  const {classes, onClickHandler} = props

  const clustersState = useSelector(
    (state: CommonState) => state.workflowCreateReducer.clusters
  )

  const visible: boolean = useMemo(() => {
    return clustersState.highlightedCluster !== null
  }, [clustersState.highlightedCluster])

  if (!visible) {
    return null
  }

  return (
    <div className={classes.container}>
      <Button
        variant={ButtonVariants.PRIMARY}
        buttonText={CREATE_CLUSTER_BTN_LABEL}
        onClick={onClickHandler}
        size={ButtonSizes.MEDIUM}
      />
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(ClusterListFooter)

export default StyleComponent
