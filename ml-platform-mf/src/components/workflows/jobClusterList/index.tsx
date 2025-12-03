import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {Control} from 'react-hook-form'
import {useDispatch, useSelector} from 'react-redux'
import {compose} from 'redux'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {
  ISidepanel,
  SIDEPANEL_TYPES
} from '../../../modules/workflows/pages/workflowCreate'
import {setClusterOperation} from '../../../modules/workflows/pages/workflowCreate/actions'
import {CurrentWorkflowClusters} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import {CommonState} from '../../../reducers/commonReducer'
import ClusterCard, {ClusterCardProps} from '../clusterCard'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  currentWorkflowClustersLoading: boolean
  otherWorkflowClustersLoading: boolean
  search: string
  fetchOtherWorkflowClusters: () => void
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  taskIndex: number
}
const JobClusterList = (props: IProps) => {
  const {
    classes,
    search,
    currentWorkflowClustersLoading,
    otherWorkflowClustersLoading,
    fetchOtherWorkflowClusters,
    setSidepanel,
    taskIndex
  } = props

  const dispatch = useDispatch()

  const clustersState = useSelector(
    (state: CommonState) => state.workflowCreateReducer.clusters
  )

  const currentTotal = useMemo(() => {
    return clustersState.jobClusters.current.total
  }, [clustersState.jobClusters.current.total])
  const currentClusters = useMemo(() => {
    return clustersState.jobClusters.current.clusters
  }, [clustersState.jobClusters.current.clusters])

  const otherTotal = useMemo(() => {
    return clustersState.jobClusters.other.total
  }, [clustersState.jobClusters.other.total])

  const otherClusters = useMemo(() => {
    return clustersState.jobClusters.other.clusters
  }, [clustersState.jobClusters.other.clusters])

  const [len, setLen] = useState<number>(3)

  useEffect(() => {
    setLen(3)
  }, [search])

  const filteredCurrentWorkflow = useMemo(() => {
    return currentClusters
      .filter((cluster) =>
        cluster.name.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, len)
  }, [len, search, currentClusters])

  return (
    <div className={classes.container}>
      <div className={classes.collectionContainer}>
        <div className={classes.collectionHeader}>
          <p>Used in this workflow ({currentTotal})</p>
          <div
            className={classes.actionButton}
            onClick={() => {
              dispatch(setClusterOperation('job', 'create', null, 'job'))
            }}
          >
            <AddIcon />
            <p>Job Cluster</p>
          </div>
        </div>
        <div className={classes.clustersContainer}>
          {filteredCurrentWorkflow.length > 0 &&
            filteredCurrentWorkflow.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                {...cluster}
                taskIndex={taskIndex}
                group='current'
              />
            ))}

          {filteredCurrentWorkflow.length === 0 &&
            !currentWorkflowClustersLoading && (
              <div className={classes.emptyStateContainer}>No Clusters</div>
            )}
          {currentWorkflowClustersLoading && (
            <ProgressCircle size={LoaderSize.Medium} />
          )}

          {currentTotal > filteredCurrentWorkflow.length &&
            !currentWorkflowClustersLoading && (
              <div
                className={classes.moreActionContainer}
                onClick={() => {
                  setLen((prev) => prev + 3)
                }}
              >
                <p>{currentTotal - filteredCurrentWorkflow.length} MORE</p>
                <ExpandMoreIcon />
              </div>
            )}
        </div>
      </div>
      <div className={classes.collectionContainer}>
        <div className={classes.collectionHeader}>
          <p>Used elsewhere ({otherTotal})</p>
        </div>
        <div className={classes.clustersContainer}>
          {otherClusters.length > 0 &&
            otherClusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                {...cluster}
                taskIndex={taskIndex}
                group='other'
              />
            ))}

          {otherClusters.length === 0 && !otherWorkflowClustersLoading && (
            <div className={classes.emptyStateContainer}>No Clusters</div>
          )}
          {otherWorkflowClustersLoading && (
            <ProgressCircle size={LoaderSize.Medium} />
          )}
          {otherTotal > otherClusters.length && !otherWorkflowClustersLoading && (
            <div
              className={classes.moreActionContainer}
              onClick={fetchOtherWorkflowClusters}
            >
              <p>{otherTotal - otherClusters.length} MORE</p>
              <ExpandMoreIcon />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  JobClusterList
)

export default StyleComponent
