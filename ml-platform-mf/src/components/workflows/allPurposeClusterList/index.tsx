import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {WithStyles, withStyles} from '@mui/styles'
import React from 'react'
import {Control} from 'react-hook-form'
import {useDispatch, useSelector} from 'react-redux'
import {compose} from 'redux'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {setClusterOperation} from '../../../modules/workflows/pages/workflowCreate/actions'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import {CommonState} from '../../../reducers/commonReducer'
import ClusterCard from '../clusterCard'
import styles from './indexJSS'
interface IProps extends WithStyles<typeof styles> {
  currentClustersLoading: boolean
  otherClustersLoading: boolean
  fetchCurrentClusters: () => void
  fetchOtherClusters: () => void
  taskIndex: number
}
const AllPurposeClusterList = (props: IProps) => {
  const {
    classes,
    currentClustersLoading,
    otherClustersLoading,
    fetchCurrentClusters,
    fetchOtherClusters,
    taskIndex
  } = props
  const dispatch = useDispatch()
  const {current: currentClusters, other: otherClusters} = useSelector(
    (state: CommonState) =>
      state.workflowCreateReducer.clusters.allPurposeClusters
  )

  return (
    <div className={classes.container}>
      <div className={classes.collectionContainer}>
        <div className={classes.collectionHeader}>
          <p>Created by me ({currentClusters.total})</p>
          <div
            className={classes.actionButton}
            onClick={() => {
              dispatch(
                setClusterOperation(
                  'all_purpose',
                  'create',
                  null,
                  'all_purpose'
                )
              )
            }}
          >
            <AddIcon />
            <p>ALL PURPOSE CLUSTER</p>
          </div>
        </div>
        <div className={classes.clustersContainer}>
          {currentClusters.clusters.length > 0 &&
            currentClusters.clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                {...cluster}
                taskIndex={taskIndex}
                group='current'
              />
            ))}

          {currentClusters.clusters.length === 0 && !currentClustersLoading && (
            <div className={classes.emptyStateContainer}>No Clusters</div>
          )}
          {currentClustersLoading && (
            <ProgressCircle size={LoaderSize.Medium} />
          )}

          {currentClusters.total > currentClusters.clusters.length &&
            !currentClustersLoading && (
              <div
                className={classes.moreActionContainer}
                onClick={fetchCurrentClusters}
              >
                <p>
                  {currentClusters.total - currentClusters.clusters.length} MORE
                </p>
                <ExpandMoreIcon />
              </div>
            )}
        </div>
      </div>
      <div className={classes.collectionContainer}>
        <div className={classes.collectionHeader}>
          <p>Created by others ({otherClusters.total})</p>
        </div>
        <div className={classes.clustersContainer}>
          {otherClusters.clusters.length > 0 &&
            otherClusters.clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                {...cluster}
                taskIndex={taskIndex}
                group='other'
              />
            ))}

          {otherClusters.clusters.length === 0 && !otherClustersLoading && (
            <div className={classes.emptyStateContainer}>No Clusters</div>
          )}
          {otherClustersLoading && <ProgressCircle size={LoaderSize.Medium} />}
          {otherClusters.total > otherClusters.clusters.length &&
            !otherClustersLoading && (
              <div
                className={classes.moreActionContainer}
                onClick={fetchOtherClusters}
              >
                <p>
                  {otherClusters.total - otherClusters.clusters.length} MORE
                </p>
                <ExpandMoreIcon />
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  AllPurposeClusterList
)

export default StyleComponent
