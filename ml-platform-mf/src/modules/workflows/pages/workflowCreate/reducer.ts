import {ClusterCardProps} from '../../../../components/workflows/clusterCard'
import {API_STATUS} from '../../../../utils/apiUtils'
import {SelectionOnCheckUniqueJobClusterName} from '../../graphqlAPIs/checkUniqueJobClusterName'
import {SelectionOnCheckUniqueWorkflow} from '../../graphqlAPIs/checkUniqueWorkflow'
import {SelectionOnCreateWorkflow} from '../../graphqlAPIs/createWorkflow'
import {SelectionOnGetAllJobClustersV2} from '../../graphqlAPIs/getAllJobClusters'
import {SelectionOnGetAllClusters} from '../../graphqlAPIs/getAllPurposeClusters'
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

type AttachedClustersMap = {
  [taskIndex: number]: ClusterCardProps
}
export interface CurrentWorkflowClusters {
  attachedClusters: AttachedClustersMap
  highlightedCluster: string | null
  jobClusters: {
    current: {
      total: number
      clusters: ClusterCardProps[]
    }
    other: {
      total: number
      clusters: ClusterCardProps[]
    }
  }
  allPurposeClusters: {
    current: {
      total: number
      clusters: ClusterCardProps[]
    }
    other: {
      total: number
      clusters: ClusterCardProps[]
    }
  }
}

export interface ClusterOperations {
  type: 'job' | 'all_purpose' | 'none'
  mode: 'create' | 'edit' | 'clone' | 'none'
  metadata: {
    clusterID: string | null
    sourceClusterType?: 'job' | 'all_purpose' | 'none'
  }
}

export interface IWorkflowCreateState {
  allPurposeClusters: {
    status: API_STATUS
    data: SelectionOnGetAllClusters
    error: any
    cancel: () => void
  }
  jobClusters: {
    status: API_STATUS
    data: SelectionOnGetAllJobClustersV2
    error: any
    cancel: () => void
  }
  workflowCreate: {
    status: API_STATUS
    data: SelectionOnCreateWorkflow['data']
    error: any
  }
  checkUniqueWorkflow: {
    status: API_STATUS
    data: SelectionOnCheckUniqueWorkflow['data']
    error: any
    cancel: () => void
  }
  setCheckUniqueJobClusterName: {
    status: API_STATUS
    data: SelectionOnCheckUniqueJobClusterName['data']
    error: any
    cancel: () => void
  }
  currentWorkflowJobClusters: SelectionOnGetAllJobClustersV2['data']
  clusters: CurrentWorkflowClusters
  clusterOperations: ClusterOperations
}

const initialState: IWorkflowCreateState = {
  allPurposeClusters: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  jobClusters: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  workflowCreate: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  checkUniqueWorkflow: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  setCheckUniqueJobClusterName: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    cancel: null
  },
  currentWorkflowJobClusters: [],
  clusters: {
    highlightedCluster: null,
    attachedClusters: {},
    jobClusters: {
      current: {
        total: 0,
        clusters: []
      },
      other: {
        total: 0,
        clusters: []
      }
    },
    allPurposeClusters: {
      current: {
        total: 0,
        clusters: []
      },
      other: {
        total: 0,
        clusters: []
      }
    }
  },
  clusterOperations: {
    type: 'none',
    mode: 'none',
    metadata: {
      clusterID: null
    }
  }
}

export default function workflowCreateReducer(
  state = initialState,
  action
): IWorkflowCreateState {
  switch (action.type) {
    case SET_ALL_PURPOSE_CLUSTERS:
      return {
        ...state,
        allPurposeClusters: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    case SET_JOB_CLUSTERS:
      return {
        ...state,
        jobClusters: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    case SET_CREATE_WORKFLOW:
      return {
        ...state,
        workflowCreate: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case RESET_CREATE_WORKFLOW:
      return {
        ...state,
        workflowCreate: {
          status: API_STATUS.INIT,
          data: null,
          error: null
        }
      }
    case SET_CHECK_UNIQUE_WORKFLOW:
      return {
        ...state,
        checkUniqueWorkflow: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    case SET_CHECK_UNIQUE_JOB_CLUSTER_NAME:
      return {
        ...state,
        setCheckUniqueJobClusterName: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          cancel: action.payload.cancel
        }
      }
    case SET_CURRENT_WORKFLOW_JOB_CLUSTERS:
      return {
        ...state,
        currentWorkflowJobClusters: action.payload.clusters
      }
    case RESET_CURRENT_WORKFLOW_JOB_CLUSTERS:
      return {
        ...state,
        currentWorkflowJobClusters: []
      }

    case SET_WORKFLOW_HIGHLIGHTED_CLUSTER:
      return {
        ...state,
        clusters: {
          ...state.clusters,
          highlightedCluster: action.payload.id
        }
      }
    case RESET_WORKFLOW_HIGHLIGHTED_CLUSTER:
      return {
        ...state,
        clusters: {
          ...state.clusters,
          highlightedCluster: null
        }
      }
    case SET_WORKFLOW_JOB_CLUSTERS:
      return {
        ...state,
        clusters: {
          ...state.clusters,
          jobClusters: {
            ...state.clusters.jobClusters,
            [action.payload.group]: {
              total: action.payload.total,
              clusters: action.payload.clusters
            }
          }
        }
      }
    case REMOVE_WORKFLOW_JOB_CLUSTER:
      return {
        ...state,
        clusters: {
          ...state.clusters,
          jobClusters: {
            ...state.clusters.jobClusters,
            [action.payload.group]: {
              total: state.clusters.jobClusters[action.payload.group].total - 1,
              clusters: state.clusters.jobClusters[
                action.payload.group
              ].clusters.filter(
                (cluster) => cluster.id !== action.payload.clusterID
              )
            }
          }
        }
      }
    case RESET_WORKFLOW_JOB_CLUSTERS:
      return {
        ...state,
        clusters: {
          ...state.clusters,
          jobClusters: {
            ...state.clusters.jobClusters,
            [action.payload.group]: {
              total: 0,
              clusters: []
            }
          }
        }
      }

    case SET_WORKFLOW_ALL_PURPOSE_CLUSTERS:
      return {
        ...state,
        clusters: {
          ...state.clusters,
          allPurposeClusters: {
            ...state.clusters.allPurposeClusters,
            [action.payload.group]: {
              total: action.payload.total,
              clusters: action.payload.clusters
            }
          }
        }
      }
    case RESET_WORKFLOW_ALL_PURPOSE_CLUSTERS:
      return {
        ...state,
        clusters: {
          ...state.clusters,
          allPurposeClusters: {
            ...state.clusters.allPurposeClusters,
            [action.payload.group]: {
              total: 0,
              clusters: []
            }
          }
        }
      }
    case SET_WORKFLOW_ATTACHED_CLUSTERS:
      const taskIndex: number = action.payload.taskIndex
      const cluster: ClusterCardProps = action.payload.cluster
      const updatedAttachedClusters = {
        ...state.clusters.attachedClusters,
        [taskIndex]: cluster
      }
      return {
        ...state,
        clusters: {
          ...state.clusters,
          attachedClusters: updatedAttachedClusters
        }
      }
    case RESET_WORKFLOW_ATTACHED_CLUSTERS:
      return {
        ...state,
        clusters: {
          ...state.clusters,
          attachedClusters: {}
        }
      }
    case SET_CLUSTER_OPERATION:
      return {
        ...state,
        clusterOperations: {
          type: action.payload.type,
          mode: action.payload.mode,
          metadata: {
            clusterID: action.payload.clusterID,
            sourceClusterType: action.payload.sourceClusterType
          }
        }
      }
    case RESET_CLUSTER_OPERATIONS:
      return {
        ...state,
        clusterOperations: {
          type: 'none',
          mode: 'none',
          metadata: {
            clusterID: null
          }
        }
      }
    default:
      return state
  }
}
