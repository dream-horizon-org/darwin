import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CreateIcon from '@mui/icons-material/Create'
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined'
import PausePresentationOutlinedIcon from '@mui/icons-material/PausePresentationOutlined'
import Tooltip from '@mui/material/Tooltip'
import {withStyles, WithStyles} from '@mui/styles'
import config from 'config'
import cronstrue from 'cronstrue'
import React, {useEffect, useRef, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import {v4 as uuidv4} from 'uuid'
import {setDialogConfig} from '../../../actions/commonActions'
import {Button} from '../../../bit-components/button/index'
import {Chip} from '../../../bit-components/chip/index'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes,
  IconButtonVariants
} from '../../../bit-components/icon-button/index'
import {Icons} from '../../../bit-components/icon/index'
import {TagsStatus} from '../../../bit-components/tags/tags-status/index'
import BackButton from '../../../components/backButton/backButton'
import {routes} from '../../../constants'
import {DeleteWorkflowInput} from '../../../modules/workflows/graphqlAPIs/deleteWorkflow'
import {deleteWorkflow} from '../../../modules/workflows/graphqlAPIs/deleteWorkflow/index.thunk'
import {SelectionOnGetWorkflowDetails} from '../../../modules/workflows/graphqlAPIs/getWorkflowDetails'
import {SelectionOnGetWorkflowRuns} from '../../../modules/workflows/graphqlAPIs/getWorkflowRuns'
import {GetWorkflowStatusInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowTagStatus'
import {getWorkflowStatus} from '../../../modules/workflows/graphqlAPIs/getWorkflowTagStatus/index.thunk'
import {GetWorkflowYamlInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowYaml'
import {getWorkflowYaml} from '../../../modules/workflows/graphqlAPIs/getWorkflowYaml/index.thunk'
import {PauseWorkflowScheduleInput} from '../../../modules/workflows/graphqlAPIs/pauseWorkflowSchedule'
import {pauseWorkflowSchedule} from '../../../modules/workflows/graphqlAPIs/pauseWorkflowSchedule/index.thunk'
import {resumeWorkflowSchedule} from '../../../modules/workflows/graphqlAPIs/resumeWorkflowSchedule/index.thunk'
import {RunWorkflowRunInput} from '../../../modules/workflows/graphqlAPIs/runWorkflowRun'
import {runWorkflowRun} from '../../../modules/workflows/graphqlAPIs/runWorkflowRun/index.thunk'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {resetWorkflowYaml} from '../../../modules/workflows/pages/workflows/actions'
import {
  WORKFLOW_STANDARDS_ACTIVE,
  WORKFLOW_STANDARDS_INACTIVE
} from '../../../modules/workflows/pages/workflows/constants'
import {IWorkflowsState} from '../../../modules/workflows/pages/workflows/reducer'
import {
  formattedSnakeString,
  getTagStatus
} from '../../../modules/workflows/pages/workflows/utils'
import {
  CommonState,
  defaultDialogConfig,
  ICommonState
} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import {featureFlags} from '../../../utils/featureFlags'
import {truncate} from '../../../utils/helper'
import {WORKFLOW_DIALOG} from '../allWorkflows/constant'
import {WORKFLOW_STATUS} from '../allWorkflows/constant'
import {getFormattedDateTime} from '../allWorkflows/utils'
import RunNowWithParametersDialog from '../runNowWithParametersDialog'
import UpdateSchedule from '../updateSchedule'
import WorkflowListItemMenu from '../workflowListItemMenu'
import {MAX_LENGTH_OF_WORKFOW_DESCRIPTION, WORKFLOW_ACTIONS} from './constant'
import styles from './indexJSS'
import SplitButton from './splitButton'

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  setDialogConfig: (dialogConfig: ICommonState['dialogConfig']) => void
  deleteWorkflow: (payload: DeleteWorkflowInput) => void
  deleteWorkflowDetails: IWorkflowsState['deleteWorkflow']
  pauseWorkflowSchedule: (
    payload: PauseWorkflowScheduleInput,
    workflowDetailsData: SelectionOnGetWorkflowDetails
  ) => void
  getWorkflowYaml: (payload: GetWorkflowYamlInput) => void
  resetWorkflowYaml: () => void
  workflowYaml: IWorkflowsState['getWorkflowYaml']
  runWorkflowRun: (
    payload: RunWorkflowRunInput,
    data: SelectionOnGetWorkflowRuns
  ) => void
  workflowRuns: IWorkflowsDetailsState['workflowRuns']
  workflowStatus: IWorkflowsDetailsState['workflowStatus']
  resumeWorkflowSchedule: (
    payload: PauseWorkflowScheduleInput,
    workflowDetailsData: SelectionOnGetWorkflowDetails
  ) => void
  getWorkflowStatusFunc: (payload: GetWorkflowStatusInput) => void
  workflowResumeStatus: IWorkflowsState['resumeWorkflowSchedule']
  workflowPauseStatus: IWorkflowsState['pauseWorkflowSchedule']
}

let interval = null
const WorkflowDetailsHeader = (props: IProps) => {
  const {
    classes,
    workflowDetails,
    setDialogConfig,
    deleteWorkflow,
    deleteWorkflowDetails,
    pauseWorkflowSchedule,
    getWorkflowYaml,
    workflowYaml,
    runWorkflowRun,
    workflowRuns,
    workflowStatus,
    resumeWorkflowSchedule,
    resetWorkflowYaml,
    getWorkflowStatusFunc,
    workflowResumeStatus,
    workflowPauseStatus
  } = props

  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null)
  const [currentStatus, setCurrentStatus] = useState(workflowStatus?.data || '')
  const [openUpdateScheduleDrawer, setOpenUpdateScheduleDrawer] =
    useState(false)
  const [onRunNowWithParameters, setOnRunNowWithParameters] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const open = Boolean(anchorEl)
  const history = useHistory()

  const downloadTxtFile = (text: string, fileName: string) => {
    const element = document.createElement('a')
    const file = new Blob([text], {
      type: 'text/plain;charset=utf-8'
    })
    element.href = URL.createObjectURL(file)
    element.download = fileName
    document.body.appendChild(element)
    element.click()
  }

  const onDeleteWorkflow = () => {
    deleteWorkflow({
      workflowId: workflowDetails?.data?.workflow_id
    })
    onDialogClosed()
  }

  const onPausedWorkflowSchedule = () => {
    pauseWorkflowSchedule(
      {
        workflowId: workflowDetails?.data?.workflow_id
      },
      workflowDetails
    )
    onDialogClosed()
  }

  const onResumedWorkflowSchedule = () => {
    resumeWorkflowSchedule(
      {
        workflowId: workflowDetails?.data?.workflow_id
      },
      workflowDetails
    )
    onDialogClosed()
  }

  const onGetWorkflowYaml = () => {
    getWorkflowYaml({
      workflowId: workflowDetails?.data?.workflow_id
    })
  }

  const onRunWorkflowRun = () => {
    runWorkflowRun(
      {
        workflowId: workflowDetails?.data?.workflow_id
      },
      workflowRuns.data
    )
    onDialogClosed()
  }

  const fetchWorkflowStatus = () => {
    if (workflowDetails?.data?.workflow_id) {
      getWorkflowStatusFunc({
        workflowId: workflowDetails?.data?.workflow_id
      })
    }
  }

  const startPolling = () => {
    if (!isPolling) {
      setIsPolling(true)
      interval = setInterval(() => {
        fetchWorkflowStatus()
      }, 5000)
    }
  }

  const stopPolling = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    setIsPolling(false)
  }

  useEffect(() => {
    if (workflowStatus?.data) {
      if (
        workflowStatus.data === WORKFLOW_STATUS.UPDATING_ARTIFACT ||
        workflowStatus?.data === WORKFLOW_STATUS.CREATING_ARTIFACT ||
        workflowStatus?.data === WORKFLOW_STATUS.RESUMING ||
        workflowStatus?.data === WORKFLOW_STATUS.PAUSING
      ) {
        setCurrentStatus(workflowStatus?.data)
        startPolling()
      } else {
        stopPolling()
        setCurrentStatus(workflowStatus?.data)
      }
    }
  }, [workflowStatus?.data])

  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  useEffect(() => {
    if (
      deleteWorkflowDetails?.status === API_STATUS.SUCCESS &&
      deleteWorkflowDetails?.data?.workflow_id ===
        workflowDetails?.data?.workflow_id
    ) {
      history.replace(routes.workflows)
    }
  }, [deleteWorkflowDetails])

  useEffect(() => {
    if (workflowYaml?.status === API_STATUS.SUCCESS) {
      downloadTxtFile(
        workflowYaml?.data?.yaml,
        `${workflowDetails?.data?.display_name}.yaml`
      )
    }
  }, [workflowYaml])

  useEffect(() => {
    return () => {
      resetWorkflowYaml()
    }
  }, [])

  const onSecondaryBtnClicked = () => {
    onDialogClosed()
  }

  const onDialogClosed = () => {
    setDialogConfig(defaultDialogConfig)
  }

  const handleClick: React.MouseEventHandler<SVGSVGElement> = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const onCloseUpdateScheduleDrawer = () => {
    setOpenUpdateScheduleDrawer(false)
  }

  const onPausedWorkflowScheduleHandler = () => {
    setDialogConfig({
      title: WORKFLOW_DIALOG.PAUSE_SCHEDULE.title,
      open: true,
      message: WORKFLOW_DIALOG.PAUSE_SCHEDULE.message,
      primaryBtnText: WORKFLOW_DIALOG.PAUSE_SCHEDULE.primaryBtnText,
      secondaryBtnText: WORKFLOW_DIALOG.PAUSE_SCHEDULE.secondaryBtnText,
      onClose: onDialogClosed,
      onPrimaryBtnClicked: onPausedWorkflowSchedule,
      onSecondaryBtnClicked: onSecondaryBtnClicked
    })
  }

  const onResumedWorkflowScheduleHandler = () => {
    setDialogConfig({
      title: WORKFLOW_DIALOG.RESTART_SCHEDULE.title,
      open: true,
      message: WORKFLOW_DIALOG.RESTART_SCHEDULE.message,
      primaryBtnText: WORKFLOW_DIALOG.RESTART_SCHEDULE.primaryBtnText,
      secondaryBtnText: WORKFLOW_DIALOG.RESTART_SCHEDULE.secondaryBtnText,
      onClose: onDialogClosed,
      onPrimaryBtnClicked: onResumedWorkflowSchedule,
      onSecondaryBtnClicked: onSecondaryBtnClicked
    })
  }

  const onRunWorkflowRunHandler = () => {
    setDialogConfig({
      title: WORKFLOW_DIALOG.RUN_NOW.title,
      open: true,
      message: WORKFLOW_DIALOG.RUN_NOW.message,
      primaryBtnText: WORKFLOW_DIALOG.RUN_NOW.primaryBtnText,
      secondaryBtnText: WORKFLOW_DIALOG.RUN_NOW.secondaryBtnText,
      onClose: onDialogClosed,
      onPrimaryBtnClicked: onRunWorkflowRun,
      onSecondaryBtnClicked: onSecondaryBtnClicked
    })
  }

  const onRunNowWithParametersButtonClicked = () => {
    setOnRunNowWithParameters(true)
  }

  const workflowParameters = workflowDetails?.data?.parameters
    ? Object.entries(workflowDetails.data.parameters).map(
        ([key, value], index) => ({
          id: uuidv4(),
          label: key,
          value: value
        })
      )
    : []

  const taskParameters = workflowDetails?.data?.tasks?.flatMap(
    (task, taskIndex) => {
      if (task.input_parameters && typeof task.input_parameters === 'object') {
        return Object.entries(task.input_parameters).map(
          ([key, value], index) => ({
            id: uuidv4(),
            label: key,
            value: value
          })
        )
      }
      return []
    }
  )

  const parameters =
    workflowParameters.length > 0 ? workflowParameters : taskParameters

  const handleMenuItemClicked = (actionName: string) => {
    if (actionName === WORKFLOW_ACTIONS.DELETE) {
      setDialogConfig({
        title: WORKFLOW_DIALOG.DELETE.title,
        open: true,
        message: WORKFLOW_DIALOG.DELETE.message,
        primaryBtnText: WORKFLOW_DIALOG.DELETE.primaryBtnText,
        secondaryBtnText: WORKFLOW_DIALOG.DELETE.secondaryBtnText,
        onClose: onDialogClosed,
        onPrimaryBtnClicked: onDeleteWorkflow,
        onSecondaryBtnClicked: onSecondaryBtnClicked
      })
    } else if (actionName === WORKFLOW_ACTIONS.YAML) {
      onGetWorkflowYaml()
    } else if (actionName === WORKFLOW_ACTIONS.EDIT) {
      history.push(
        `${routes.workflows}/${workflowDetails?.data?.workflow_id}/edit`
      )
    }
    handleClose()
  }

  const menuItems = [
    {
      actionIcon: <CreateIcon className={classes.actionIcon} />,
      actionName: WORKFLOW_ACTIONS.EDIT
    },
    // {
    //   actionIcon: <ContentCopyIcon className={classes.actionIcon} />,
    //   actionName: WORKFLOW_ACTIONS.CLONE
    // },
    {
      actionIcon: <DownloadIcon className={classes.actionIcon} />,
      actionName: WORKFLOW_ACTIONS.YAML
    },
    {
      actionIcon: <DeleteOutlineIcon className={classes.actionIcon} />,
      actionName: WORKFLOW_ACTIONS.DELETE
    }
  ]

  const cronExpression = workflowDetails?.data?.schedule
    ? workflowDetails.data.schedule === '@once'
      ? '@once'
      : cronstrue.toString(workflowDetails?.data?.schedule, {
          throwExceptionOnParseError: false,
          verbose: true
        })
    : ''

  return (
    <div className={classes.container}>
      <div className={classes.left}>
        <div className={classes.backIconContainer}>
          <BackButton
            mode='route'
            to={routes.workflows}
            actionableVariants={
              ActionableIconButtonVariants.ACTIONABLE_SECONDARY
            }
          />
        </div>
        <div className={classes.workflowBasicInfo}>
          <div className={classes.workflowNameAndDescription}>
            <h2 className={classes.workflowName}>
              {workflowDetails?.data?.display_name}
            </h2>
            {workflowDetails?.data?.description.length >
            MAX_LENGTH_OF_WORKFOW_DESCRIPTION ? (
              <Tooltip title={workflowDetails?.data?.description}>
                <div className={classes.workfowDescription}>
                  {truncate(
                    workflowDetails?.data?.description,
                    MAX_LENGTH_OF_WORKFOW_DESCRIPTION
                  )}
                </div>
              </Tooltip>
            ) : (
              <div
                className={classes.workfowDescription}
                data-testid='workflow-details-page-description'
              >
                {truncate(
                  workflowDetails?.data?.description,
                  MAX_LENGTH_OF_WORKFOW_DESCRIPTION
                )}
              </div>
            )}
          </div>
          <div className={classes.tagsContainer}>
            {workflowDetails?.data?.tags?.map((tag) => (
              <span className={classes.tag} id={tag}>
                <Chip label={tag} key={tag} />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className={classes.right}>
        <div
          className={classes.statusContainer}
          data-testid='workflow-status-container'
        >
          <TagsStatus
            status={getTagStatus(currentStatus)}
            text={formattedSnakeString(currentStatus)}
          />
        </div>
        <div className={classes.seprator}></div>
        <div className={classes.runDetailsContainer}>
          <div className={classes.runDetails}>
            <AccessTimeIcon className={classes.timeIcon} />
            <span
              className={classes.runTime}
              data-testid='workflow-cron-expression'
            >
              {cronExpression || 'N/A'}
            </span>
            {featureFlags.WORKFLOWS.DETAILS_PAGE.EDIT_SCHEDULE && (
              <CreateOutlinedIcon
                className={classes.editIcon}
                onClick={() =>
                  setOpenUpdateScheduleDrawer(!openUpdateScheduleDrawer)
                }
                data-testid='workflow-schedule-button'
              />
            )}
          </div>
          <div className={classes.nextRunDetails}>
            Next run:{' '}
            {getFormattedDateTime(workflowDetails?.data?.next_run_time)}
          </div>
        </div>
        {featureFlags.WORKFLOWS.DETAILS_PAGE.EDIT && (
          <div>
            {workflowStatus?.data === WORKFLOW_STANDARDS_ACTIVE ? (
              <Tooltip title={WORKFLOW_ACTIONS.PAUSE}>
                <div
                  className={classes.pauseIcon}
                  data-testid='workflow-pause-button'
                >
                  <IconButton
                    size={IconButtonSizes.LARGE}
                    variant={IconButtonVariants.SECONDARY}
                    leadingIcon={Icons.ICON_PAUSE}
                    onClick={onPausedWorkflowScheduleHandler}
                  ></IconButton>
                </div>
              </Tooltip>
            ) : (
              <Tooltip title={WORKFLOW_ACTIONS.RESUME}>
                <div
                  className={classes.resumeIcon}
                  data-testid='workflow-resume-button'
                >
                  <IconButton
                    size={IconButtonSizes.LARGE}
                    variant={IconButtonVariants.SECONDARY}
                    leadingIcon={Icons.ICON_PLAY_ARROW}
                    onClick={onResumedWorkflowScheduleHandler}
                  />
                </div>
              </Tooltip>
            )}
          </div>
        )}
        {featureFlags.WORKFLOWS.DETAILS_PAGE.EDIT && (
          <div className={classes.seprator}></div>
        )}
        {featureFlags.WORKFLOWS.DETAILS_PAGE.EDIT && (
          <div className={classes.actions}>
            <MoreVertOutlinedIcon
              className={classes.menuIcon}
              id='basic-button'
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              data-testid='workflow-details-page-actions-button'
            />
            <WorkflowListItemMenu
              anchorEl={anchorEl}
              open={open}
              handleClose={handleClose}
              handleClick={handleMenuItemClicked}
              menuItems={menuItems}
            />
            <div className={classes.buttonContainer}>
              <SplitButton
                onRunNow={onRunWorkflowRunHandler}
                onRunWithParameters={onRunNowWithParametersButtonClicked}
                isDisabled={
                  workflowStatus?.data !== WORKFLOW_STANDARDS_ACTIVE &&
                  workflowStatus?.data !== WORKFLOW_STANDARDS_INACTIVE
                }
                tooltipMessage={
                  workflowStatus?.data !== WORKFLOW_STANDARDS_ACTIVE
                    ? 'Active workflow to schedule run'
                    : ''
                }
              />
            </div>
            {onRunNowWithParameters && (
              <RunNowWithParametersDialog
                openDialog={onRunNowWithParameters}
                handleDialogClose={() => {
                  setOnRunNowWithParameters(false)
                }}
                parameters={parameters}
                workflowId={workflowDetails?.data?.workflow_id}
                workflowRunsData={workflowRuns.data}
              />
            )}
          </div>
        )}
      </div>

      <UpdateSchedule
        open={openUpdateScheduleDrawer}
        onClose={onCloseUpdateScheduleDrawer}
      />
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  deleteWorkflowDetails: state.workflowsReducer.deleteWorkflow,
  workflowYaml: state.workflowsReducer.getWorkflowYaml,
  workflowRuns: state.workflowDetailsReducer.workflowRuns,
  workflowStatus: state.workflowDetailsReducer.workflowStatus,
  workflowResumeStatus: state.workflowsReducer.resumeWorkflowSchedule,
  workflowPauseStatus: state.workflowsReducer.pauseWorkflowSchedule
})

const mapDispatchToProps = (dispatch) => {
  return {
    setDialogConfig: (dialogConfig: ICommonState['dialogConfig']) =>
      dispatch(setDialogConfig(dialogConfig)),
    deleteWorkflow: (payload: DeleteWorkflowInput) =>
      deleteWorkflow(dispatch, payload, null),
    pauseWorkflowSchedule: (
      payload: PauseWorkflowScheduleInput,
      workflowDetailsData: SelectionOnGetWorkflowDetails
    ) => pauseWorkflowSchedule(dispatch, payload, null, workflowDetailsData),
    resumeWorkflowSchedule: (
      payload: PauseWorkflowScheduleInput,
      workflowDetailsData: SelectionOnGetWorkflowDetails
    ) => resumeWorkflowSchedule(dispatch, payload, null, workflowDetailsData),
    getWorkflowYaml: (payload: GetWorkflowYamlInput) =>
      getWorkflowYaml(dispatch, payload),
    resetWorkflowYaml: () => dispatch(resetWorkflowYaml()),
    runWorkflowRun: (
      payload: RunWorkflowRunInput,
      data: SelectionOnGetWorkflowRuns
    ) => runWorkflowRun(dispatch, payload, null, data),
    getWorkflowStatusFunc: (payload) => getWorkflowStatus(dispatch, payload)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorkflowDetailsHeader)

export default StyleComponent
