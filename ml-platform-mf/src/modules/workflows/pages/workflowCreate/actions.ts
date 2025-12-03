import {ClusterCardProps} from '../../../../components/workflows/clusterCard'
import {
  REMOVE_WORKFLOW_JOB_CLUSTER,
  RESET_CLUSTER_OPERATIONS,
  RESET_CREATE_WORKFLOW,
  RESET_CURRENT_WORKFLOW_JOB_CLUSTERS,
  RESET_WORKFLOW_ALL_PURPOSE_CLUSTERS,
  RESET_WORKFLOW_ATTACHED_CLUSTERS,
  RESET_WORKFLOW_CLUSTERS,
  RESET_WORKFLOW_HIGHLIGHTED_CLUSTER,
  RESET_WORKFLOW_JOB_CLUSTERS,
  SET_ALL_PURPOSE_CLUSTERS,
  SET_CHECK_UNIQUE_JOB_CLUSTER_NAME,
  SET_CHECK_UNIQUE_WORKFLOW,
  SET_CLUSTER_OPERATION,
  SET_CREATE_WORKFLOW,
  SET_CURRENT_WORKFLOW_JOB_CLUSTERS,
  SET_JOB_CLUSTERS,
  SET_WORKFLOW_ALL_PURPOSE_CLUSTERS,
  SET_WORKFLOW_ATTACHED_CLUSTERS,
  SET_WORKFLOW_HIGHLIGHTED_CLUSTER,
  SET_WORKFLOW_JOB_CLUSTERS
} from './constants'
import {IWorkflowCreateState} from './reducer'

export interface ReducerUserJobCluster {
  id: string
  name: string
  core: string
  memory: string
  runtime: string
  estimatedCost: string
  createdAt: string
}

export function setJobClusters(payload: IWorkflowCreateState['jobClusters']) {
  return {
    type: SET_JOB_CLUSTERS,
    payload
  }
}

export function setAllPurposeClusters(
  payload: IWorkflowCreateState['allPurposeClusters']
) {
  return {
    type: SET_ALL_PURPOSE_CLUSTERS,
    payload
  }
}

export function setCreateWorkflow(
  payload: IWorkflowCreateState['workflowCreate']
) {
  return {
    type: SET_CREATE_WORKFLOW,
    payload
  }
}

export function resetCreateWorkflow() {
  return {
    type: RESET_CREATE_WORKFLOW
  }
}

export function setCheckUniqueWorkflow(
  payload: IWorkflowCreateState['checkUniqueWorkflow']
) {
  return {
    type: SET_CHECK_UNIQUE_WORKFLOW,
    payload
  }
}

export function setCheckUniqueJobClusterName(
  payload: IWorkflowCreateState['setCheckUniqueJobClusterName']
) {
  return {
    type: SET_CHECK_UNIQUE_JOB_CLUSTER_NAME,
    payload
  }
}

export const resetWorkflowCluster = () => {
  return {
    type: RESET_WORKFLOW_CLUSTERS
  }
}

export const setWorkflowHighlightedCluster = (id: string) => {
  return {
    type: SET_WORKFLOW_HIGHLIGHTED_CLUSTER,
    payload: {
      id: id
    }
  }
}

export const resetWorkflowHighlightedCluster = () => {
  return {
    type: RESET_WORKFLOW_HIGHLIGHTED_CLUSTER
  }
}

export const setWorkflowJobClusters = (
  clusters: ClusterCardProps[],
  group: 'current' | 'other',
  total: number
) => {
  return {
    type: SET_WORKFLOW_JOB_CLUSTERS,
    payload: {
      clusters: clusters,
      group: group,
      total: total
    }
  }
}

export const removeWorkflowJobCLuster = (
  group: 'current' | 'other',
  clusterID: string
) => {
  return {
    type: REMOVE_WORKFLOW_JOB_CLUSTER,
    payload: {
      group: group,
      clusterID: clusterID
    }
  }
}

export const resetWorkflowJobCluster = (group: 'current' | 'other') => {
  return {
    type: RESET_WORKFLOW_JOB_CLUSTERS,
    payload: {
      group: group
    }
  }
}

export const setWorkflowAllPurposeClusters = (
  clusters: ClusterCardProps[],
  group: 'current' | 'other',
  total: number
) => {
  return {
    type: SET_WORKFLOW_ALL_PURPOSE_CLUSTERS,
    payload: {
      clusters: clusters,
      group: group,
      total: total
    }
  }
}

export const resetWorkflowAllPurposeClusters = (group: 'current' | 'other') => {
  return {
    type: RESET_WORKFLOW_ALL_PURPOSE_CLUSTERS,
    payload: {
      group: group
    }
  }
}

export const setWorkkflowAttachedCluster = (
  taskIndex: number,
  cluster: ClusterCardProps
) => {
  return {
    type: SET_WORKFLOW_ATTACHED_CLUSTERS,
    payload: {
      taskIndex: taskIndex,
      cluster: cluster
    }
  }
}

export const resetWorkflowAttachedClusters = () => {
  return {
    type: RESET_WORKFLOW_ATTACHED_CLUSTERS
  }
}

export const setClusterOperation = (
  type: 'job' | 'all_purpose',
  mode: 'create' | 'edit' | 'clone',
  clusterID: string | null,
  sourceClusterType: 'job' | 'all_purpose' // used to identify the source cluster type when cloning or editing, to check if we want to clone all purpose to job or job to all purpose
) => {
  return {
    type: SET_CLUSTER_OPERATION,
    payload: {
      mode: mode,
      type: type,
      clusterID: clusterID,
      sourceClusterType: sourceClusterType
    }
  }
}

export const resetClusterOperations = () => {
  return {
    type: RESET_CLUSTER_OPERATIONS
  }
}
