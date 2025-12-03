import {Editor} from '@monaco-editor/react'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import RefreshIcon from '@mui/icons-material/Refresh'
import {CircularProgress, LinearProgress, Tooltip} from '@mui/material'
import Drawer from '@mui/material/Drawer'
import {withStyles, WithStyles} from '@mui/styles'
import axios from 'axios'
import config from 'config'
import React, {useEffect, useRef, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import 'reactflow/dist/style.css'
import {compose} from 'redux'
import {
  Banner,
  BannerProps,
  Severity
} from '../../../bit-components/banner/index'
import {
  Button,
  ButtonSizes,
  ButtonVariants
} from '../../../bit-components/button/index'
import {Chip} from '../../../bit-components/chip/index'
import {Icons} from '../../../bit-components/icon/index'
import {Tags, TagsSizes} from '../../../bit-components/tags/tags/index'
import {routes} from '../../../constants'
import {
  invalidProjectId,
  sourceTypes,
  TASK_OUTPUT_TYPES
} from '../../../modules/workflows/constants'
import {SelectionOnTasks} from '../../../modules/workflows/graphqlAPIs/getWorkflowDetails'
import {GetWorkflowPathIdsInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowPathIds'
import {getWorkflowPathIds} from '../../../modules/workflows/graphqlAPIs/getWorkflowPathIds/index.thunk'
import {SelectionOnPackages} from '../../../modules/workflows/graphqlAPIs/getWorkflowTaskDetailsWithoutRun'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {
  WORKFLOW_STANDARDS_FAIL,
  WORKFLOW_STANDARDS_NOTEBOOK,
  WORKFLOW_STANDARDS_RUNNING,
  WORKFLOW_STANDARDS_SCHEDULED,
  WORKFLOW_STANDARDS_SKIPPED,
  WORKFLOW_STANDARDS_SUCCESS,
  WORKFLOW_STANDARDS_UPSTREAM_FAIL
} from '../../../modules/workflows/pages/workflows/constants'
import {
  getTagsType,
  onClusterLinkClicked
} from '../../../modules/workflows/pages/workflows/utils'
import {
  getInputParametersValue,
  shouldShowClusterLinks
} from '../../../modules/workflows/utils'
import {CommonState} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import {getTimeDifference} from '../../../utils/helper'
import Spinner from '../../spinner/spinner'
import {getFormattedDateTime} from '../allWorkflows/utils'
import TaskOutputDrawerHeader from '../taskOutputDrawerHeader'
import WorkflowParameterListing from '../workflowParameterListing'
import styles from './indexJSS'

const tabs = [
  {
    label: 'Application Logs'
  },
  {
    label: 'System Logs'
  }
]

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  workflowTaskDetails: IWorkflowsDetailsState['workflowTaskDetails']
  selectedTask: SelectionOnTasks
  closeDrawer: () => void
  workflowRunDetails: IWorkflowsDetailsState['workflowRunDetails']
  workflowPathIds: IWorkflowsDetailsState['workflowPathIds']
}

const TaskOutputDrawer = (props: IProps) => {
  const {
    classes,
    selectedTask,
    closeDrawer,
    workflowDetails,
    workflowTaskDetails,
    workflowRunDetails,
    workflowPathIds
  } = props
  const history = useHistory()

  const [retryInRoute, setRetryInRoute] = useState(
    history.location.pathname.split('/').length > 7
      ? history.location.pathname.split('/')[7]
      : 'latest'
  )
  const [tabInRoute, setTabInRoute] = useState(
    history.location.pathname.split('/').length > 8
      ? history.location.pathname.split('/')[8]
      : ''
  )

  const [selctedTaskRetry, setSelectedTaskRetry] = useState(0)

  const [taskOutputTab, setTaskOutputTab] = useState(
    tabInRoute === 'system-logs' ? 1 : 0
  )
  const [oldLog, setOldLog] = useState('')
  const [isOldLogLoading, setIsOldLogLoading] = useState(false)
  const [applicationLog, setApplicationLog] = useState('')
  const [isApplicationLogLoading, setIsApplicationLogLoading] = useState(false)
  const [systemLog, setSystemLog] = useState('')
  const [isSystemLogLoading, setIsSystemLogLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorHeight, setErrorHeight] = useState(0)
  const [percentProgress, setPercentProgress] = useState(0)
  const errorRef = useRef(null)
  const editorRef = useRef(null)

  if (history.location.pathname.split('/').length > 7) {
    const currentRetry = history.location.pathname.split('/')[7]
    if (currentRetry !== retryInRoute) {
      setRetryInRoute(currentRetry)
    }
  }

  if (history.location.pathname.split('/').length > 8) {
    const currentTab = history.location.pathname.split('/')[8]
    if (currentTab !== tabInRoute) {
      setTabInRoute(currentTab)
    }
  }

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
  }

  const getWorkflowRunDetailsStatusClass = (status: string) => {
    switch (status) {
      case WORKFLOW_STANDARDS_SUCCESS:
        return ''
      case WORKFLOW_STANDARDS_RUNNING:
        return 'running'
      case WORKFLOW_STANDARDS_FAIL:
        return 'failed'
      case WORKFLOW_STANDARDS_UPSTREAM_FAIL:
        return 'upstreamFailed'
      case WORKFLOW_STANDARDS_SKIPPED:
        return 'skipped'
      default:
        return 'running'
    }
  }

  const getWorkflowRunDetailsStatus = (status: string) => {
    switch (status) {
      case WORKFLOW_STANDARDS_SUCCESS:
        return 'Success'
      case WORKFLOW_STANDARDS_RUNNING:
        return 'Running'
      case WORKFLOW_STANDARDS_FAIL:
        return 'Failed'
      case WORKFLOW_STANDARDS_UPSTREAM_FAIL:
        return 'Upstream Task Failed'
      case WORKFLOW_STANDARDS_SKIPPED:
        return 'Skipped'
      default:
        return status
    }
  }

  const onTabChange = (tab: string) => {
    if (tab === 'System Logs') {
      history.replace(
        `/workflows/${workflowDetails?.data?.workflow_id}/runs/${workflowRunDetails?.data?.run_id}/tasks/${selectedTask?.task_name}/${retryInRoute}/system-logs`
      )
      setTabInRoute('system-logs')
    } else {
      history.replace(
        `/workflows/${workflowDetails?.data?.workflow_id}/runs/${workflowRunDetails?.data?.run_id}/tasks/${selectedTask?.task_name}/${retryInRoute}/application-logs`
      )
      setTabInRoute('application-logs')
    }
  }

  let applicationLogController = new AbortController()
  let systemLogController = new AbortController()

  const fetchApplicationLog = () => {
    if (applicationLogController) {
      applicationLogController.abort()
    }
    applicationLogController = new AbortController()
    const signal = applicationLogController.signal
    if (workflowTaskDetails?.data?.output[selctedTaskRetry]?.application_log) {
      setIsApplicationLogLoading(true)
      axios
        .get(
          workflowTaskDetails?.data?.output[selctedTaskRetry]?.application_log,
          {
            signal,
            onDownloadProgress: (progressEvent) => {
              const percentDownloaded = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
              setPercentProgress(percentDownloaded)
            }
          }
        )
        .then((res) => {
          setApplicationLog(res.data)
          setIsApplicationLogLoading(false)
        })
        .catch(() => {
          setApplicationLog('Error loading data!')
          setIsApplicationLogLoading(false)
        })
    } else {
      setApplicationLog('')
    }
  }
  const fetchSystemLog = () => {
    if (systemLogController) {
      systemLogController.abort()
    }
    systemLogController = new AbortController()
    const signal = systemLogController.signal

    if (workflowTaskDetails?.data?.output[selctedTaskRetry]?.system_log) {
      setIsSystemLogLoading(true)
      axios
        .get(workflowTaskDetails?.data?.output[selctedTaskRetry]?.system_log, {
          signal
        })
        .then((res) => {
          setSystemLog(res.data)
          setIsSystemLogLoading(false)
        })
        .catch(() => {
          setSystemLog('Error loading data!')
          setIsSystemLogLoading(false)
        })
    } else {
      setSystemLog('')
    }
  }

  const handleRefreshClick = () => {
    const logType = tabs[taskOutputTab].label
    if (logType === 'Application Logs') {
      fetchApplicationLog()
    } else if (logType === 'System Logs') {
      fetchSystemLog()
    }
  }

  const handlePathLinkClick = () => {
    if (workflowTaskDetails?.data?.source_type === sourceTypes[0].value) {
      const workspacePath =
        workflowTaskDetails?.data?.source +
        '/' +
        workflowTaskDetails?.data?.file_path
      const pId = workflowTaskDetails?.data?.project_id?.toString()
      const cId = workflowTaskDetails?.data?.codespace_id?.toString()
      window.open(
        `${routes.sharedWorkspace
          .replace(':pId', pId)
          .replace(':cId', cId)}/?lab_url=fsx/workspace/${workspacePath}`,
        '_blank'
      )
    } else if (
      workflowTaskDetails?.data?.source_type === sourceTypes[1].value
    ) {
      window.open(`${workflowTaskDetails?.data?.source}`, '_blank')
    }
  }
  useEffect(() => {
    if (tabInRoute === 'system-logs') {
      setTaskOutputTab(1)
    } else {
      setTaskOutputTab(0)
    }
  }, [tabInRoute])

  useEffect(() => {
    if (parseInt(retryInRoute) || parseInt(retryInRoute) === 0) {
      setSelectedTaskRetry(parseInt(retryInRoute))
    }
  }, [retryInRoute])

  useEffect(() => {
    if (workflowTaskDetails?.data?.output[selctedTaskRetry]?.logs) {
      setIsOldLogLoading(true)
      axios
        .get(workflowTaskDetails?.data?.output[selctedTaskRetry]?.logs)
        .then((res) => {
          setOldLog(res.data)
          setIsOldLogLoading(false)
        })
        .catch(() => {
          setOldLog('Error loading data!')
          setIsOldLogLoading(false)
        })
    } else {
      setOldLog('')
    }
  }, [workflowTaskDetails?.data?.output[selctedTaskRetry]?.logs])

  useEffect(() => {
    if (workflowTaskDetails?.data?.output[selctedTaskRetry]?.error) {
      setShowError(true)
    } else {
      setShowError(false)
    }
  }, [workflowTaskDetails?.data?.output[selctedTaskRetry]?.error])

  useEffect(() => {
    if (parseInt(retryInRoute) === selctedTaskRetry) {
      fetchApplicationLog()
    }
  }, [
    workflowTaskDetails?.data?.output[selctedTaskRetry]?.application_log,
    retryInRoute
  ])

  useEffect(() => {
    if (parseInt(retryInRoute) === selctedTaskRetry) {
      fetchSystemLog()
    }
  }, [
    workflowTaskDetails?.data?.output[selctedTaskRetry]?.system_log,
    retryInRoute
  ])

  useEffect(() => {
    if (selectedTask) {
      if (!isApplicationLogLoading && !applicationLog && systemLog) {
        history.replace(
          `/workflows/${workflowDetails?.data?.workflow_id}/runs/${workflowRunDetails?.data?.run_id}/tasks/${selectedTask?.task_name}/${retryInRoute}/system-logs`
        )
      } else if (tabInRoute === 'system-logs') {
        history.replace(
          `/workflows/${workflowDetails?.data?.workflow_id}/runs/${workflowRunDetails?.data?.run_id}/tasks/${selectedTask?.task_name}/${retryInRoute}/system-logs`
        )
      } else if (tabInRoute === 'application-logs') {
        history.replace(
          `/workflows/${workflowDetails?.data?.workflow_id}/runs/${workflowRunDetails?.data?.run_id}/tasks/${selectedTask?.task_name}/${retryInRoute}/application-logs`
        )
      }
    }
  }, [selectedTask, applicationLog, systemLog])

  useEffect(() => {
    if (errorRef && errorRef.current) {
      setErrorHeight(errorRef.current.clientHeight)
    }
  })

  const getTaskOutput = (
    outputType: string,
    output: string,
    showError: boolean
  ) => {
    if (outputType === TASK_OUTPUT_TYPES.html) {
      return (
        <div
          className={`${classes.taskoutputContent} ${classes.htmlTaskOutput}`}
          dangerouslySetInnerHTML={{
            __html: output
          }}
          style={{
            maxHeight:
              errorHeight && showError
                ? `calc(100vh - 195px - ${errorHeight}px)`
                : 'calc(100vh - 195px)'
          }}
        />
      )
    } else {
      return isApplicationLogLoading || isSystemLogLoading ? (
        <Spinner size={40} show={true} />
      ) : (
        <div
          className={classes.taskoutputContent}
          style={{
            maxHeight:
              errorHeight && showError
                ? `calc(100vh - 195px - ${errorHeight}px)`
                : 'calc(100vh - 195px)'
          }}
        >
          <Editor
            width={'100%'}
            height={'100%'}
            language={'shell'}
            loading={<CircularProgress />}
            options={{
              readOnly: true,
              minimap: {
                enabled: false
              }
            }}
            value={output}
            onMount={(editor, monaco) => {
              monaco.editor.lo
              monaco.editor.defineTheme('myTheme', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                  'editor.foreground': '#D9D9D9',
                  'editor.background': '#121212'
                }
              })

              monaco.editor.setTheme('myTheme')
              handleEditorDidMount(editor, monaco)
            }}
          />
        </div>
      )
    }
  }

  const getOutputType = (link: string) => {
    if (!link) {
      return TASK_OUTPUT_TYPES.string
    }

    const splittedLink = link.split('/')
    const fileName = splittedLink[splittedLink.length - 1]
    const fileExtension = fileName.split('.')[1]

    if (fileExtension === 'log') {
      return TASK_OUTPUT_TYPES.string
    } else if (fileExtension === 'html') {
      return TASK_OUTPUT_TYPES.html
    } else {
      return TASK_OUTPUT_TYPES.string
    }
  }

  const getOldTaskOutputLog = () => {
    const outputType = getOutputType(
      workflowTaskDetails?.data?.output[selctedTaskRetry]?.logs
    )

    return (
      <div className={classes.taskoutput}>
        <div className={classes.taskoutputTitleContainer}>
          <div className={classes.taskoutputTitle}>Output</div>
        </div>
        {workflowTaskDetails?.status === API_STATUS.LOADING && (
          <div className={classes.taskoutputContent}>
            <Spinner size={40} show={true} />
          </div>
        )}
        {workflowTaskDetails?.status === API_STATUS.SUCCESS &&
          getTaskOutput(outputType, oldLog, false)}
      </div>
    )
  }

  const getExportButtonLabel = (outputType: string) => {
    if (outputType === TASK_OUTPUT_TYPES.html) {
      return 'Export As HTML'
    } else {
      return 'Download'
    }
  }

  const exportOutput = (
    outputType: string,
    output: string,
    filename: string
  ) => {
    if (outputType === TASK_OUTPUT_TYPES.html) {
      const blob = new Blob([output], {type: 'text/html'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.html`
      a.click()
    } else {
      const blob = new Blob([output], {type: 'text/plain'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.txt`
      a.click()
    }
  }

  const onHighlightError = (error: string, outputType: string) => {
    if (error && outputType === TASK_OUTPUT_TYPES.string) {
      const model = editorRef.current.getModel()
      const lastLineNumber = model.getLineCount()
      editorRef.current.revealLineInCenter(lastLineNumber)
    } else if (error && outputType === TASK_OUTPUT_TYPES.html) {
      const a = document.createElement('a')
      a.href = '#papermill-error-cell'
      a.click()
    }
  }

  const getTaskError = (
    error: string,
    shouldShowError: boolean,
    taskOutputType: string
  ) => {
    if (error && shouldShowError) {
      if (error.length > 270) {
        error = error.slice(0, 270) + '...'
      }
      return (
        <div className={classes.errorContainer} ref={errorRef}>
          <Banner
            message={error}
            severity={Severity.Failure}
            open={showError}
            leadingIcon={Icons.ICON_ERROR_OUTLINE}
            onClose={() => setShowError(false)}
            showCloseButton={true}
            buttonParams={{
              buttonText: 'Highlight Error',
              buttonHandler: () => onHighlightError(error, taskOutputType)
            }}
          />
        </div>
      )
    }

    return <></>
  }
  const displayWorkflowTaskLibraries = (
    packages: Array<SelectionOnPackages | null> | null
  ) => {
    if (!packages || packages.length === 0) {
      return '--'
    }
    return packages.map((library, index) => {
      const name = library?.body?.name || library?.body?.path || '--'
      return <div key={index}>{name}</div>
    })
  }

  const getNewTaskOutputLog = () => {
    let outputType =
      taskOutputTab === 0
        ? getOutputType(
            workflowTaskDetails?.data?.output[selctedTaskRetry]?.application_log
          )
        : getOutputType(
            workflowTaskDetails?.data?.output[selctedTaskRetry]?.system_log
          )

    const taskOutputContent = taskOutputTab === 0 ? applicationLog : systemLog
    const taskError = getTaskError(
      workflowTaskDetails?.data?.output[selctedTaskRetry]?.error,
      taskOutputTab === 0,
      outputType
    )
    const taskOutput =
      !applicationLog && !systemLog
        ? getTaskOutput(outputType, 'Generating Output. Please Wait...', false)
        : taskOutputTab === 0
        ? getTaskOutput(outputType, applicationLog, true)
        : getTaskOutput(outputType, systemLog, false)

    return (
      <div className={classes.taskoutput}>
        <div className={`${classes.taskoutputTitleContainer}`}>
          <div className={classes.tabContainer}>
            {tabs.map((tab, idx) => {
              return (
                <div
                  className={`${classes.tab} ${
                    taskOutputTab === idx && 'active'
                  }`}
                  key={idx}
                  onClick={() => onTabChange(tab.label)}
                >
                  {tab.label}
                </div>
              )
            })}
          </div>
          <div className={classes.tabLoad}>
            <RefreshIcon
              className={classes.refreshIcon}
              onClick={handleRefreshClick}
            />
            <Button
              buttonText={getExportButtonLabel(outputType)}
              onClick={() =>
                exportOutput(
                  outputType,
                  taskOutputContent,
                  taskOutputTab === 0
                    ? `${workflowDetails?.data?.display_name}_${workflowTaskDetails?.data?.run_id}_${selectedTask?.task_name}_application_log`
                    : `${workflowDetails?.data?.display_name}_${workflowTaskDetails?.data?.run_id}_${selectedTask?.task_name}_system_log`
                )
              }
              size={ButtonSizes.MEDIUM}
              variant={ButtonVariants.SECONDARY}
            />
          </div>
        </div>
        {isApplicationLogLoading && (
          <div className={classes.progressBarContainer}>
            <LinearProgress
              variant='determinate'
              value={percentProgress}
              className={classes.progressBarFilled}
            />
            <span className={classes.progressText}>{percentProgress}%</span>
          </div>
        )}
        {workflowTaskDetails?.status === API_STATUS.LOADING && (
          <div className={classes.taskoutputContent}>
            <Spinner size={40} show={true} />
          </div>
        )}
        {workflowTaskDetails?.status === API_STATUS.SUCCESS &&
          !isApplicationLogLoading &&
          taskError}
        {workflowTaskDetails?.status === API_STATUS.SUCCESS &&
          !isApplicationLogLoading &&
          taskOutput}
      </div>
    )
  }

  const getTaskOutputLogs = () => {
    if (workflowTaskDetails?.data?.output[selctedTaskRetry]?.system_log) {
      return getNewTaskOutputLog()
    } else {
      return getOldTaskOutputLog()
    }
  }

  const onSelectedTaskRetryChange = (newRetry: number) => {
    history.replace(
      `/workflows/${workflowDetails?.data?.workflow_id}/runs/${workflowRunDetails?.data?.run_id}/tasks/${selectedTask?.task_name}/${newRetry}/${tabInRoute}`
    )
    setRetryInRoute(`${newRetry}`)
  }

  useEffect(() => {
    if (workflowTaskDetails?.status === API_STATUS.SUCCESS) {
      if (retryInRoute === 'latest' && selectedTask?.task_name) {
        history.replace(
          `/workflows/${workflowDetails?.data?.workflow_id}/runs/${
            workflowRunDetails?.data?.run_id
          }/tasks/${selectedTask?.task_name}/${
            workflowTaskDetails?.data?.output?.length - 1
          }/${tabInRoute}`
        )
      }
    }
  }, [workflowTaskDetails?.status])

  const closeDrawerHandler = () => {
    setRetryInRoute('latest')
    setTabInRoute('')
    setSelectedTaskRetry(0)
    setApplicationLog('')
    setSystemLog('')
    setOldLog('')
    setPercentProgress(0)
    closeDrawer()
  }

  return (
    <Drawer
      anchor={'right'}
      open={Boolean(selectedTask)}
      onClose={closeDrawerHandler}
      PaperProps={{
        sx: {width: '90%'}
      }}
    >
      <TaskOutputDrawerHeader
        onCloseDrawer={closeDrawerHandler}
        workflowTaskDetails={workflowTaskDetails}
        selctedTaskRetry={selctedTaskRetry}
        onSelectedTaskRetryChange={onSelectedTaskRetryChange}
      />
      <div className={classes.taskDetailsContainer}>
        {getTaskOutputLogs()}
        <div className={classes.taskDetailsSidePanel}>
          <div className={classes.title}>
            <Tooltip title={selectedTask?.task_name || ''}>
              <div className={classes.titleName}>
                {selectedTask?.task_name || '--'}
              </div>
            </Tooltip>
            {workflowTaskDetails?.data?.run_status && (
              <>
                <span
                  className={`${
                    classes.runStatus
                  } ${getWorkflowRunDetailsStatusClass(
                    workflowTaskDetails?.data?.run_status
                  )}`}
                >
                  {getWorkflowRunDetailsStatus(
                    workflowTaskDetails?.data?.run_status
                  )}
                </span>
                {workflowTaskDetails?.data?.output[selctedTaskRetry]
                  ?.trigger === WORKFLOW_STANDARDS_SCHEDULED ? null : (
                  <span className={classes.runTrigger}>Manual</span>
                )}
              </>
            )}
          </div>
          {workflowTaskDetails?.status === API_STATUS.LOADING && (
            <Spinner size={40} show={true} />
          )}
          {workflowTaskDetails?.status === API_STATUS.SUCCESS && (
            <>
              <div className={classes.workflowDetail}>
                <div className={classes.workflowDetailTitle}>Task ID</div>
                <div className={`${classes.workflowDetailsDescription}`}>
                  #{workflowTaskDetails?.data?.task_id}
                </div>
              </div>
              <div className={classes.workflowDetail}>
                <div className={classes.workflowDetailTitle}>Started</div>
                <div className={`${classes.workflowDetailsDescription}`}>
                  {getFormattedDateTime(
                    workflowTaskDetails?.data?.output[selctedTaskRetry]
                      ?.start_time
                  )}
                </div>
              </div>
              <div className={classes.workflowDetail}>
                <div className={classes.workflowDetailTitle}>Ended</div>
                <div className={`${classes.workflowDetailsDescription}`}>
                  {getFormattedDateTime(
                    workflowTaskDetails?.data?.output[selctedTaskRetry]
                      ?.end_time
                  )}
                </div>
              </div>
              <div className={classes.workflowDetail}>
                <div className={classes.workflowDetailTitle}>Duration</div>
                <div className={`${classes.workflowDetailsDescription}`}>
                  {getTimeDifference(
                    workflowTaskDetails?.data?.output[selctedTaskRetry]
                      ?.duration
                  )}
                </div>
              </div>

              <hr className={classes.line} />

              <div className={classes.taskDetailsContainerSection}>
                <div className={classes.taskDetail}>
                  <div className={classes.taskDetailTitle}>Source</div>
                  <div className={`${classes.taskDetailsDescription}`}>
                    {workflowTaskDetails?.data?.source_type}
                  </div>
                </div>
                {workflowTaskDetails?.data?.source_type ===
                sourceTypes[1].value ? (
                  <div className={classes.taskDetail}>
                    <div className={classes.taskDetailTitle}>Git Repo URL</div>
                    <Tooltip title={workflowTaskDetails?.data?.file_path || ''}>
                      <div
                        className={classes.pathLink}
                        onClick={handlePathLinkClick}
                      >
                        Github Link
                        <OpenInNewIcon className={classes.openInNewTabIcon} />
                      </div>
                    </Tooltip>
                  </div>
                ) : (
                  <div className={classes.taskDetail}>
                    <div className={classes.taskDetailTitle}>Path</div>
                    {workflowTaskDetails?.data?.project_id ===
                    invalidProjectId ? (
                      <div className={classes.taskDetailsDescription}>
                        {workflowTaskDetails?.data?.source +
                          '/' +
                          workflowTaskDetails?.data?.file_path}
                      </div>
                    ) : (
                      <div
                        className={`${classes.taskDetailsDescription}`}
                        onClick={handlePathLinkClick}
                      >
                        <Tooltip
                          title={
                            workflowTaskDetails?.data?.source +
                              '/' +
                              workflowTaskDetails?.data?.file_path || ''
                          }
                        >
                          <div className={classes.pathLink}>
                            Workspace Link
                            <OpenInNewIcon
                              className={classes.openInNewTabIcon}
                            />
                          </div>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {workflowTaskDetails?.data?.source_type ===
              sourceTypes[1].value ? (
                <div className={classes.taskDetail}>
                  <div className={classes.taskDetailTitle}>Path</div>
                  <div className={`${classes.taskDetailsDescription}`}>
                    {workflowTaskDetails?.data?.file_path}
                  </div>
                </div>
              ) : null}
              <div className={classes.taskDetail}>
                <div className={classes.taskDetailTitle}>
                  Dynamically update code files
                </div>
                <div className={classes.taskDetailsDescription}>
                  {workflowTaskDetails?.data?.dynamic_artifact ? 'Yes' : 'No'}
                </div>
              </div>
              <hr className={classes.line} />
              <div className={classes.taskDetail}>
                <div className={classes.taskDetailTitle}>
                  <div className={classes.left}>Cluster</div>
                </div>
                <div className={classes.clusterContainer}>
                  <div className={classes.clusterTitleContainer}>
                    <div className={classes.left}>
                      <div
                        className={
                          shouldShowClusterLinks(
                            workflowTaskDetails?.data?.output[selctedTaskRetry]
                              ?.attached_cluster?.cluster_status
                          )
                            ? classes.clusterTitle
                            : ''
                        }
                        onClick={() => {
                          if (
                            shouldShowClusterLinks(
                              workflowTaskDetails?.data?.output[
                                selctedTaskRetry
                              ].attached_cluster?.cluster_status
                            )
                          ) {
                            onClusterLinkClicked(
                              'dashboard',
                              workflowTaskDetails?.data?.output[
                                selctedTaskRetry
                              ].attached_cluster?.cluster_id
                            )
                          }
                        }}
                      >
                        {
                          workflowTaskDetails?.data?.output[selctedTaskRetry]
                            ?.attached_cluster?.cluster_name
                        }
                      </div>
                      {shouldShowClusterLinks(
                        workflowTaskDetails?.data?.output[selctedTaskRetry]
                          ?.attached_cluster?.cluster_status
                      ) && (
                        <OpenInNewIcon
                          onClick={() =>
                            onClusterLinkClicked(
                              'dashboard',
                              workflowTaskDetails?.data?.output[
                                selctedTaskRetry
                              ].attached_cluster?.cluster_id
                            )
                          }
                          className={classes.openInNewTabIcon}
                        />
                      )}
                      {workflowTaskDetails?.data?.output[selctedTaskRetry]
                        ?.attached_cluster?.cluster_status && (
                        <span className={classes.tag}>
                          <Tags
                            label={
                              workflowTaskDetails?.data?.output[
                                selctedTaskRetry
                              ].attached_cluster?.cluster_status
                            }
                            type={getTagsType(
                              workflowTaskDetails?.data?.output[
                                selctedTaskRetry
                              ].attached_cluster?.cluster_status
                            )}
                            size={TagsSizes.Small}
                          />
                        </span>
                      )}
                    </div>
                    {/* <LinkOffIcon className={classes.openInNewTabIcon} /> */}
                  </div>
                  <div className={classes.clusterInfo}>
                    {
                      workflowTaskDetails?.data?.output[selctedTaskRetry]
                        ?.attached_cluster.cores
                    }{' '}
                    Core /{' '}
                    {
                      workflowTaskDetails?.data?.output[selctedTaskRetry]
                        ?.attached_cluster.memory
                    }{' '}
                    GB
                  </div>
                  <div className={classes.clusterInfo}>
                    {
                      workflowTaskDetails?.data?.output[selctedTaskRetry]
                        ?.attached_cluster.runtime
                    }
                  </div>
                  {shouldShowClusterLinks(
                    workflowTaskDetails?.data?.output[selctedTaskRetry]
                      ?.attached_cluster?.cluster_status
                  ) && (
                    <div className={classes.dashboards}>
                      <div
                        className={classes.dashboard}
                        onClick={() =>
                          onClusterLinkClicked(
                            'events',
                            workflowTaskDetails?.data?.output[selctedTaskRetry]
                              ?.attached_cluster.cluster_id
                          )
                        }
                      >
                        <span>Events</span>
                        <OpenInNewIcon className={classes.openInNewTabIcon} />
                      </div>
                      <div
                        className={classes.dashboard}
                        onClick={() =>
                          onClusterLinkClicked(
                            'dashboard',
                            workflowTaskDetails?.data?.output[selctedTaskRetry]
                              ?.attached_cluster.cluster_id
                          )
                        }
                      >
                        <span>Dashboard</span>
                        <OpenInNewIcon className={classes.openInNewTabIcon} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={classes.taskDetail}>
                <div className={classes.taskDetailTitle}>Libraries</div>{' '}
                <div className={classes.taskDetailsDescription}>
                  {displayWorkflowTaskLibraries(
                    workflowTaskDetails?.data?.packages
                  )}
                </div>
                {/* <div className={`${classes.taskDetailsDescription}`}>
                  {workflowTaskDetails?.data?.dependent_libraries || '--'}
                </div> */}
              </div>
              <hr className={classes.line} />
              <div className={classes.taskDetail}>
                <div className={classes.taskDetailTitle}>Depends On</div>
                <div className={`${classes.taskDetailsDescription}`}>
                  {workflowTaskDetails?.data?.depends_on?.length > 0
                    ? workflowTaskDetails?.data?.depends_on.map((tag) => (
                        <span className={classes.dependsOnChip} id={tag}>
                          <Chip label={tag} key={tag} />
                        </span>
                      ))
                    : '--'}
                </div>
                <div className={classes.dependencyContainer}>
                  <span className={classes.taskDetailTitle}>
                    Run if dependencies:
                  </span>
                  <span className={classes.triggerConditionText}>
                    {workflowTaskDetails?.data?.depends_on?.length > 0
                      ? workflowTaskDetails?.data?.trigger_rule
                      : '--'}
                  </span>
                </div>
              </div>
              <hr className={classes.line} />
              <div className={`${classes.eventsText} ${classes.taskDetail}`}>
                <span className={classes.taskDetailTitle}>
                  Notify when this task:
                </span>
                {/* Can traverse and add multiples of chips */}
                <div className={classes.dependsOnChip}>
                  {workflowTaskDetails?.data?.notification_preference
                    ?.on_fail && (
                    <div className={classes.notificationPreference}>Fails</div>
                  )}
                  {!workflowTaskDetails?.data?.notification_preference
                    ?.on_fail && (
                    <div className={classes.notificationPreference}>--</div>
                  )}
                </div>
              </div>
              <div className={classes.formFieldContainer}>
                <span className={classes.taskDetailTitle}>Slack Channel</span>
                <span className={classes.taskDetailsDescription}>
                  {workflowTaskDetails?.data?.notify_on || '--'}
                </span>
              </div>
              <hr className={classes.line} />
              <div className={classes.taskDetail}>
                <div className={classes.taskDetailTitle}>Parameters</div>
                <WorkflowParameterListing
                  data={workflowTaskDetails?.data?.input_parameters}
                />
              </div>
              <hr className={classes.line} />
              <div className={classes.taskDetailsContainerSection}>
                <div className={classes.taskDetail}>
                  <div className={classes.taskDetailTitle}>Retries</div>
                  <div className={`${classes.taskDetailsDescription}`}>
                    {workflowTaskDetails?.data?.retries || '--'}
                  </div>
                </div>
                <div className={classes.taskDetail}>
                  <div className={classes.taskDetailTitle}>
                    Timeout (in sec)
                  </div>
                  <div className={`${classes.taskDetailsDescription}`}>
                    {workflowTaskDetails?.data?.timeout || '--'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div></div>
    </Drawer>
  )
}

const mapStateToProps = (state: CommonState) => ({
  workflowDetails: state.workflowDetailsReducer.workflowDetails,
  workflowTaskDetails: state.workflowDetailsReducer.workflowTaskDetails,
  workflowRunDetails: state.workflowDetailsReducer.workflowRunDetails,
  workflowPathIds: state.workflowDetailsReducer.workflowPathIds
})

const mapDispatchToProps = (dispatch) => {
  return {}
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(TaskOutputDrawer)

export default StyleComponent
