import ArrowBack from '@mui/icons-material/ArrowBack'
import {IconButton} from '@mui/material'
import {WithStyles, withStyles} from '@mui/styles'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import {Input} from '../../../bit-components/input/index'

import {Control} from 'react-hook-form'
import {connect, useDispatch, useSelector} from 'react-redux'
import {compose} from 'redux'
import {SortOrder} from '../../../bit-components/datatable/index'
import {useDebounce} from '../../../hooks'
import {
  GetAllJobClustersV2,
  GetAllJobClustersV2Input,
  SelectionOnGetAllJobClustersV2
} from '../../../modules/workflows/graphqlAPIs/getAllJobClusters'
import {GetAllJobClustersV2Schema} from '../../../modules/workflows/graphqlAPIs/getAllJobClusters/index.gqlTypes'
// import {getJobClusters} from '../../../modules/workflows/graphqlAPIs/getAllJobClusters/index.thunk'
import {GQL as getAllJobClustersGql} from '../../../modules/workflows/graphqlAPIs/getAllJobClusters/indexGql'
import {
  GetAllClustersInput,
  SelectionOnData as IAllPurposeClusterSelectionOnData,
  SelectionOnGetAllClusters
} from '../../../modules/workflows/graphqlAPIs/getAllPurposeClusters'
import {getAllPurposeClusters} from '../../../modules/workflows/graphqlAPIs/getAllPurposeClusters/index.thunk'
import {
  GetAllPurposeClusters as GetAllPurposeClustersForWorkflow,
  GetAllPurposeClustersInput as GetAllPurposeClustersForWorkflowInput
} from '../../../modules/workflows/graphqlAPIs/getAllPurposeClustersForWorkflow'
import {GetAllPurposeClustersSchema as GetAllPurposeClustersForWorkflowSchema} from '../../../modules/workflows/graphqlAPIs/getAllPurposeClustersForWorkflow/index.gqlTypes'
import {GQL as getAllPurposeClustersForWorkflowGql} from '../../../modules/workflows/graphqlAPIs/getAllPurposeClustersForWorkflow/indexGql'
import {ISidepanel} from '../../../modules/workflows/pages/workflowCreate'
import {
  resetWorkflowAllPurposeClusters,
  resetWorkflowJobCluster,
  setWorkflowAllPurposeClusters,
  setWorkflowJobClusters
} from '../../../modules/workflows/pages/workflowCreate/actions'
import {CurrentWorkflowClusters} from '../../../modules/workflows/pages/workflowCreate/reducer'
import {IWorkflowCreateForm} from '../../../modules/workflows/types/common.types'
import {attachCluster} from '../../../modules/workspace/pages/graphqlApis/attachCluster/attachCluster.thunk'
import {CommonState} from '../../../reducers/commonReducer'
import {InjectableStore, StoreState} from '../../../store'
import {Typography} from '../../../themes'
import {useGQL} from '../../../utils/useGqlRequest'
import {getUserDetails} from '../../../utils/user'
import AllPurposeClusterList from '../allPurposeClusterList'
import {ClusterCardProps} from '../clusterCard'
import ClusterCard from '../clusterCard'
import JobClusterList from '../jobClusterList'
import styles from './indexJSS'

const CLUSTERS_PAGE_SIZE = 10
interface IProps extends WithStyles<typeof styles> {
  onBackClick: () => void
  setSidepanel: React.Dispatch<React.SetStateAction<ISidepanel>>
  taskIndex: number
  jobClustersUsedInWorkflow: ClusterCardProps[]
}

export const CLUSTER_TYPES = {
  ALL_PURPOSE: 'basic',
  JOB: 'job'
}

const ClusterList = (props: IProps) => {
  const {
    classes,
    onBackClick,
    setSidepanel,
    taskIndex,
    jobClustersUsedInWorkflow
  } = props
  const [search, setSearch] = useState<string>('')
  const [value, setValue] = useState(0)
  const clustersState = useSelector(
    (state: CommonState) => state.workflowCreateReducer.clusters
  )
  const dispatch = useDispatch()

  // Job Clusters Query
  const jobClustersOffset = useRef<number>(0)
  const {
    output: {
      response: getAllJobClustersResponse,
      loading: getAllJobClustersLoading,
      errors: getAllJobClustersErrors
    },
    triggerGQLCall: triggerGetAllJobClusters
  } = useGQL<GetAllJobClustersV2Input, GetAllJobClustersV2>()

  useEffect(() => {
    if (jobClustersUsedInWorkflow) {
      const filteredClusters = jobClustersUsedInWorkflow.filter((cluster) =>
        cluster.name.toLowerCase().includes(search.toLowerCase())
      )

      dispatch(
        setWorkflowJobClusters(
          filteredClusters,
          'current',
          filteredClusters.length
        )
      )
    }
  }, [jobClustersUsedInWorkflow, search])

  const fetchAllJobClusters = useCallback(() => {
    const userDetails = getUserDetails()
    const users = []
    if (userDetails) {
      users.push(userDetails.email)
    }
    const filteredClusters = jobClustersUsedInWorkflow
      .filter((cluster) =>
        cluster.name.toLowerCase().includes(search.toLowerCase())
      )
      .map((cluster) => cluster.id)
    triggerGetAllJobClusters(
      {
        ...getAllJobClustersGql,
        variables: {
          query: search,
          offset: jobClustersOffset.current,
          pageSize: CLUSTERS_PAGE_SIZE,
          filters: {
            exclude_users: [],
            status: [],
            user: users,
            exclude_clusters: [...filteredClusters]
          },
          sortBy: 'created_at',
          sortOrder: SortOrder.DESC
        }
      },
      GetAllJobClustersV2Schema
    )
  }, [jobClustersOffset, search])

  useEffect(() => {
    if (getAllJobClustersResponse !== null) {
      jobClustersOffset.current =
        jobClustersOffset.current +
        (getAllJobClustersResponse?.getAllJobClustersV2?.data ?? []).length
      const clusters: ClusterCardProps[] =
        getAllJobClustersResponse?.getAllJobClustersV2?.data?.map((cluster) => {
          return {
            id: cluster.job_cluster_definition_id,
            name: cluster.cluster_name,
            runtime: cluster.runtime,
            memory: cluster.memory,
            core: cluster.cores,
            type: 'job',
            estimatedCost: cluster.estimated_cost,
            createdAt: cluster.created_at,
            status: ''
          }
        }) ?? []
      const prevClusters = clustersState.jobClusters.other.clusters
      const newClusters = prevClusters.concat(clusters)
      dispatch(
        setWorkflowJobClusters(
          newClusters,
          'other',
          getAllJobClustersResponse?.getAllJobClustersV2?.total_count ?? 0
        )
      )
    } else if (getAllJobClustersErrors !== null) {
      // TODO: Handle error
    }
  }, [getAllJobClustersErrors, getAllJobClustersResponse])
  // Current Workflow Job Clusters

  useDebounce(
    () => {
      jobClustersOffset.current = 0
      dispatch(resetWorkflowJobCluster('other'))
      fetchAllJobClusters()
    },
    500,
    [search],
    {avoidWaitOnFirstRender: true, avoidCallOnFirstRender: false}
  )

  // All Purpose Clusters
  //
  // Current
  //
  const currentAPCOffset = useRef(0)
  const {
    output: {
      response: currentAPCResponse,
      loading: currentAPCLoading,
      errors: currentAPCErrors
    },

    triggerGQLCall: triggerFetchCurrentAPC
  } = useGQL<
    GetAllPurposeClustersForWorkflowInput,
    GetAllPurposeClustersForWorkflow
  >()

  const fetchCurrentAPC = useCallback(() => {
    const userDetails = JSON.parse(localStorage.getItem('x-user-details'))
    const users = []
    if (userDetails) {
      users.push(userDetails.email)
    }
    triggerFetchCurrentAPC(
      {
        ...getAllPurposeClustersForWorkflowGql,
        variables: {
          pageSize: CLUSTERS_PAGE_SIZE,
          offset: currentAPCOffset.current,
          query: search,
          sortBy: 'created_on',
          sortOrder: SortOrder.DESC,
          filters: {
            user: users
          },
          excludeFilters: {
            user: []
          }
        }
      },
      GetAllPurposeClustersForWorkflowSchema
    )
  }, [currentAPCOffset.current, search])

  useDebounce(
    () => {
      currentAPCOffset.current = 0
      dispatch(resetWorkflowAllPurposeClusters('current'))
      fetchCurrentAPC()
    },
    500,
    [search],
    {avoidWaitOnFirstRender: true, avoidCallOnFirstRender: false}
  )

  useEffect(() => {
    if (currentAPCResponse && !currentAPCLoading) {
      currentAPCOffset.current =
        currentAPCOffset.current +
        currentAPCResponse?.getAllPurposeClusters?.data.length
      const data: ClusterCardProps[] =
        currentAPCResponse?.getAllPurposeClusters?.data.map((cluster) => {
          return {
            id: cluster.cluster_id,
            status: cluster.status,
            core: cluster.total_cores,
            memory: cluster.total_memory,
            createdAt: cluster.created_on,
            name: cluster.name,
            runtime: cluster.runtime,
            estimatedCost: cluster.estimated_cost,
            type: 'all_purpose'
          }
        })
      dispatch(
        setWorkflowAllPurposeClusters(
          clustersState.allPurposeClusters.current.clusters.concat(data),
          'current',
          currentAPCResponse?.getAllPurposeClusters?.result_size ?? 0
        )
      )
    } else if (currentAPCErrors && !currentAPCLoading) {
    }
  }, [currentAPCResponse, currentAPCLoading, currentAPCErrors])

  // Other Clusters
  //

  const otherAPCOffset = useRef(0)
  const {
    output: {
      response: otherAPCResponse,
      loading: otherAPCLoading,
      errors: otherAPCErrors
    },

    triggerGQLCall: triggerFetchOtherAPC
  } = useGQL<
    GetAllPurposeClustersForWorkflowInput,
    GetAllPurposeClustersForWorkflow
  >()

  const fetchOtherAPC = useCallback(() => {
    const userDetails = JSON.parse(localStorage.getItem('x-user-details'))
    const users = []
    if (userDetails) {
      users.push(userDetails.email)
    }
    triggerFetchOtherAPC(
      {
        ...getAllPurposeClustersForWorkflowGql,
        variables: {
          pageSize: CLUSTERS_PAGE_SIZE,
          offset: otherAPCOffset.current,
          query: search,
          sortBy: 'created_on',
          sortOrder: 'desc',
          filters: {
            user: []
          },
          excludeFilters: {
            user: users
          }
        }
      },
      GetAllPurposeClustersForWorkflowSchema
    )
  }, [otherAPCOffset.current, search])

  useDebounce(
    () => {
      otherAPCOffset.current = 0
      dispatch(resetWorkflowAllPurposeClusters('other'))
      fetchOtherAPC()
    },
    500,
    [search],
    {avoidWaitOnFirstRender: true, avoidCallOnFirstRender: false}
  )

  useEffect(() => {
    if (otherAPCResponse && !otherAPCLoading) {
      otherAPCOffset.current =
        otherAPCOffset.current +
        otherAPCResponse?.getAllPurposeClusters?.data.length
      const data: ClusterCardProps[] =
        otherAPCResponse?.getAllPurposeClusters?.data.map((cluster) => {
          return {
            id: cluster.cluster_id,
            status: cluster.status,
            core: cluster.total_cores,
            memory: cluster.total_memory,
            createdAt: cluster.created_on,
            name: cluster.name,
            runtime: cluster.runtime,
            estimatedCost: cluster.estimated_cost,
            type: 'all_purpose'
          }
        })
      dispatch(
        setWorkflowAllPurposeClusters(
          clustersState.allPurposeClusters.other.clusters.concat(data),
          'other',
          otherAPCResponse?.getAllPurposeClusters?.result_size ?? 0
        )
      )
    } else if (otherAPCErrors && !otherAPCLoading) {
    }
  }, [otherAPCResponse, otherAPCLoading, otherAPCErrors])

  const tabs = useMemo(() => {
    return [
      {
        label: 'My Job Clusters',
        count:
          clustersState.jobClusters.current.total +
          clustersState.jobClusters.other.total
      },
      {
        label: 'All Purpose Clusters',
        count:
          clustersState.allPurposeClusters.current.total +
          clustersState.allPurposeClusters.other.total
      }
    ]
  }, [
    clustersState.jobClusters.current.total,
    clustersState.jobClusters.other.total,
    clustersState.allPurposeClusters.other,
    clustersState.allPurposeClusters.current
  ])

  const attachedCluster = clustersState.attachedClusters[taskIndex]

  return (
    <div className={classes.container}>
      <div className={classes.headerContainer}>
        <div className={classes.header}>
          <IconButton disableRipple sx={{color: 'white'}} onClick={onBackClick}>
            <ArrowBack />
          </IconButton>
          <h1
            style={Typography.is('body1')
              .with({
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '20px',
                color: '#D9D9D9'
              })
              .toCSS()}
          >
            Select a Cluster for this task
          </h1>
        </div>

        <div className={classes.tabsWrapper}>
          {tabs.map((tab, index) => {
            return (
              <div
                key={tab.label}
                className={`${classes.tabContainer}${
                  index === value ? ' selected' : ''
                }`}
                onClick={() => setValue(index)}
                data-testid={`workflow-cluster-list-tab-${index}`}
              >
                {tab.label}
                <span className={`${index === value ? 'selected' : ''}`}>
                  {tab.count}
                </span>
              </div>
            )
          })}
        </div>

        <Input
          label='Search by cluster name'
          showLabelAsPlaceHolder
          name='Input'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid='workflow-job-cluster-search'
        />
        {attachedCluster && (
          <div style={{width: '100%', marginTop: '20px'}}>
            <ClusterCard
              {...attachedCluster}
              taskIndex={taskIndex}
              variant='secondary'
              group='none'
            />
          </div>
        )}
      </div>
      {value === 0 ? (
        <JobClusterList
          currentWorkflowClustersLoading={false}
          otherWorkflowClustersLoading={getAllJobClustersLoading}
          search={search}
          fetchOtherWorkflowClusters={() => fetchAllJobClusters()}
          setSidepanel={setSidepanel}
          taskIndex={taskIndex}
        />
      ) : (
        <AllPurposeClusterList
          currentClustersLoading={currentAPCLoading}
          otherClustersLoading={otherAPCLoading}
          fetchCurrentClusters={fetchCurrentAPC}
          fetchOtherClusters={fetchOtherAPC}
          taskIndex={taskIndex}
        />
      )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  allPurposeClusters: state.workflowCreateReducer.allPurposeClusters,
  jobClusters: state.workflowCreateReducer.jobClusters
})

const mapDispatchToProps = (dispatch) => {
  return {
    getAllPurposeClusters: (
      payload: GetAllClustersInput,
      prevData: SelectionOnGetAllClusters
    ) => getAllPurposeClusters(dispatch, payload, prevData)
    // getJobClusters: (
    //   payload: GetAllJobClustersV2Input,
    //   prevData: SelectionOnGetAllJobClustersV2
    // ) => getJobClusters(dispatch, payload, prevData)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(ClusterList)

export default StyleComponent
