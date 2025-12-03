import React, {useEffect, useMemo} from 'react'
import ClusterOperationDrawer from '../clusterOperationDrawer'

import {WithStyles, withStyles} from '@mui/styles'
import {
  Control,
  UseFormSetValue,
  UseFormTrigger,
  useWatch
} from 'react-hook-form'
import {useDispatch, useSelector} from 'react-redux'
import {
  ISidepanel,
  SIDEPANEL_TYPES
} from '../../../modules/workflows/pages/workflowCreate'
import {
  resetWorkflowHighlightedCluster,
  setWorkflowAllPurposeClusters,
  setWorkflowJobClusters,
  setWorkkflowAttachedCluster
} from '../../../modules/workflows/pages/workflowCreate/actions'
import {CurrentWorkflowClusters} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {
  IWorkflowCreateForm,
  IWorkflowTaskCluster
} from '../../../modules/workflows/types/common.types'
import {CommonState} from '../../../reducers/commonReducer'
import {ClusterCardProps} from '../clusterCard'
import ClusterList from '../clusterList'
import ClusterListFooter from '../clusterListFooter'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  control: Control<IWorkflowCreateForm, any>
  taskIdx: number
  setValue: UseFormSetValue<IWorkflowCreateForm>
  trigger: UseFormTrigger<IWorkflowCreateForm>
}

const ClusterListDrawer = (props: IProps) => {
  const {classes, setSidepanel, control, taskIdx, setValue, trigger} = props
  const clustersState = useSelector(
    (state: CommonState) => state.workflowCreateReducer.clusters
  )

  const tasks = useWatch({
    control,
    name: 'tasks'
  })

  const jobClustersUsedInWorkflow: ClusterCardProps[] = useMemo(() => {
    return tasks
      ?.filter((task) => task.cluster?.id && task.cluster.type === 'job')
      .reduce((acc, task) => {
        if (acc.find((cluster) => cluster.id === task.cluster.id)) {
          return acc
        }
        const cluster: ClusterCardProps = {
          id: task.cluster.id,
          name: task.cluster.name,
          status: task.cluster.status,
          core: Number(task.cluster.cores),
          memory: Number(task.cluster.memory),
          runtime: task.cluster.runtime,
          estimatedCost: task.cluster.estimatedCost,
          createdAt: task.cluster.createdAt,
          type: task.cluster.type as 'job' | 'all_purpose'
        }
        return [...acc, cluster]
      }, [])
  }, [tasks])

  const attachClusterToTask = (cluster: ClusterCardProps) => {
    const newCluster: IWorkflowTaskCluster = {
      id: cluster.id,
      name: cluster.name,
      cores: cluster.core.toString(),
      memory: cluster.memory.toString(),
      status: cluster.status,
      type: cluster.type,
      createdAt: cluster.createdAt,
      estimatedCost: cluster.estimatedCost,
      runtime: cluster.runtime
    }
    setValue(`tasks.${taskIdx}.cluster`, newCluster)
    trigger(`tasks.${taskIdx}.cluster`)
    dispatch(setWorkkflowAttachedCluster(taskIdx, cluster))
    setSidepanel({
      open: true,
      type: SIDEPANEL_TYPES.TASK,
      data: null
    })
    dispatch(resetWorkflowHighlightedCluster())
  }

  const onClusterSelected = () => {
    const allClusters = [
      ...clustersState.jobClusters.current.clusters,
      ...clustersState.jobClusters.other.clusters,
      ...clustersState.allPurposeClusters.current.clusters,
      ...clustersState.allPurposeClusters.other.clusters
    ]
    const cluster = allClusters.find(
      (c) => c.id === clustersState.highlightedCluster
    )
    attachClusterToTask(cluster)
  }
  const dispatch = useDispatch()

  return (
    <div className={classes.container}>
      <ClusterList
        setSidepanel={setSidepanel}
        onBackClick={() => {
          dispatch(resetWorkflowHighlightedCluster())
          setSidepanel({
            open: true,
            type: SIDEPANEL_TYPES.TASK,
            data: null
          })
        }}
        taskIndex={taskIdx}
        jobClustersUsedInWorkflow={jobClustersUsedInWorkflow}
      />
      <ClusterListFooter
        onClickHandler={() => {
          onClusterSelected()
        }}
      />
      <ClusterOperationDrawer attachClusterToTask={attachClusterToTask} />
    </div>
  )
}

const StyleComponent = withStyles(styles, {withTheme: true})(ClusterListDrawer)

export default StyleComponent
