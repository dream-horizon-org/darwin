import CloseIcon from '@material-ui/icons/Close'
import BarChartIcon from '@mui/icons-material/BarChart'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import {Divider, LinearProgress} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useCallback, useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {Dialog} from '../../bit-components/dialog/index'
import SpinnerBackdrop from '../../components/spinnerBackdrop/spinnerBackdrop'
import WorkflowListItemMenu from '../../components/workflows/workflowListItemMenu'
import {errorTypes} from '../../components/workspace/workspaceLevelError/constants'
import WorkspaceLevelError from '../../components/workspace/workspaceLevelError/workspaceLevelError'
import {
  DIALOG_MESSAGES,
  WORKSPACE_ACTIONS
} from '../../modules/workspace/constants'
import {
  setAttachCluster,
  setAttachedCluster,
  setDetachCluster,
  setGenericSnackBar,
  setSelectedCodespace,
  setSideBarConfig
} from '../../modules/workspace/pages/actions'
import {SelectionOnAttachedCluster} from '../../modules/workspace/pages/graphqlApis/createCodespace/createCodespace'
import {DetachClusterInput} from '../../modules/workspace/pages/graphqlApis/detachCluster/detachCluster'
import {detachCluster} from '../../modules/workspace/pages/graphqlApis/detachCluster/detachCluster.thunk'
import {GetClusterResources} from '../../modules/workspace/pages/graphqlApis/getClusterResources/getClusterResources'
import {StartClusterInput} from '../../modules/workspace/pages/graphqlApis/startCluster/startCluster'
import {startCluster} from '../../modules/workspace/pages/graphqlApis/startCluster/startCluster.thunk'
import {StopClusterInput} from '../../modules/workspace/pages/graphqlApis/stopCluster/stopCluster'
import {stopCluster} from '../../modules/workspace/pages/graphqlApis/stopCluster/stopCluster.thunk'
import {
  IGenericSnackBarConfig,
  ISideBarConfig,
  IWorkspaceState,
  SnackbarType
} from '../../modules/workspace/pages/reducer'
import {
  RightMenuItems,
  SideBarWidth
} from '../../modules/workspace/pages/rightDrawer/constants'
import {API_STATUS} from '../../utils/apiUtils'
import styles from './attachedClusterDetailsJSS'
import {CLUSTER_STATUS} from './constant'

const defaultDialogConfig = {
  open: false,
  actionName: '',
  message: '',
  title: '',
  handleClose: () => {},
  primaryButton: {
    text: '',
    onClick: () => {},
    disabled: false,
    isLoading: false
  },
  secondaryButton: {
    text: '',
    onClick: () => {},
    disabled: false
  }
}

interface IProps extends WithStyles<typeof styles> {
  selectedCodespace: any
  detachClusterFunc: (input: DetachClusterInput) => void
  resetDetachClusterFunc: (input: any) => void
  stopClusterFunc: (
    payload: StopClusterInput,
    attachedCluster: SelectionOnAttachedCluster
  ) => void
  startClusterFunc: (
    payload: StartClusterInput,
    attachedCluster: SelectionOnAttachedCluster
  ) => void
  detachClusterData: any
  stopClusterData: IWorkspaceState['stopCluster']
  startClusterData: IWorkspaceState['startCluster']
  selectedProject: any
  attachedCluster: SelectionOnAttachedCluster
  setSelectedCodespaceFunc: (input: any) => void
  setSideBarConfigFunc: (payload: ISideBarConfig) => void
  setGenericSnackBarFun: (payload: IGenericSnackBarConfig) => void
  setAttachedCluster: (payload) => void
  clusterResources: {
    status: API_STATUS
    data: GetClusterResources['getClusterResources']['data']
    error: any
  }
}

const AttachedClusterDetails = (props: IProps) => {
  const {
    classes,
    selectedCodespace,
    detachClusterFunc,
    stopClusterFunc,
    startClusterFunc,
    resetDetachClusterFunc,
    detachClusterData,
    stopClusterData,
    startClusterData,
    selectedProject,
    attachedCluster,
    setSelectedCodespaceFunc,
    setSideBarConfigFunc,
    setGenericSnackBarFun,
    setAttachedCluster,
    clusterResources
  } = props
  const showUsage = true
  const [dialog, setDialog] = useState(defaultDialogConfig)
  const [anchorElForMenu, setAnchorElForMenu] = useState<SVGSVGElement | null>(
    null
  )

  const detachClusterFromCodespace = () => {
    if (
      detachClusterData.status !== API_STATUS.LOADING &&
      selectedCodespace.data &&
      attachedCluster
    ) {
      detachClusterFunc({
        clusterId: attachedCluster.cluster_id,
        codespaceId: selectedCodespace.data.codespace_id
      })
    }
  }

  useEffect(() => {
    if (detachClusterData && detachClusterData.status === API_STATUS.SUCCESS) {
      // setSelectedMenu(RightMenuItems.COMPUTE_ATTACH)

      resetDetachClusterFunc({
        status: API_STATUS.INIT,
        data: null,
        error: null
      })

      setAttachedCluster(null)
    } else if (
      detachClusterData &&
      detachClusterData.status === API_STATUS.ERROR
    ) {
      setGenericSnackBarFun({
        open: true,
        message: 'Failed to detach cluster!',
        type: SnackbarType.ERROR
      })
    }
  }, [detachClusterData])

  useEffect(() => {
    if (
      dialog.actionName === WORKSPACE_ACTIONS.ACTIVATE_CLUSTER &&
      startClusterData.status === API_STATUS.SUCCESS
    ) {
      setDialog(defaultDialogConfig)
    } else if (
      dialog.actionName === WORKSPACE_ACTIONS.STOP_CLUSTER &&
      stopClusterData.status === API_STATUS.SUCCESS
    ) {
      setDialog(defaultDialogConfig)
    } else if (
      dialog.actionName === WORKSPACE_ACTIONS.DETACH_CLUSTER &&
      detachClusterData.status === API_STATUS.SUCCESS
    ) {
      setDialog(defaultDialogConfig)
    }
  }, [startClusterData, stopClusterData, detachClusterData])

  const coresUsage =
    clusterResources.data?.cores_used ||
    attachedCluster?.cluster_usage?.cores_used ||
    0
  const memoryUsage =
    clusterResources.data?.memory_used ||
    attachedCluster?.cluster_usage?.memory_used ||
    0

  const handleMenuClick = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>
  ): void => {
    event.stopPropagation()
    setAnchorElForMenu(event.currentTarget)
  }

  const onStopClusterClicked = () => {
    if (attachedCluster) {
      stopClusterFunc(
        {
          input: {
            cluster_id: attachedCluster.cluster_id
          }
        },
        attachedCluster
      )
    }
  }

  const onStartClusterClicked = () => {
    if (attachedCluster) {
      startClusterFunc(
        {
          input: {
            cluster_id: attachedCluster.cluster_id
          }
        },
        attachedCluster
      )
    }
  }

  const handleMenuItemClicked = (actionName: string) => {
    if (actionName === WORKSPACE_ACTIONS.DETACH_CLUSTER) {
      setDialog({
        open: true,
        actionName: actionName,
        message: DIALOG_MESSAGES.DETACH_CLUSTER,
        title: 'Detach Cluster',
        handleClose: () =>
          detachClusterData.status !== API_STATUS.LOADING &&
          setDialog(defaultDialogConfig),
        primaryButton: {
          text: 'Detach',
          onClick: detachClusterFromCodespace,
          disabled: detachClusterData.status === API_STATUS.LOADING,
          isLoading: detachClusterData.status === API_STATUS.LOADING
        },
        secondaryButton: {
          text: 'Cancel',
          onClick: () => setDialog(defaultDialogConfig),
          disabled: detachClusterData.status === API_STATUS.LOADING
        }
      })
    } else if (actionName === WORKSPACE_ACTIONS.STOP_CLUSTER) {
      setDialog({
        open: true,
        actionName: actionName,
        message: DIALOG_MESSAGES.STOP_CLUSTER,
        title: 'Stop Cluster',
        handleClose: () =>
          stopClusterData.status !== API_STATUS.LOADING &&
          setDialog(defaultDialogConfig),
        primaryButton: {
          text: 'Stop',
          onClick: onStopClusterClicked,
          disabled: stopClusterData.status === API_STATUS.LOADING,
          isLoading: stopClusterData.status === API_STATUS.LOADING
        },
        secondaryButton: {
          text: 'Cancel',
          onClick: () => setDialog(defaultDialogConfig),
          disabled: stopClusterData.status === API_STATUS.LOADING
        }
      })
    } else if (actionName === WORKSPACE_ACTIONS.ACTIVATE_CLUSTER) {
      setDialog({
        open: true,
        actionName: actionName,
        message: DIALOG_MESSAGES.ACTIVATE_CLUSTER,
        title: 'Activate Cluster',
        handleClose: () =>
          startClusterData.status !== API_STATUS.LOADING &&
          setDialog(defaultDialogConfig),
        primaryButton: {
          text: 'Activate',
          onClick: onStartClusterClicked,
          disabled: startClusterData.status === API_STATUS.LOADING,
          isLoading: startClusterData.status === API_STATUS.LOADING
        },
        secondaryButton: {
          text: 'Cancel',
          onClick: () => setDialog(defaultDialogConfig),
          disabled: startClusterData.status === API_STATUS.LOADING
        }
      })
    }

    handleMenuClose()
  }

  const getDialogFooterDisabled = (actionName: string) => {
    if (actionName === WORKSPACE_ACTIONS.DETACH_CLUSTER) {
      return detachClusterData.status === API_STATUS.LOADING
    } else if (actionName === WORKSPACE_ACTIONS.STOP_CLUSTER) {
      return stopClusterData.status === API_STATUS.LOADING
    } else if (actionName === WORKSPACE_ACTIONS.ACTIVATE_CLUSTER) {
      return startClusterData.status === API_STATUS.LOADING
    }
    return false
  }

  const getDialogFooterIsLoading = (actionName: string) => {
    if (actionName === WORKSPACE_ACTIONS.DETACH_CLUSTER) {
      return detachClusterData.status === API_STATUS.LOADING
    } else if (actionName === WORKSPACE_ACTIONS.STOP_CLUSTER) {
      return stopClusterData.status === API_STATUS.LOADING
    } else if (actionName === WORKSPACE_ACTIONS.ACTIVATE_CLUSTER) {
      return startClusterData.status === API_STATUS.LOADING
    }
    return false
  }

  const handleMenuClose = () => {
    setAnchorElForMenu(null)
  }

  const getMenuItems = (clusterStatus: string) => {
    if (clusterStatus === CLUSTER_STATUS.creating) {
      return []
    } else if (clusterStatus === CLUSTER_STATUS.active) {
      return [
        {
          actionIcon: <LinkOffIcon className={classes.actionIcon} />,
          actionName: WORKSPACE_ACTIONS.DETACH_CLUSTER
        },
        {
          actionIcon: <StopOutlinedIcon className={classes.actionIcon} />,
          actionName: WORKSPACE_ACTIONS.STOP_CLUSTER
        }
      ]
    } else if (clusterStatus === CLUSTER_STATUS.inactive) {
      return [
        {
          actionIcon: <PlayArrowIcon className={classes.actionIcon} />,
          actionName: WORKSPACE_ACTIONS.ACTIVATE_CLUSTER
        },
        {
          actionIcon: <LinkOffIcon className={classes.actionIcon} />,
          actionName: WORKSPACE_ACTIONS.DETACH_CLUSTER
        }
      ]
    }
    return []
  }

  return (
    <>
      {/* <SpinnerBackdrop show={detachClusterData.status === API_STATUS.LOADING} /> */}
      <Dialog
        handleClose={dialog.handleClose}
        title={dialog.title}
        open={dialog.open}
        dialogContent={<div>{dialog.message}</div>}
        dialogFooter={{
          primaryButton: {
            text: dialog.primaryButton.text,
            onClick: dialog.primaryButton.onClick,
            disabled: getDialogFooterDisabled(dialog.actionName),
            isLoading: getDialogFooterIsLoading(dialog.actionName)
          },
          secondaryButton: dialog.secondaryButton
        }}
      />

      <div className={classes.container}>
        <div className={classes.header}>
          <CloseIcon
            onClick={() =>
              setSideBarConfigFunc({
                isOpen: false,
                selectedMenu: null,
                width: SideBarWidth.SmallWidth
              })
            }
            className={classes.closeIcon}
          />
          <div className={classes.title}>Attached Cluster</div>
        </div>
        <Divider className={classes.divider} />
        <div className={classes.details}>
          <div className={classes.clusterDetails}>
            <div className={classes.clusterDetailsLeft}>
              <div className={classes.clusterName}>
                {attachedCluster?.cluster_name}
              </div>
              {attachedCluster?.cluster_status === CLUSTER_STATUS.active && (
                <div className={classes.tag}>Active</div>
              )}
              {attachedCluster?.cluster_status === CLUSTER_STATUS.creating && (
                <div className={classes.creatingTag}>Attaching</div>
              )}
              {attachedCluster?.cluster_status === CLUSTER_STATUS.inactive && (
                <div className={classes.inactiveTag}>Inactive</div>
              )}
            </div>
            <div className={classes.clusterDetailsRight}>
              <MoreVertIcon
                id='basic-button'
                className={
                  attachedCluster?.cluster_status === CLUSTER_STATUS.creating
                    ? classes.disabledIcon
                    : ''
                }
                aria-haspopup='true'
                onClick={(e) => {
                  if (
                    attachedCluster?.cluster_status !== CLUSTER_STATUS.creating
                  ) {
                    handleMenuClick(e)
                  }
                }}
              />
              <WorkflowListItemMenu
                anchorEl={anchorElForMenu}
                open={Boolean(anchorElForMenu)}
                handleClick={handleMenuItemClicked}
                handleClose={handleMenuClose}
                menuItems={getMenuItems(attachedCluster?.cluster_status)}
              />
            </div>
          </div>
          <div className={classes.clusterCoresAndMemory}>
            {attachedCluster?.cores || 0} Core / {attachedCluster?.memory || 0}{' '}
            GB
          </div>
          <a
            href={`/clusters/${attachedCluster?.cluster_id}/configuration/`}
            target='_blank'
            className={classes.clusterDetailsLink}
          >
            <div>View Cluster Details</div>
            <OpenInNewIcon className={classes.openInNewIcon} />
          </a>
        </div>
        <Divider className={`${classes.divider} ${classes.detailsMargin}`} />
        <div className={classes.clusterUsageContainer}>
          {showUsage && (
            <>
              {attachedCluster.cluster_status !== CLUSTER_STATUS.inactive && (
                <>
                  <div className={classes.clusterUsageHeader}>
                    <BarChartIcon />
                    <div className={classes.clusterUsageTitle}>
                      Cluster Usage
                    </div>
                  </div>
                  {attachedCluster.cluster_status ===
                    CLUSTER_STATUS.creating && (
                    <LinearProgress className={classes.creatingClusterLoader} />
                  )}
                  {attachedCluster.cluster_status === CLUSTER_STATUS.active && (
                    <>
                      <div className={classes.coresUtilisedStats}>
                        <div>
                          <span className={classes.utilisedBold}>
                            {coresUsage}%
                          </span>{' '}
                          of {attachedCluster?.cores || 0} cores Utilized
                        </div>
                        <LinearProgress
                          variant='determinate'
                          value={coresUsage}
                          className={classes.utilisedProgressBar}
                        />
                      </div>
                      <div className={classes.coresUtilisedStats}>
                        <div>
                          <span className={classes.utilisedBold}>
                            {memoryUsage}%
                          </span>{' '}
                          of {attachedCluster?.memory || 0} GB Memory Utilized
                        </div>
                        <LinearProgress
                          variant='determinate'
                          value={memoryUsage}
                          className={classes.utilisedProgressBar}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              {attachedCluster &&
              Number.isInteger(attachedCluster.attached_codespaces_count) ? (
                <div
                  className={classes.note}
                  style={{
                    marginTop:
                      attachedCluster.cluster_status !== CLUSTER_STATUS.inactive
                        ? '20px'
                        : 0
                  }}
                >
                  <span className={classes.noteLabel}>Note:</span>{' '}
                  {`${attachedCluster?.attached_codespaces_count || 0} ${
                    attachedCluster?.attached_codespaces_count === 1
                      ? 'Codespace is'
                      : 'Codespaces are'
                  } using this Cluster`}
                </div>
              ) : null}
            </>
          )}
          {!attachedCluster?.ray_dashboard &&
          !attachedCluster?.prometheus_dashboard ? null : (
            <div
              className={
                showUsage
                  ? classes.usageDashboardContainer
                  : classes.usageDashboardContainerNoTop
              }
            >
              <div className={classes.usageDashboardHeading}>
                Usage Dashboards
              </div>
              <div className={classes.usageDashboardLinks}>
                {attachedCluster?.ray_dashboard && (
                  <a
                    className={classes.usageDashboardLink}
                    href={'http://' + attachedCluster?.ray_dashboard}
                    target='_blank'
                  >
                    Ray
                    <OpenInNewIcon className={classes.openInNewIcon} />
                  </a>
                )}
                {attachedCluster?.prometheus_dashboard && (
                  <a
                    className={classes.usageDashboardLink}
                    href={'http://' + attachedCluster?.prometheus_dashboard}
                    target='_blank'
                  >
                    Prometheous
                    <OpenInNewIcon className={classes.openInNewIcon} />
                  </a>
                )}
                {attachedCluster?.spark_ui_dashboard && (
                  <a
                    className={classes.usageDashboardLink}
                    href={'http://' + attachedCluster?.spark_ui_dashboard}
                    target='_blank'
                  >
                    Spark
                    <OpenInNewIcon className={classes.openInNewIcon} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const mapStateToProps = (state: {
  workspaceProjectReducer: IWorkspaceState
}) => ({
  selectedCodespace: state['workspaceProjectReducer']['selectedCodespace'],
  detachClusterData: state['workspaceProjectReducer']['detachCluster'],
  stopClusterData: state['workspaceProjectReducer']['stopCluster'],
  startClusterData: state['workspaceProjectReducer']['startCluster'],
  selectedProject: state['workspaceProjectReducer']['selectedProject'],
  attachedCluster: state.workspaceProjectReducer.attachedCluster,
  clusterResources: state.workspaceProjectReducer.clusterResources
})

const mapDispatchToProps = (dispatch) => {
  return {
    detachClusterFunc: (payload: DetachClusterInput) =>
      detachCluster(payload, dispatch),
    stopClusterFunc: (
      payload: StopClusterInput,
      attachedCluster: SelectionOnAttachedCluster
    ) => stopCluster(payload, attachedCluster, dispatch),
    startClusterFunc: (
      payload: StartClusterInput,
      attachedCluster: SelectionOnAttachedCluster
    ) => startCluster(payload, attachedCluster, dispatch),
    resetDetachClusterFunc: (payload) => dispatch(setDetachCluster(payload)),
    setSelectedCodespaceFunc: (payload) =>
      dispatch(setSelectedCodespace(payload)),
    setSideBarConfigFunc: (payload: ISideBarConfig) =>
      dispatch(setSideBarConfig(payload)),
    setGenericSnackBarFun: (payload: IGenericSnackBarConfig) =>
      dispatch(setGenericSnackBar(payload)),
    setAttachedCluster: (payload) => dispatch(setAttachedCluster(payload))
  }
}

const styleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(AttachedClusterDetails)

export default styleComponent
