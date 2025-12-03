import React, {useEffect, useMemo, useState} from 'react'
import {compose} from 'redux'
import styles from './indexJSS'

import CloseIcon from '@mui/icons-material/Close'
import {CircularProgress, Drawer} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import {useDispatch, useSelector} from 'react-redux'
import {GetComputeCluster} from '../../../modules/compute/pages/computeCreate/queryComputeDetails/getComputeCluster'
import {GetComputeClusterSchema} from '../../../modules/compute/pages/computeCreate/queryComputeDetails/getComputeCluster.gqlTypes'
import {GQL as getComputeClusterGql} from '../../../modules/compute/pages/computeCreate/queryComputeDetails/getComputeClusterGql'
import {
  JobClusterDefinition,
  JobClusterDefinitionInput
} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition'
import {JobClusterDefinitionSchema} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition/index.gqlTypes'
import {GQL as jobClusterDefinitionGql} from '../../../modules/workflows/graphqlAPIs/jobClusterDefinition/indexGql'
import {resetClusterOperations} from '../../../modules/workflows/pages/workflowCreate/actions'
import {GetComputeClusterInput} from '../../../modules/workspace/pages/graphqlApis/getClusterStatusV2/getClusterStatus'
import {CommonState} from '../../../reducers/commonReducer'
import {useGQL} from '../../../utils/useGqlRequest'
import AllPurposeClusterOperation from '../allPurposeClusterOperation'
import {ClusterCardProps} from '../clusterCard'
import JobClusterDefinitionOperation from '../jobClusterDefinitionOperation'

interface IProps extends WithStyles<typeof styles> {
  attachClusterToTask: (cluster: ClusterCardProps) => void
}

const ClusterOperationDrawer = (props: IProps) => {
  const {classes, attachClusterToTask} = props
  const operationsState = useSelector(
    (state: CommonState) => state.workflowCreateReducer.clusterOperations
  )
  const dispatch = useDispatch()

  const open = useMemo(() => {
    if (operationsState.type !== 'none' && operationsState.mode !== 'none') {
      return true
    } else {
      return false
    }
  }, [operationsState.type, operationsState.mode])
  const handleClose = () => {
    dispatch(resetClusterOperations())
  }

  const heading = useMemo(() => {
    if (operationsState.mode === 'edit') {
      if (operationsState.type === 'job') {
        return 'Edit Job Cluster Definition'
      } else {
        return 'Edit All Purpose Cluster'
      }
    } else {
      if (operationsState.type === 'job') {
        return 'Create Job Cluster Definition'
      } else {
        return 'Create All Purpose Cluster'
      }
    }
  }, [operationsState.mode, operationsState.type])

  const mode = operationsState.mode
  const type = operationsState.type
  const sourceClusterType = operationsState.metadata.sourceClusterType
  const clusterID = operationsState.metadata.clusterID

  const {
    output: {
      response: jobClusterDefinitionResponse,
      loading: jobClusterDefinitionLoading,
      errors: jobClusterDefinitionErrors
    },
    triggerGQLCall: triggerGetJobClusterDefinition
  } = useGQL<JobClusterDefinitionInput, JobClusterDefinition>()

  useEffect(() => {
    if (jobClusterDefinitionResponse?.jobClusterDefinition?.data) {
      const jobClusterDefinition =
        jobClusterDefinitionResponse.jobClusterDefinition.data
      const [workerCores, workerMemory] =
        jobClusterDefinition.workerNodeConfigs?.reduce(
          (prev, worker) => [
            prev[0] + Number(worker.coresPerPods * worker.maxPods),
            prev[1] + Number(worker.memoryPerPods * worker.maxPods)
          ],
          [0, 0]
        ) || [0, 0]
      const totalCores =
        (jobClusterDefinition.headNodeConfig?.cores || 0) + workerCores
      const totalMemory =
        (jobClusterDefinition.headNodeConfig?.memory || 0) + workerMemory
      const cluster: ClusterCardProps = {
        id: jobClusterDefinition.clusterId,
        name: jobClusterDefinition.clusterName,
        core: totalCores,
        memory: totalMemory,
        status: jobClusterDefinition.status,
        type: 'job',
        createdAt: jobClusterDefinition.createdAt,
        estimatedCost: jobClusterDefinition.estimatedCost,
        runtime: jobClusterDefinition.runtime.displayName
      }
      attachClusterToTask(cluster)
      // TODO: Handle when details fetched
      handleClose()
    } else if (jobClusterDefinitionErrors) {
      // TODO:  Handle when error in fetching
    }
  }, [jobClusterDefinitionResponse, jobClusterDefinitionErrors])

  const {
    output: {
      response: computeClusterResponse,
      loading: computeClusterLoading,
      errors: computeClusterErrors
    },
    triggerGQLCall: triggerGetComputeCluster
  } = useGQL<GetComputeClusterInput, GetComputeCluster>()

  useEffect(() => {
    if (computeClusterResponse?.getComputeCluster?.data) {
      // TODO: Handle when details is fetched
      const computeCluster = computeClusterResponse.getComputeCluster.data

      const [workerCores, workerMemory] =
        computeCluster.workerNodeConfigs?.reduce(
          (prev, worker) => [
            prev[0] + Number(worker.coresPerPods * worker.maxPods),
            prev[1] + Number(worker.memoryPerPods * worker.maxPods)
          ],
          [0, 0]
        ) || [0, 0]
      const totalCores =
        (computeCluster.headNodeConfig?.cores || 0) + workerCores
      const totalMemory =
        (computeCluster.headNodeConfig?.memory || 0) + workerMemory

      const cluster: ClusterCardProps = {
        id: computeCluster.clusterId,
        name: computeCluster.clusterName,
        core: totalCores,
        memory: totalMemory,
        status: computeCluster.status,
        type: 'all_purpose',
        createdAt: computeCluster.createdOn,
        estimatedCost: computeCluster.estimatedCost,
        runtime: computeCluster.runtime.displayName
      }
      attachClusterToTask(cluster)
      // TODO: Handle when details fetched
      handleClose()
    } else if (computeClusterErrors) {
      // TODO: Handle when error in fetching
    }
  }, [computeClusterResponse, computeClusterErrors])

  const fetchJobClusterDetails = (id: string) => {
    triggerGetJobClusterDefinition(
      {
        ...jobClusterDefinitionGql,
        variables: {
          jobClusterDefinitionId: id
        }
      },
      JobClusterDefinitionSchema
    )
  }

  const fetchAllPurposeClusterDetails = (id: string) => {
    triggerGetComputeCluster(
      {
        ...getComputeClusterGql,
        variables: {
          clusterId: id
        }
      },
      GetComputeClusterSchema
    )
  }

  const handleJobClusterCreate = (id: string) => {
    fetchJobClusterDetails(id)
  }
  const handleJobClusterUpdate = (id: string) => {
    fetchJobClusterDetails(id)
  }
  const handleAllPurposeClusterCreate = (id: string) => {
    fetchAllPurposeClusterDetails(id)
  }
  const handleAllPurposeClusterUpdate = (id: string) => {
    fetchAllPurposeClusterDetails(id)
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor='right'
      PaperProps={{
        className: classes.container
      }}
    >
      {/* {jobClusterDefinitionLoading || computeClusterLoading || true ? (
        <div className={classes.loaderContainer}>
          <CircularProgress size={60} />
          <span>Attaching Cluster...</span>
        </div>
      ) : null} */}

      <div className={classes.headerContainer}>
        <CloseIcon onClick={handleClose} />
        <h1>{heading}</h1>
      </div>

      {type === 'all_purpose' ? (
        <AllPurposeClusterOperation
          handleClose={handleClose}
          clusterID={clusterID}
          mode={mode}
          onCreate={handleAllPurposeClusterCreate}
          onUpdate={handleAllPurposeClusterUpdate}
          loading={computeClusterLoading}
          sourceClusterType={sourceClusterType}
        />
      ) : type === 'job' ? (
        <JobClusterDefinitionOperation
          mode={mode}
          clusterID={clusterID}
          handleClose={handleClose}
          onCreate={handleJobClusterCreate}
          onUpdate={handleJobClusterUpdate}
          loading={jobClusterDefinitionLoading}
          sourceClusterType={sourceClusterType}
        />
      ) : null}
    </Drawer>
  )
}

const StyleComponent = compose<any>(withStyles(styles, {withTheme: true}))(
  ClusterOperationDrawer
)

export default StyleComponent
