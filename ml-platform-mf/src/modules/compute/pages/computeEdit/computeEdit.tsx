import React, {useEffect, useRef, useState} from 'react'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import {withStyles, WithStyles} from '@mui/styles'
import {connect} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {compose} from 'redux'
import {setShowGlobalSpinner} from '../../../../actions/commonActions'
import ClusterLibraries from '../../../../components/compute/clusterLibraries'
import ClusterLogsV2 from '../../../../components/compute/clusterLogsV2'
import ComputeTitleBar from '../../../../components/compute/computeTitleBar/computeTitleBar'
import Dashboards from '../../../../components/compute/dashboards'
import {routes} from '../../../../constants'
import ClusterLogs from '../../../../layouts/clusterLogs/clusterLogs'
import {CommonState} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {useGQL} from '../../../../utils/useGqlRequest'
import {AddRecentlyVisitedCluster} from '../../graphQL/queries/addRecentlyVisitedCluster'
import {AddRecentlyVisitedClusterSchema} from '../../graphQL/queries/addRecentlyVisitedCluster/index.gqlTypes'
import {GQL as addRecentlyVisitedClusterGql} from '../../graphQL/queries/addRecentlyVisitedCluster/indexGql'
import {
  GetComputeCluster,
  GetComputeClusterInput,
  SelectionOnData as IComputeClusterDetails
} from '../computeCreate/queryComputeDetails/getComputeCluster'
import {GetComputeClusterSchema} from '../computeCreate/queryComputeDetails/getComputeCluster.gqlTypes'
import {GQL as getComputeClusterGql} from '../computeCreate/queryComputeDetails/getComputeClusterGql'
import ComputeDetails from '../computeDetails/computeDetails'
import {TAB_CONFIG} from '../constant'
import {GetSparkHistoryServerInput} from '../graphqlApis/getSparkHistoryServer'
import {getSparkHistoryServer} from '../graphqlApis/getSparkHistoryServer/index.thunk'
import {IClusterStatus, IComputeState} from '../graphqlApis/reducer'
import {StartSparkHistoryServerInput} from '../graphqlApis/startSparkHistoryServer'
import {startSparkHistoryServer} from '../graphqlApis/startSparkHistoryServer/index.thunk'
import {getKeyByValue} from '../utils'
import styles from './computeEditJSS'
interface TabPanelProps extends WithStyles<typeof styles> {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const {children, value, classes, index, ...other} = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className={value === index ? classes.dataBoxContent : ''}
    >
      {value === index && (
        <Box className={classes.dataBoxContent} sx={{p: 0, pt: 3}}>
          <Typography className={classes.dataBoxContent}>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

interface IProps extends WithStyles<typeof styles> {
  match: any
  clusterStatusState: IClusterStatus
  sparkHistoryServer: IComputeState['sparkHistoryServer']
  startSparkHistoryServerData: IComputeState['startSparkHistoryServer']
  setShowGlobalSpinner: (payload: boolean) => void
  getSparkHistoryServer: (payload: GetSparkHistoryServerInput) => void
  startSparkHistoryServer: (payload: StartSparkHistoryServerInput) => void
}

const computeEdit = (props: IProps) => {
  const [value, setValue] = React.useState(0)
  const {
    classes,
    match,
    clusterStatusState,
    sparkHistoryServer,
    startSparkHistoryServerData,
    setShowGlobalSpinner,
    getSparkHistoryServer,
    startSparkHistoryServer
  } = props
  const [isSparkDashboardActive, setIsSparkDashboardActive] = useState(true)
  const history = useHistory()
  const [sparkHistoryDashboardStatus, setSparkHistoryDashboardStatus] =
    useState('inactive')
  const timeoutRef = useRef(null)
  const clusterId = match.params.clusterId
  const {
    output: {
      response: addRecentlyVisitedClusterResponse,
      loading: addRecentlyVisitedClusterLoading,
      errors: addRecentlyVisitedClusterError
    },
    triggerGQLCall: addRecentlyVisitedCluster
  } = useGQL<null, AddRecentlyVisitedCluster>()

  const [computeClusterDetails, setComputeClusterDetails] =
    useState<IComputeClusterDetails>()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    history.replace(
      routes.clusterEditPage
        .replace(':clusterId', clusterId)
        .replace(':tab', getKeyByValue(TAB_CONFIG, newValue)) + '/'
    )
  }

  const {
    output: {response: clusterDetails, loading: clusterDetailsLoading},
    triggerGQLCall: getClusterDetails
  } = useGQL<GetComputeClusterInput, GetComputeCluster>()

  useEffect(() => {
    const splittedPath = history.location.pathname.split('/')
    const activeTab = splittedPath[splittedPath.length - 2]
    if (activeTab in TAB_CONFIG) {
      setValue(TAB_CONFIG[activeTab])
    } else {
      setValue(0)
    }
  }, [history.location.pathname])

  useEffect(() => {
    getClusterDetailsFunc()
    addRecentlyVisitedClusterFunc()
    getSparkHistoryServer({resourceId: clusterId})
  }, [clusterId])

  useEffect(() => {
    if (
      (sparkHistoryServer && sparkHistoryServer?.data?.status === 'creating') ||
      sparkHistoryServer?.data?.status === 'created'
    ) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        getSparkHistoryServer({resourceId: clusterId})
        timeoutRef.current = null // Clear the ref after the timeout completes
      }, 5000)

      // setTimeout(() => {
      //   getSparkHistoryServer({resourceId: clusterId})
      // }, 5000)
    }
  }, [sparkHistoryServer])

  useEffect(() => {
    if (
      startSparkHistoryServerData &&
      startSparkHistoryServerData?.status === API_STATUS.SUCCESS
    ) {
      getSparkHistoryServer({resourceId: clusterId})
    }
  }, [startSparkHistoryServerData])

  const onStartSparkHistoryServer = () => {
    setSparkHistoryDashboardStatus('creating')
    startSparkHistoryServer({
      resource: clusterId,
      ttl: 180
    })
  }

  useEffect(() => {
    if (sparkHistoryServer?.data?.status === 'active') {
      setSparkHistoryDashboardStatus('active')
    } else if (sparkHistoryServer?.data?.status === 'inactive') {
      setSparkHistoryDashboardStatus('inactive')
    } else if (sparkHistoryServer?.data?.status === 'creating') {
      setSparkHistoryDashboardStatus('creating')
    } else if (sparkHistoryServer?.data?.status === 'created') {
      setSparkHistoryDashboardStatus('creating')
    }
  }, [sparkHistoryServer])

  useEffect(() => {
    if (startSparkHistoryServerData?.status === API_STATUS.ERROR) {
      setSparkHistoryDashboardStatus('failed')
    }
  }, [startSparkHistoryServerData])

  const addRecentlyVisitedClusterFunc = () => {
    const variables = {
      clusterId
    }
    addRecentlyVisitedCluster(
      {
        ...addRecentlyVisitedClusterGql,
        variables
      },
      AddRecentlyVisitedClusterSchema
    )
  }

  const getClusterDetailsFunc = () => {
    if (clusterId) {
      const variables = {
        clusterId
      }
      getClusterDetails(
        {...getComputeClusterGql, variables},
        GetComputeClusterSchema
      )
    }
  }

  useEffect(() => {
    setShowGlobalSpinner(clusterDetailsLoading)
  }, [clusterDetailsLoading])

  useEffect(() => {
    if (
      !clusterDetailsLoading &&
      clusterDetails &&
      clusterDetails.getComputeCluster &&
      clusterDetails.getComputeCluster.data
    ) {
      setComputeClusterDetails(clusterDetails.getComputeCluster.data)
    }
  }, [clusterDetails])

  const updateClustername = (name) => {
    setComputeClusterDetails({...computeClusterDetails, clusterName: name})
  }

  const updateClusterStatus = (status: string) => {
    setComputeClusterDetails({...computeClusterDetails, status})
  }

  const updateTags = (tags: Array<string>) => {
    setComputeClusterDetails({...computeClusterDetails, tags})
  }

  const computeCurrentStatus =
    clusterStatusState.data &&
    clusterStatusState.data.clusterId === computeClusterDetails?.clusterId
      ? clusterStatusState.data.status
      : computeClusterDetails?.status

  useEffect(() => {
    if (computeClusterDetails?.dashboards?.sparkUIUrl) {
      const sparkUIUrl = computeClusterDetails.dashboards.sparkUIUrl + 'jobs/'
      const controller = new AbortController()

      fetch(sparkUIUrl, {
        method: 'HEAD',
        signal: controller.signal
      })
        .then((res) => {
          if (res && (res.status === 502 || res.status === 404)) {
            setIsSparkDashboardActive(false)
          } else {
            setIsSparkDashboardActive(true)
          }
        })
        .catch((err) => {
          setIsSparkDashboardActive(false)
        })
    }
  }, [computeClusterDetails])

  return (
    <div className={classes.container}>
      <div className={classes.stickyHeader}>
        <ComputeTitleBar
          clusterId={computeClusterDetails?.clusterId}
          tags={computeClusterDetails?.tags}
          clusterName={computeClusterDetails?.clusterName || ''}
          ownerName={computeClusterDetails?.user}
          clusterStatus={computeClusterDetails?.status}
          createdOn={computeClusterDetails?.createdOn}
          showStatus={true}
          showTags={true}
          showOwner={true}
          showActions={true}
          updateClustername={updateClustername}
          updateTags={updateTags}
          updateClusterStatus={updateClusterStatus}
          disableEdit={Boolean(computeClusterDetails?.isJobCluster || false)}
        />
      </div>
      <Box className={classes.dataBox} sx={{width: '100%'}}>
        <Box sx={{borderBottom: 1, borderColor: 'divider', marginTop: 0}}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label='basic tabs example'
          >
            <Tab label='CLUSTER DETAILS' {...a11yProps(0)} />
            <Tab label='LIBRARIES' {...a11yProps(1)} />
            <Tab
              label='EVENTS'
              {...a11yProps(2)}
              iconPosition='end'
              data-testid='cluster-details-page-header'
            ></Tab>
            <Tab label='DASHBOARDS' {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel classes={classes} value={value} index={0}>
          <ComputeDetails
            defaultClusterDetails={computeClusterDetails}
            clusterId={computeClusterDetails?.clusterId}
            getClusterDetailsFunc={getClusterDetailsFunc}
          />
        </TabPanel>
        {/* <TabPanel classes={classes} value={value} index={1}>
          <CodespacesList clusterId={computeClusterDetails?.clusterId} />
        </TabPanel> */}
        <TabPanel classes={classes} value={value} index={1}>
          <ClusterLibraries
            classes={classes}
            clusterId={clusterId}
            clusterStatus={computeClusterDetails?.status}
          />
        </TabPanel>
        <TabPanel classes={classes} value={value} index={2}>
          <ClusterLogsV2 clusterId={clusterId} />
          {/* <ClusterLogs
            clusterName={computeClusterDetails?.clusterName || ''}
            clusterId={clusterId}
            computeCurrentStatus={computeCurrentStatus}
          /> */}
        </TabPanel>
        <TabPanel classes={classes} value={value} index={3}>
          <Dashboards
            dashboards={computeClusterDetails?.dashboards}
            isSparkDashboardActive={isSparkDashboardActive}
            computeCurrentStatus={computeCurrentStatus}
            sparkHistoryServer={sparkHistoryServer}
            onStartSparkHistoryServer={onStartSparkHistoryServer}
            sparkHistoryDashboardStatus={sparkHistoryDashboardStatus}
            isJobCluster={computeClusterDetails?.isJobCluster}
          />
        </TabPanel>
      </Box>
    </div>
  )
}

const mapStateToProps = (state: CommonState) => {
  return {
    clusterStatusState: state.computeReducer.clusterStatus,
    sparkHistoryServer: state.computeReducer.sparkHistoryServer,
    startSparkHistoryServerData: state.computeReducer.startSparkHistoryServer
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setShowGlobalSpinner: (payload: boolean) =>
      dispatch(setShowGlobalSpinner(payload)),
    getSparkHistoryServer: (payload: GetSparkHistoryServerInput) =>
      getSparkHistoryServer(dispatch, payload),
    startSparkHistoryServer: (payload: StartSparkHistoryServerInput) =>
      startSparkHistoryServer(dispatch, payload)
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(computeEdit)

export default styleComponent
