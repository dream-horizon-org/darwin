import FullscreenIcon from '@mui/icons-material/Fullscreen'
import GitHubIcon from '@mui/icons-material/GitHub'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Icons} from '../../../../bit-components/icon/index'
import CreateCodespaceDrawer from '../../../../components/workspace/createCodespaceDrawer/createCodespaceDrawer'
import CreateProjectDrawer from '../../../../components/workspace/createProjectDrawer/createProjectDrawer'
import ImportProjectDrawer from '../../../../components/workspace/importProjectDrawer/importProjectDrawer'
import {errorTypes} from '../../../../components/workspace/workspaceLevelError/constants'
import WorkspaceLevelError from '../../../../components/workspace/workspaceLevelError/workspaceLevelError'
import {API_STATUS} from '../../../../utils/apiUtils'
import {
  setCodespaces,
  setInfoBar,
  setProjectDetails,
  setSelectedCodespace,
  setSelectedProject
} from '../actions'
import RightDrawer from '../rightDrawer/rightDrawer'

import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import {Tooltip} from '@mui/material'
import {useHistory} from 'react-router'
import {
  setShowGlobalSpinner,
  setSideNavVisible,
  setTopNavVisible
} from '../../../../actions/commonActions'
import GenericSnackbar from '../../../../components/genericSnackbar'
import InfoBar from '../../../../components/infoBar'
import useQuery from '../../../../components/useQuery'
import EditCodespaceDrawer from '../../../../components/workspace/editCodespaceDrawer/editCodespaceDrawer'
import EditProjectDrawer from '../../../../components/workspace/editProjectDrawer/editProjectDrawer'
import ProjectDropdown from '../../../../components/workspace/projectDropdown/projectDropdown'
import {loaderTypes} from '../../../../components/workspace/workspaceLevelLoaders/constants'
import WorkspaceLevelLoaders from '../../../../components/workspace/workspaceLevelLoaders/workspaceLevelLoaders'
import {routes} from '../../../../constants'
import {SelectionOnAttachedCluster} from '../graphqlApis/attachCluster/attachCluster'
import {SelectionOnCreateCodespace} from '../graphqlApis/createCodespace/createCodespace'
import {createCodespace} from '../graphqlApis/createCodespace/createCodespace.thunk'
import {createProject} from '../graphqlApis/createProject/createProject.thunk'
import {DeleteCodespaceInput} from '../graphqlApis/deleteCodespace/deleteCodespace'
import {deleteCodespace} from '../graphqlApis/deleteCodespace/deleteCodespace.thunk'
import {DeleteProjectInput} from '../graphqlApis/deleteProject/deleteProject'
import {deleteProject} from '../graphqlApis/deleteProject/deleteProject.thunk'
import {EditCodespaceInput} from '../graphqlApis/editCodespace/editCodespace'
import {editCodespace} from '../graphqlApis/editCodespace/editCodespace.thunk'
import {EditProjectInput} from '../graphqlApis/editProject/editProject'
import {editProject} from '../graphqlApis/editProject/editProject.thunk'
import {GetClusterResourcesInput} from '../graphqlApis/getClusterResources/getClusterResources'
import {getClusterResources} from '../graphqlApis/getClusterResources/getClusterResources.thunk'
import {clusterStatuses} from '../graphqlApis/getClusterStatus/constants'
import {CLUSTER_STATUSES} from '../graphqlApis/getClusterStatusV2/constants'
import {GetComputeClusterInput} from '../graphqlApis/getClusterStatusV2/getClusterStatus'
import {getWorkspaceClusterStatus} from '../graphqlApis/getClusterStatusV2/getClusterStatus.thunk'
import {SelectionOnGetCodespaces} from '../graphqlApis/getCodespaces/getCodespaces'
import {getCodespaces} from '../graphqlApis/getCodespaces/getCodespaces.thunk'
import {SelectionOnData as ILastSelectedCodespace} from '../graphqlApis/getLastSelectedCodespace/getLastSelectedCodespace'
import {getLastSelectedCodespace} from '../graphqlApis/getLastSelectedCodespace/getLastSelectedCodespace.thunk'
import {GetLastSyncedTimeForCodespaceInput} from '../graphqlApis/getLastSyncTime/getLastSyncTime'
import {getLastSyncTime} from '../graphqlApis/getLastSyncTime/getLastSyncTime.thunk'
import {getProjects} from '../graphqlApis/getProjects/getProjects.thunk'
import {importProject} from '../graphqlApis/importProject/importProject.thunk'
import {
  launchCodespace,
  launchCodespaceOnceClusterActivated
} from '../graphqlApis/launchCodespace/launchCodespace.thunk'
import {
  IEditCodespace,
  IEditProject,
  INFO_BAR_TYPE,
  IProjectList,
  ISelectedCodespace,
  IWorkspaceState
} from '../reducer'

import config from 'config'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {logEvent} from '../../../../utils/events'
import {
  createCodespace as createCodespaceAction,
  createProject as createProjectAction
} from '../actions'
import styles from './projectJSS'

interface IProps extends WithStyles<typeof styles> {
  createProjectState: IWorkspaceState['createProject']
  createProjectFun: (data) => void
  createCodespace: (payload) => void
  setProjectDetailsFun: (data) => void
  getProjects: (data) => void
  setCodespacesFunc: (data) => void
  getCodespaces: (data) => void
  getLastSelectedCodespace: () => void
  setSelectedCodespace: (data) => void
  setLaunchCodespace: (data) => void
  setTopNavVisible: (value: boolean) => void
  setSideNavVisible: (value: boolean) => void
  projectDetailsState: any
  projectList: IProjectList
  codespaces: {
    status: API_STATUS
    data: SelectionOnGetCodespaces
    error: any
  }
  selectedProject: any
  lastSelectedCodespace: {status: API_STATUS; data: ILastSelectedCodespace}
  launchCodespace: any
  selectedCodespace: ISelectedCodespace
  importedProject: any
  attachedCluster: SelectionOnAttachedCluster
  setSelectedProjectFun: (data: string) => void
  setImportProject: (data) => void
  attachClusterData: any
  lastSyncTimeData: {data: string}
  createCodespaceState: {
    status: API_STATUS
    data: SelectionOnCreateCodespace
  }
  sideNavState: boolean
  getClusterResourcesFun: (payload: any) => void
  match: any
  deleteCodespace: (data: DeleteCodespaceInput) => void
  deleteProject: (data: DeleteProjectInput) => void
  editCodespace: (data: EditCodespaceInput) => void
  editProject: (data: EditProjectInput) => void
  editCodespaceResponse: IEditCodespace
  editProjectResponse: IEditProject
  setShowGlobalSpinner: (payload: boolean) => void
  clusterCancellationForPolling: IWorkspaceState['clusterCancellationForPolling']
  setInfoBar: (infoBar: IWorkspaceState['infoBar']) => void
  stopCluster: IWorkspaceState['stopCluster']
  startCluster: IWorkspaceState['startCluster']
  detachCluster: IWorkspaceState['detachCluster']
  getWorkspaceClusterStatus: (
    payload: GetComputeClusterInput,
    prevData: IWorkspaceState['workspaceClusterStatus']['data']
  ) => void
  workspaceClusterStatus: IWorkspaceState['workspaceClusterStatus']
  clusterResources: IWorkspaceState['clusterResources']
  launchCodespaceOnceClusterActivatedFunc: (payload: {
    clusterId: string
    projectId: string
    codespaceId: string
  }) => void
  resetCreateProject: () => any
  resetCreateCodespace: () => any
}

const Project = (props: IProps) => {
  let lastSyncTimeoutId = null
  let clusterResourcesTimeoutId = null
  let workspaceStatusTimeoutId = null
  const {
    classes,
    createProjectState,
    createProjectFun,
    createCodespace,
    setProjectDetailsFun,
    getCodespaces,
    setCodespacesFunc,
    getLastSelectedCodespace,
    setSelectedCodespace,
    setLaunchCodespace,
    codespaces,
    lastSelectedCodespace,
    launchCodespace,
    selectedCodespace,
    setSelectedProjectFun,
    setImportProject,
    attachClusterData,
    lastSyncTimeData,
    attachedCluster,
    createCodespaceState,
    sideNavState,
    getClusterResourcesFun,
    match,
    deleteCodespace,
    deleteProject,
    editCodespace,
    editProject,
    selectedProject,
    editCodespaceResponse,
    editProjectResponse,
    setSideNavVisible,
    setTopNavVisible,
    setShowGlobalSpinner,
    clusterCancellationForPolling,
    setInfoBar,
    stopCluster,
    startCluster,
    detachCluster,
    getWorkspaceClusterStatus,
    workspaceClusterStatus,
    clusterResources,
    launchCodespaceOnceClusterActivatedFunc,
    resetCreateProject,
    resetCreateCodespace
  } = props
  const queryParams = useQuery()
  const labUrl = queryParams.get('lab_url')
  const {cId, pId} = match.params
  const history = useHistory()
  const [createPrjDrawerOpen, setCreatePrjDrawerOpen] = useState(false)
  const [createCodeSpaceDrawerOpen, setCreateCodeSpaceDrawerOpen] =
    useState(false)
  const [importProjectDrawerOpen, setImportProjectDrawerOpen] = useState(false)
  const [editProjectDrawer, setEditProjectDrawer] = useState({
    open: false,
    projectName: null,
    projectId: null
  })
  const [editCodespaceDrawer, setEditCodespaceDrawer] = useState({
    open: false,
    codespaceName: null,
    codespaceId: null,
    projectId: null
  })
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(
    null
  )
  const [fullScreenJupyter, setFullScreenJupyter] = useState<boolean>(false)

  const openCodespace = (pId, cId) => {
    history.replace(
      `${routes.sharedWorkspace
        .replace(':pId', pId)
        .replace(':cId', cId)}/?lab_url=`
    )
  }

  useEffect(() => {
    logEvent(EventTypes.WORKSPACE.PAGE_OPEN, SeverityTypes.INFO)
  }, [])

  useEffect(() => {
    if (
      (createProjectState.status === API_STATUS.SUCCESS ||
        createCodespaceState.status === API_STATUS.SUCCESS) &&
      selectedCodespace?.data
    ) {
      openCodespace(
        selectedCodespace.data.project_id,
        selectedCodespace.data.codespace_id
      )
      resetCreateProject()
      resetCreateCodespace()
    }
  }, [
    createProjectState.status,
    createCodespaceState.status,
    selectedCodespace
  ])

  useEffect(() => {
    if (
      stopCluster.status === API_STATUS.SUCCESS ||
      detachCluster.status === API_STATUS.SUCCESS
    ) {
      launchCurrentCodespace()
    }
  }, [stopCluster.status, detachCluster.status])

  useEffect(() => {
    if (startCluster.status === API_STATUS.SUCCESS) {
      launchCodespaceHandler()
    }
  }, [startCluster.status])

  const getInitialData = () => {
    if (
      pId &&
      cId &&
      (selectedCodespace?.data?.project_id !== pId ||
        selectedCodespace?.data?.codespace_id !== cId)
    ) {
      if (clusterCancellationForPolling.cancel)
        clusterCancellationForPolling.cancel()

      const variables = {
        projectId: pId,
        codespaceId: cId
      }
      setLaunchCodespace(variables)
      setSubMenuAnchorEl(null)
      setAnchorEl(null)
    } else if (!pId || !cId) {
      getLastSelectedCodespace()
    }
  }

  useEffect(() => {
    getInitialData()
  }, [cId, pId])

  const launchCurrentCodespace = () => {
    if (pId && cId) {
      const variables = {
        projectId: pId,
        codespaceId: cId
      }
      setLaunchCodespace(variables)
      setSubMenuAnchorEl(null)
      setAnchorEl(null)
    } else {
      getLastSelectedCodespace()
    }
  }

  const launchCodespaceHandler = () => {
    if (pId && cId) {
      launchCodespaceOnceClusterActivatedFunc({
        clusterId: attachedCluster?.cluster_id,
        projectId: pId,
        codespaceId: cId
      })
      setSubMenuAnchorEl(null)
      setAnchorEl(null)
    } else {
      getLastSelectedCodespace()
    }
  }

  const setNoInternetConnectionCB = () => {
    setNoInternetConnection()
  }

  const internetHandlingRecordCB = () => {
    launchCurrentCodespace()
  }

  useEffect(() => {
    window.addEventListener('offline', setNoInternetConnectionCB)
    window.addEventListener('online', internetHandlingRecordCB)

    return () => {
      window.removeEventListener('offline', setNoInternetConnectionCB)
      window.removeEventListener('online', internetHandlingRecordCB)
      jupyterFullScreenExitEventHandler()
    }
  }, [])

  useEffect(() => {
    if (createCodespaceState.status === API_STATUS.SUCCESS) {
      setCreateCodeSpaceDrawerOpen(false)
    }
  }, [createCodespaceState])

  useEffect(() => {
    if (
      lastSelectedCodespace.status === API_STATUS.SUCCESS &&
      lastSelectedCodespace.data?.project_id &&
      lastSelectedCodespace.data?.codespace_id
    ) {
      history.replace(
        `${routes.sharedWorkspace
          .replace(':pId', lastSelectedCodespace.data.project_id)
          .replace(':cId', lastSelectedCodespace.data.codespace_id)}/?lab_url=`
      )
    }
  }, [lastSelectedCodespace])

  useEffect(() => {
    if (
      attachedCluster &&
      attachedCluster.cluster_id &&
      attachedCluster.cluster_status === CLUSTER_STATUSES.active
    ) {
      getClusterResourcesFun({
        clusterId: attachedCluster.cluster_id
      })
    } else {
      // jupyterFullScreenExitEventHandler()
    }
  }, [attachedCluster])

  useEffect(() => {
    if (
      attachedCluster &&
      attachedCluster.cluster_id &&
      attachedCluster.cluster_status === CLUSTER_STATUSES.active &&
      clusterResources.status !== API_STATUS.LOADING
    ) {
      clearInterval(clusterResourcesTimeoutId)
      clusterResourcesTimeoutId = setInterval(() => {
        getClusterResourcesFun({
          clusterId: attachedCluster.cluster_id
        })
      }, 7000)
    } else if (
      attachedCluster &&
      attachedCluster.cluster_id &&
      attachedCluster.cluster_status !== CLUSTER_STATUSES.active
    ) {
      clearInterval(clusterResourcesTimeoutId)
    }

    return () => clearInterval(clusterResourcesTimeoutId)
  }, [attachedCluster])

  useEffect(() => {
    if (
      attachedCluster &&
      attachedCluster.cluster_id &&
      workspaceClusterStatus.status !== API_STATUS.LOADING
    ) {
      getWorkspaceClusterStatus(
        {
          clusterId: attachedCluster.cluster_id
        },
        workspaceClusterStatus.data
      )
      clearInterval(workspaceStatusTimeoutId)
      workspaceStatusTimeoutId = setInterval(() => {
        getWorkspaceClusterStatus(
          {
            clusterId: attachedCluster.cluster_id
          },
          workspaceClusterStatus.data
        )
      }, 7000)
    }

    return () => {
      clearInterval(workspaceStatusTimeoutId)
    }
  }, [
    attachedCluster,
    workspaceClusterStatus.data?.data?.status,
    workspaceClusterStatus.data?.data?.clusterId
  ])

  useEffect(() => {
    if (
      attachedCluster?.cluster_id ===
        workspaceClusterStatus.data?.data?.clusterId &&
      workspaceClusterStatus.data?.data?.status === CLUSTER_STATUSES.creating
    ) {
      setInfoBar({
        message: 'Cluster creating...',
        type: INFO_BAR_TYPE.WARNING,
        autoHideDuration: null,
        open: true
      })
    } else if (
      attachedCluster?.cluster_id ===
        workspaceClusterStatus.data?.data?.clusterId &&
      workspaceClusterStatus.data?.data?.status === CLUSTER_STATUSES.inactive
    ) {
      setInfoBar({
        message: 'Running without kernel...',
        type: INFO_BAR_TYPE.SUCCESS,
        autoHideDuration: 5000,
        open: true
      })
    } else if (
      attachedCluster?.cluster_id ===
        workspaceClusterStatus.data?.data?.clusterId &&
      workspaceClusterStatus.data?.data?.status === CLUSTER_STATUSES.active
    ) {
      setInfoBar({
        message: 'Running in executable mode...',
        type: INFO_BAR_TYPE.SUCCESS,
        autoHideDuration: 5000,
        open: true
      })
    } else if (!attachedCluster || !attachedCluster?.cluster_id) {
      setInfoBar({
        message: 'Running without kernel...',
        type: INFO_BAR_TYPE.SUCCESS,
        autoHideDuration: 5000,
        open: true
      })
    }
  }, [
    attachedCluster?.cluster_id,
    workspaceClusterStatus.data?.data?.clusterId,
    workspaceClusterStatus.data?.data?.status
  ])

  const onCreateProjectClicked = (
    e: React.KeyboardEvent | React.MouseEvent
  ) => {
    toggleCreateProjectDrawer()
    setAnchorEl(null)
  }

  const toggleCreateProjectDrawer = () => {
    setCreatePrjDrawerOpen(!createPrjDrawerOpen)
  }

  const toggleCreateCodespaceDrawer = () => {
    setCreateCodeSpaceDrawerOpen(!createCodeSpaceDrawerOpen)
    setAnchorEl(null)
  }

  const toggleEditProjectDrawer = () => {
    setEditProjectDrawer({
      ...editProjectDrawer,
      open: !editProjectDrawer.open
    })
    setAnchorEl(null)
  }

  const toggleEditCodespaceDrawer = () => {
    setEditCodespaceDrawer({
      ...editCodespaceDrawer,
      open: !editCodespaceDrawer.open
    })
    setAnchorEl(null)
  }

  const toggleImportProjectDrawer = (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    setImportProjectDrawerOpen(!importProjectDrawerOpen)
    setAnchorEl(null)
  }

  const handleLeave = (event: React.MouseEvent<HTMLElement>) => {
    setSubMenuAnchorEl(null)
  }

  const setNoInternetConnection = () => {
    setSelectedCodespace({
      ...selectedCodespace,
      error: {
        message: 'No Internet Connection',
        component: () => <WorkspaceLevelError type={errorTypes.NO_INTERNET} />
      }
    })
  }

  const onCreateProject = (
    projectName: string,
    codespaceName: string,
    clusterId: string
  ) => {
    const variables = {
      projectName: projectName,
      codespaceName: codespaceName,
      clusterId: clusterId
    }
    createProjectFun(variables)
    toggleCreateProjectDrawer()
  }

  const onCreateCodespace = (codespaceName, cloneFrom, clusterId) => {
    const variables = {
      projectId: selectedProject?.projectId,
      codespaceName: codespaceName,
      cloneFromCodespaceName: cloneFrom,
      clusterId: clusterId
    }
    createCodespace(variables)
  }

  const onGithubLink = () => {
    window.open(selectedCodespace?.data?.github_link, '_blank')
  }

  useEffect(() => {
    if (launchCodespace && launchCodespace.data) {
      setSelectedCodespace(launchCodespace)
    }
  }, [launchCodespace])

  const onImportProjectHandler = (
    githubUrl: string,
    codespaceName: string,
    clusterId: string
  ) => {
    setImportProjectDrawerOpen(false)
    setImportProject({
      githubUrl,
      codespaceName,
      clusterId
    })
  }

  const onEditProjectClicked = (projectId: string, projectName: string) => {
    setAnchorEl(null)
    setEditProjectDrawer({
      open: true,
      projectId: projectId,
      projectName: projectName
    })
  }

  const onEditCodespaceClicked = (
    codesapceId: string,
    projectId: string,
    codespaceName: string
  ) => {
    setAnchorEl(null)
    setEditCodespaceDrawer({
      open: true,
      projectId: projectId,
      codespaceName: codespaceName,
      codespaceId: codesapceId
    })
  }

  const getIFrameUrl = () => {
    const url = selectedCodespace?.data?.jupyter_lab_link
    if (!url) return null
    const [preLab, postLab] = url.split('/tree')
    if (preLab && postLab && labUrl) return `https://${preLab}/tree/${labUrl}`
    return `https://${url}`
  }

  const onDeleteCodespaceHandler = (projectId: string, codespaceId: string) => {
    setAnchorEl(null)
    const data = {
      projectId: projectId,
      codespaceId: codespaceId,
      launchedCodespace: selectedCodespace?.data?.codespace_id === codespaceId
    }

    deleteCodespace(data)
  }

  const onDeleteProjectHandler = (projectId: string) => {
    setAnchorEl(null)
    const data = {
      projectId: projectId,
      launchedProject: selectedCodespace?.data?.project_id === projectId
    }

    deleteProject(data)
  }

  const onEditCodespaceHandler = (
    codespaceName: string,
    codespaceId: string,
    projectId: string
  ) => {
    const data = {
      projectId,
      codespaceId,
      codespaceName,
      launchedCodespace: selectedCodespace?.data?.codespace_id === codespaceId
    }
    editCodespace(data)
  }

  const onEditProjectHandler = (projectName: string, projectId: string) => {
    const data = {
      projectId,
      projectName,
      launchedProject: selectedCodespace?.data?.project_id === projectId,
      codespaceId: selectedCodespace?.data?.codespace_id
    }
    editProject(data)
  }

  const onVSCodeIconClicked = () => {
    if (
      attachedCluster?.cluster_status === clusterStatuses.active &&
      selectedCodespace?.data?.code_server_link
    ) {
      window.open(
        `https://${selectedCodespace?.data?.code_server_link}`,
        '_blank'
      )
    }
  }

  useEffect(() => {
    if (editCodespaceResponse?.status === API_STATUS.SUCCESS) {
      setEditCodespaceDrawer({
        open: false,
        projectId: null,
        codespaceId: null,
        codespaceName: null
      })
    }
  }, [editCodespaceResponse])

  useEffect(() => {
    if (editProjectResponse?.status === API_STATUS.SUCCESS) {
      setEditProjectDrawer({
        open: false,
        projectId: null,
        projectName: null
      })
    }
  }, [editProjectResponse])

  const jupyterFullScreenEventHandler = () => {
    setSideNavVisible(false)
    setTopNavVisible(false)
    setFullScreenJupyter(true)
  }

  const jupyterFullScreenExitEventHandler = () => {
    setSideNavVisible(true)
    setTopNavVisible(true)
    setFullScreenJupyter(false)
  }

  useEffect(() => {
    if (
      selectedCodespace.status === API_STATUS.INIT ||
      selectedCodespace.status === API_STATUS.LOADING
      // || attachClusterData.status === API_STATUS.LOADING
    ) {
      setShowGlobalSpinner(true)
      // jupyterFullScreenExitEventHandler()
    } else {
      setShowGlobalSpinner(false)
    }
    return () => {
      setShowGlobalSpinner(false)
    }
  }, [selectedCodespace.status])

  const getFullScreenIcon = () => {
    if (fullScreenJupyter) {
      return (
        <Tooltip title='Exit Full Screen'>
          <FullscreenExitIcon
            onClick={jupyterFullScreenExitEventHandler}
            className={classes.fullScreenIcon}
          />
        </Tooltip>
      )
    }
    return (
      <Tooltip title='Full Screen'>
        <FullscreenIcon
          onClick={jupyterFullScreenEventHandler}
          className={classes.fullScreenIcon}
        />
      </Tooltip>
    )
  }
  return (
    <div
      className={classes.container}
      style={{
        width: fullScreenJupyter ? '100%' : 'calc(100% + 32px)',
        height: '100%',
        position: fullScreenJupyter ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        margin: fullScreenJupyter ? 0 : '-16px'
      }}
    >
      <GenericSnackbar />
      <div className={classes.header}>
        <div className={classes.left}>
          {/* <h3 className={classes.heading}>My Workspace</h3> */}
          <ProjectDropdown
            onImportProjectClicked={toggleImportProjectDrawer}
            onCreateProjectClicked={onCreateProjectClicked}
            onCreateCodespaceClicked={toggleCreateCodespaceDrawer}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            onDeleteProject={onDeleteProjectHandler}
            onDeleteCodespaceHandler={onDeleteCodespaceHandler}
            onEditProjectClicked={onEditProjectClicked}
            onEditCodespaceClicked={onEditCodespaceClicked}
          />
          {selectedCodespace?.data?.github_link && (
            <div className={classes.githubLink} onClick={onGithubLink}>
              <GitHubIcon className={classes.githubIcon} />
              <span>Open In Github</span>
              <span
                className={`${Icons.ICON_OPEN_IN_NEW} ${classes.newTabIcon}`}
              />
            </div>
          )}
        </div>
        <div className={classes.right}>
          <div onClick={onVSCodeIconClicked}>
            {attachedCluster?.cluster_status === clusterStatuses.active ? (
              <img
                src={`${config.cfMsdAssetUrl}/icons/darwin-vs-code.svg`}
                alt='VS Code'
                className={classes.VSCodeIcon}
              />
            ) : (
              <Tooltip title='Please activate the cluster to start using vs code.'>
                <img
                  src={`${config.cfMsdAssetUrl}/icons/darwin-disabled-vs-code-3.svg`}
                  alt='VS Code'
                  className={classes.VSCodeIcon}
                />
              </Tooltip>
            )}
          </div>
          {selectedCodespace?.data?.jupyter_lab_link && getFullScreenIcon()}
        </div>
      </div>
      <InfoBar />
      <div className={classes.jupyterLabContainer}>
        {selectedCodespace.error ? <selectedCodespace.error.component /> : null}
        {/* {!attachedCluster ? (
          <WorkspaceLevelError type={errorTypes.CLUSTER_DETACHED} />
        ) : null} */}
        {/* {attachedCluster &&
          attachedCluster.cluster_status === clusterStatuses.creating &&
          selectedCodespace.status === API_STATUS.SUCCESS && (
            <WorkspaceLevelLoaders type={loaderTypes.ACTIVATING_CLUSTER} />
          )} */}
        {selectedCodespace?.data?.jupyter_lab_link ? (
          <iframe
            src={getIFrameUrl()}
            className={!sideNavState && classes.disablePointerEvents}
            style={{
              width: '100%',
              position: 'static'
            }}
          ></iframe>
        ) : null}
      </div>
      {createPrjDrawerOpen && (
        <CreateProjectDrawer
          open={createPrjDrawerOpen}
          setOpen={toggleCreateProjectDrawer}
          onCreateProject={onCreateProject}
        />
      )}
      {createCodeSpaceDrawerOpen && (
        <CreateCodespaceDrawer
          open={createCodeSpaceDrawerOpen}
          setOpen={toggleCreateCodespaceDrawer}
          onCreateCodespace={onCreateCodespace}
          codespaces={codespaces}
          projectId={selectedProject?.projectId}
        />
      )}
      {importProjectDrawerOpen && (
        <ImportProjectDrawer
          open={importProjectDrawerOpen}
          setOpen={toggleImportProjectDrawer}
          onImportProject={onImportProjectHandler}
        />
      )}
      {editProjectDrawer.open && (
        <EditProjectDrawer
          open={editProjectDrawer.open}
          setOpen={toggleEditProjectDrawer}
          projectId={editProjectDrawer.projectId}
          oldProjectName={editProjectDrawer.projectName}
          onEditProject={onEditProjectHandler}
        />
      )}
      {editCodespaceDrawer && (
        <EditCodespaceDrawer
          open={editCodespaceDrawer.open}
          setOpen={toggleEditCodespaceDrawer}
          projectId={editCodespaceDrawer.projectId}
          oldCodespaceName={editCodespaceDrawer.codespaceName}
          codespaceId={editCodespaceDrawer.codespaceId}
          onEditCodespace={onEditCodespaceHandler}
        />
      )}
      <RightDrawer fullScreenJupyter={fullScreenJupyter} />
    </div>
  )
}
const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
  appDrawerDuck: any
}) => ({
  createProjectState: state['workspaceProjectReducer']['createProject'],
  projectDetailsState: state['workspaceProjectReducer']['projectDetails'],
  projectList: state.workspaceProjectReducer.projectList,
  codespaces: state['workspaceProjectReducer']['codespaces'],
  lastSelectedCodespace: state.workspaceProjectReducer.lastSelectedCodespace,
  selectedCodespace: state.workspaceProjectReducer.selectedCodespace,
  launchCodespace: state['workspaceProjectReducer']['launchCodespace'],
  importedProject: state['workspaceProjectReducer']['importProject'],
  attachClusterData: state['workspaceProjectReducer']['attachCluster'],
  lastSyncTimeData: state['workspaceProjectReducer']['lastSyncTime'],
  attachedCluster: state['workspaceProjectReducer']['attachedCluster'],
  createCodespaceState: state.workspaceProjectReducer.createCodespace,
  sideNavState: state.appDrawerDuck.sideNavState,
  selectedProject: state.workspaceProjectReducer.selectedProject,
  editCodespaceResponse: state.workspaceProjectReducer.editCodespace,
  editProjectResponse: state.workspaceProjectReducer.editProject,
  clusterCancellationForPolling:
    state.workspaceProjectReducer.clusterCancellationForPolling,
  stopCluster: state.workspaceProjectReducer.stopCluster,
  startCluster: state.workspaceProjectReducer.startCluster,
  detachCluster: state.workspaceProjectReducer.detachCluster,
  workspaceClusterStatus: state.workspaceProjectReducer.workspaceClusterStatus,
  clusterResources: state.workspaceProjectReducer.clusterResources
})

const mapDispatchToProps = (dispatch) => {
  return {
    createProjectFun: (payload) => createProject(dispatch, payload),
    createCodespace: (payload) => createCodespace(dispatch, payload),
    setProjectDetailsFun: (payload) => dispatch(setProjectDetails(payload)),
    getProjects: (payload) => getProjects(dispatch, payload),
    getCodespaces: (payload) => getCodespaces(dispatch, payload),
    setCodespacesFunc: (payload) => dispatch(setCodespaces(payload)),
    getLastSelectedCodespace: () => getLastSelectedCodespace(dispatch),
    setSelectedCodespace: (payload) => dispatch(setSelectedCodespace(payload)),
    setLaunchCodespace: (payload) => launchCodespace(dispatch, payload),
    launchCodespaceOnceClusterActivatedFunc: (payload: {
      clusterId: string
      projectId: string
      codespaceId: string
    }) => launchCodespaceOnceClusterActivated(payload, dispatch),
    setSelectedProjectFun: (payload) => dispatch(setSelectedProject(payload)),
    setImportProject: (payload) => importProject(dispatch, payload),
    getClusterResourcesFun: (payload) => getClusterResources(payload, dispatch),
    deleteCodespace: (data: DeleteCodespaceInput) =>
      deleteCodespace(data, dispatch),
    deleteProject: (data: DeleteProjectInput) => deleteProject(data, dispatch),
    editCodespace: (data: EditCodespaceInput) => editCodespace(dispatch, data),
    editProject: (data: EditProjectInput) => editProject(dispatch, data),
    setTopNavVisible: (value: boolean) => dispatch(setTopNavVisible(value)),
    setSideNavVisible: (value: boolean) => dispatch(setSideNavVisible(value)),
    setShowGlobalSpinner: (payload: boolean) =>
      dispatch(setShowGlobalSpinner(payload)),
    setInfoBar: (infoBar: IWorkspaceState['infoBar']) =>
      dispatch(setInfoBar(infoBar)),
    getWorkspaceClusterStatus: (
      payload: GetComputeClusterInput,
      prevData: IWorkspaceState['workspaceClusterStatus']['data']
    ) => getWorkspaceClusterStatus(payload, prevData, dispatch),
    resetCreateProject: () =>
      dispatch(
        createProjectAction({
          status: API_STATUS.INIT
        })
      ),
    resetCreateCodespace: () =>
      dispatch(
        createCodespaceAction({
          data: null,
          status: API_STATUS.INIT
        })
      )
  }
}

const styleComponent = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(Project)

export default styleComponent
