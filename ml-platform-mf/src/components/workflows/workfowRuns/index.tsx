import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import StopIcon from '@mui/icons-material/Stop'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory, useLocation} from 'react-router-dom'
import {compose} from 'redux'
import {setDialogConfig} from '../../../actions/commonActions'
import {Datatable} from '../../../bit-components/datatable/index'
import {TableCellSize} from '../../../bit-components/table-cells/tc-cell/index'
import {GetWorkflowRunDetailsInput} from '../../../modules/workflows/graphqlAPIs/getWorkflowRunDetails'
import {getWorkflowRunDetails} from '../../../modules/workflows/graphqlAPIs/getWorkflowRunDetails/index.thunk'
import {
  GetWorkflowRunsInput,
  SelectionOnGetWorkflowRuns
} from '../../../modules/workflows/graphqlAPIs/getWorkflowRuns'
import {getWorkflowRuns} from '../../../modules/workflows/graphqlAPIs/getWorkflowRuns/index.thunk'
import {StopWorkflowRunInput} from '../../../modules/workflows/graphqlAPIs/stopWorkflowRun'
import {stopWorkflowRun} from '../../../modules/workflows/graphqlAPIs/stopWorkflowRun/index.thunk'
import {resetWorkflowRunDetails} from '../../../modules/workflows/pages/workflowDetails/actions'
import {SIDE_PANELS} from '../../../modules/workflows/pages/workflowDetails/constants'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {WORKFLOW_STANDARDS_RUNNING} from '../../../modules/workflows/pages/workflows/constants'
import {
  CommonState,
  defaultDialogConfig,
  ICommonState
} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import {getEndOfDay, getStartOfDay} from '../../../utils/getDateString'
import {IBasicFilterDropdownValues} from '../../basicFilterDropdown/constants'
import BasicSelectDropdown, {
  IBasicSelectDropdownOption
} from '../../basicSelectDropdown'
import FormDateFilterDropwdown from '../../FormDateFilterDropwdown'
import Spinner from '../../spinner/spinner'
import {SKIPPED_RUN, WORKFLOW_DIALOG} from '../allWorkflows/constant'
import NoResultsFound from '../noResultsFound'
import WorkflowListItemMenu from '../workflowListItemMenu'
import WorkflowRepairBar from '../workflowRepairBar'
import WorkflowTasks from '../workflowTasks'
import {Data, getColumnComfig} from './columnConfig'
import {WORKFLOW_ACTIONS} from './constants'
import styles from './indexJSS'
import {getParsedWorkflowRunsData} from './utils'

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  workflowRuns: IWorkflowsDetailsState['workflowRuns']
  getWorkflowRuns: (
    payload: GetWorkflowRunsInput,
    oldData?: IWorkflowsDetailsState['workflowRuns']['data']
  ) => void
  getWorkflowRunDetailsFunc: (payload: GetWorkflowRunDetailsInput) => void
  resetWorkflowRunDetailsFunc: () => any
  workflowRunDetails: IWorkflowsDetailsState['workflowRunDetails']
  onWorkflowRunSelected: () => void
  onWorkflowRunDeselected: () => void
  setSidePanel: (payload: string) => void
  setDialogConfig: (dialogConfig: ICommonState['dialogConfig']) => void
  stopWorkflowRun: (
    payload: StopWorkflowRunInput,
    data: SelectionOnGetWorkflowRuns
  ) => void
  runId: string
  taskIdOfRun: string
  runsStartDate: string
  runsEndDate: string
  statusFilterValues: IBasicFilterDropdownValues
}

const workflowWeekOptions = [
  {label: '1 Week', value: '1'},
  {label: '2 Weeks', value: '2'},
  {label: '3 Weeks', value: '3'}
]

const PAGE_SIZE = 10
const ZERO_OFFSET = 0
const SORT_BY = 'createdAt'
const SORT_ORDER = 'desc'

const WorfklowRuns = (props: IProps) => {
  const {
    classes,
    workflowRuns,
    getWorkflowRuns,
    workflowDetails,
    getWorkflowRunDetailsFunc,
    resetWorkflowRunDetailsFunc,
    workflowRunDetails,
    onWorkflowRunSelected,
    onWorkflowRunDeselected,
    setSidePanel,
    setDialogConfig,
    stopWorkflowRun,
    runId,
    taskIdOfRun,
    runsEndDate,
    runsStartDate,
    statusFilterValues
  } = props
  const history = useHistory()
  const [offset, setOffset] = useState(0)

  const [anchorElForMenu, setAnchorElForMenu] = useState<SVGSVGElement | null>(
    null
  )

  const [openedMenuWorkflowRun, setOpenedMenuWorkflowRun] =
    useState<Data | null>(null)

  const [openRepairRun, setOpenRepairRun] = useState(false)

  const menuItems = [
    {
      actionIcon: <StopIcon className={classes.actionIcon} />,
      actionName: WORKFLOW_ACTIONS.STOP_RUN,
      disabled: openedMenuWorkflowRun?.status !== WORKFLOW_STANDARDS_RUNNING
    }
  ]

  const handleMenuClick = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
    workflowRun: Data
  ): void => {
    event.stopPropagation()
    setOpenedMenuWorkflowRun(workflowRun)
    setAnchorElForMenu(event.currentTarget)
  }

  const columnConfig = React.useMemo(
    () =>
      getColumnComfig(
        classes,
        handleMenuClick,
        workflowDetails?.data?.workflow_id
      ),
    [workflowDetails?.data?.workflow_id]
  )

  const parsedWorkflowRunsData = React.useMemo(
    () => getParsedWorkflowRunsData(workflowRuns?.data?.data?.runs || []),
    [workflowRuns]
  )

  const onWorkflowRunBackClicked = () => {
    resetWorkflowRunDetailsFunc()
    onWorkflowRunDeselected()
    history.replace(`/workflows/${workflowDetails?.data?.workflow_id}/runs`)
    getWorkflowRuns({
      workflowId: workflowDetails.data.workflow_id,
      startDate: getStartOfDay(runsStartDate) || '',
      endDate: getEndOfDay(runsEndDate) || '',
      filters: getActiveFilters(),
      offset: ZERO_OFFSET,
      pageSize: PAGE_SIZE,
      sortBy: SORT_BY,
      sortOrder: SORT_ORDER,
      tags: []
    })
  }

  const onWorkflowRunClicked = (row: Data) => {
    if (row?.runId && row?.status !== SKIPPED_RUN) {
      const link = encodeURI(
        `/workflows/${workflowDetails?.data?.workflow_id}/runs/${row.runId}/tasks`
      )

      history.replace(link)
    }
  }

  const onViewDetailsClicked = (runId: string) => {
    const link = encodeURI(
      `/workflows/${workflowDetails?.data?.workflow_id}/runs/${runId}/tasks`
    )

    history.replace(link)
  }

  useEffect(() => {
    if (runId && workflowDetails?.data?.workflow_id) {
      onWorkflowRunSelected()
      getWorkflowRunDetailsFunc({
        workflowId: workflowDetails.data.workflow_id,
        runId: runId
      })
    }
  }, [workflowDetails, runId])

  const getActiveFilters = () => {
    const activeFilters = []
    Object.keys(statusFilterValues).forEach((key) => {
      if (statusFilterValues[key]) {
        activeFilters.push(key)
      }
    })
    return activeFilters
  }

  useEffect(() => {
    if (
      workflowDetails.status === API_STATUS.SUCCESS &&
      workflowDetails.data?.workflow_id
    ) {
      setOffset(ZERO_OFFSET)
      getWorkflowRuns({
        workflowId: workflowDetails.data.workflow_id,
        startDate: getStartOfDay(runsStartDate) || '',
        endDate: getEndOfDay(runsEndDate) || '',
        filters: getActiveFilters(),
        offset: ZERO_OFFSET,
        pageSize: PAGE_SIZE,
        sortBy: SORT_BY,
        sortOrder: SORT_ORDER,
        tags: []
      })
    }
  }, [workflowDetails.status, runsStartDate, runsEndDate, statusFilterValues])

  useEffect(() => {
    if (offset === ZERO_OFFSET) return
    if (
      workflowDetails.status === API_STATUS.SUCCESS &&
      workflowDetails.data?.workflow_id
    ) {
      getWorkflowRuns(
        {
          workflowId: workflowDetails.data.workflow_id,
          filters: getActiveFilters(),
          startDate: getStartOfDay(runsStartDate) || '',
          endDate: getEndOfDay(runsEndDate) || '',
          offset,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortOrder: SORT_ORDER,
          tags: []
        },
        workflowRuns.data
      )
    }
  }, [offset])

  useEffect(() => {
    return () => resetWorkflowRunDetailsFunc()
  }, [])

  const handleMenuClose = () => {
    setAnchorElForMenu(null)
    setOpenedMenuWorkflowRun(null)
  }

  const onStopWorkflowRun = () => {
    if (openedMenuWorkflowRun?.runId) {
      stopWorkflowRun(
        {
          workflowId: workflowDetails.data.workflow_id,
          runId: openedMenuWorkflowRun.runId
        },
        workflowRuns.data
      )
    }
    onDialogClosed()
  }

  const onSecondaryBtnClicked = () => {
    onDialogClosed()
  }

  const onDialogClosed = () => {
    setDialogConfig(defaultDialogConfig)
  }

  const handleMenuItemClicked = (actionName: string) => {
    if (actionName === WORKFLOW_ACTIONS.STOP_RUN) {
      setDialogConfig({
        title: WORKFLOW_DIALOG.STOP_RUN.title,
        open: true,
        message: WORKFLOW_DIALOG.STOP_RUN.message,
        primaryBtnText: WORKFLOW_DIALOG.STOP_RUN.primaryBtnText,
        secondaryBtnText: WORKFLOW_DIALOG.STOP_RUN.secondaryBtnText,
        onClose: onDialogClosed,
        onPrimaryBtnClicked: onStopWorkflowRun,
        onSecondaryBtnClicked: onSecondaryBtnClicked
      })
    }
    handleMenuClose()
  }

  const getRepairRunBar = () => {
    if (
      workflowRuns.data?.data?.repair_run &&
      workflowRuns.data?.data?.repair_run?.status === 'failed'
    ) {
      return (
        <WorkflowRepairBar
          runId={workflowRuns.data?.data?.repair_run?.run_id}
          buttonText='See Details'
          text='Repair your latest failed run '
          onButtonClick={onViewDetailsClicked}
        />
      )
    } else if (
      workflowRuns.data?.data?.repair_run &&
      workflowRuns.data?.data?.repair_run?.status === 'repairing'
    ) {
      return (
        <WorkflowRepairBar
          runId={workflowRuns.data?.data?.repair_run?.run_id}
          buttonText='See Details'
          text='Repairing your latest failed run'
          onButtonClick={onViewDetailsClicked}
        />
      )
    }
  }

  useEffect(() => {
    if (workflowRunDetails?.status === API_STATUS.LOADING) {
      setSidePanel(SIDE_PANELS.workflowRunDetails)
    }
  }, [workflowRunDetails])

  return (
    <div className={classes.container} data-testid='workflow-details-runs-tab'>
      {!runId ? (
        <>
          {!workflowRuns.data ? (
            <></>
          ) : (
            workflowRuns.data?.data?.repair_run && getRepairRunBar()
          )}
          <div className={classes.section}>
            <Datatable<Data>
              enableStickyHeader={true}
              enableSelection={true}
              singleSelection={true}
              size={TableCellSize.Large}
              columnConfig={columnConfig}
              data={parsedWorkflowRunsData}
              indexKeyName={'runId'}
              enableSelectionColumn={false}
              onRowClick={onWorkflowRunClicked}
              data-testid='workflow-details-runs-table'
              loading={
                offset === ZERO_OFFSET &&
                workflowRuns.status === API_STATUS.LOADING
              }
              enableInfiniteScroll={true}
              onScrollToPageEnd={() => {
                if (
                  workflowRuns.status !== API_STATUS.LOADING &&
                  workflowRuns.data?.result_size >= offset + PAGE_SIZE
                ) {
                  setOffset(offset + PAGE_SIZE)
                }
              }}
              loadingNextPageItems={
                offset !== ZERO_OFFSET &&
                workflowRuns?.status === API_STATUS.LOADING
              }
              totalRow={workflowRuns.data?.result_size}
            />
            {workflowRuns?.status === API_STATUS.SUCCESS &&
              workflowRuns?.data?.data?.runs.length === 0 && (
                <div data-testid='workflow-details-no-runs-message'>
                  <NoResultsFound message='No Runs Found!' />
                </div>
              )}
          </div>
          <WorkflowListItemMenu
            anchorEl={anchorElForMenu}
            open={Boolean(anchorElForMenu)}
            handleClick={handleMenuItemClicked}
            handleClose={handleMenuClose}
            menuItems={menuItems}
          />
        </>
      ) : (
        <div>
          <div
            className={classes.runDetailsHeading}
            onClick={onWorkflowRunBackClicked}
          >
            <span>
              <ArrowBackIosIcon sx={{width: '16px', height: '16px'}} />
            </span>{' '}
            RUN #{workflowRunDetails.data?.run_id}
          </div>
          {workflowRunDetails?.data?.repair_run &&
            workflowRunDetails.data?.repair_run?.status === 'failed' && (
              <div className={classes.workflowRunRepairBar}>
                <WorkflowRepairBar
                  runId={workflowRunDetails.data?.run_id}
                  buttonText='Repair'
                  text='Repair your latest failed run '
                  onButtonClick={() => setOpenRepairRun(true)}
                />
              </div>
            )}
          <div className={classes.runDetailsContainer}>
            <Spinner
              size={40}
              show={workflowRunDetails.status === API_STATUS.LOADING}
            />
            {workflowRunDetails.status === API_STATUS.SUCCESS && (
              <WorkflowTasks
                setSidePanel={setSidePanel}
                taskIdOfRun={taskIdOfRun}
                openRepairRun={openRepairRun}
                setOpenRepairRun={setOpenRepairRun}
                repairRun={workflowRunDetails.data?.repair_run}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({
  workflowDetails: state.workflowDetailsReducer.workflowDetails,
  workflowRuns: state.workflowDetailsReducer.workflowRuns,
  workflowRunDetails: state.workflowDetailsReducer.workflowRunDetails
})

const mapDispatchToProps = (dispatch) => {
  return {
    getWorkflowRuns: (
      payload: GetWorkflowRunsInput,
      oldData?: IWorkflowsDetailsState['workflowRuns']['data']
    ) => getWorkflowRuns(dispatch, payload, oldData),
    getWorkflowRunDetailsFunc: (payload: GetWorkflowRunDetailsInput) =>
      getWorkflowRunDetails(dispatch, payload),
    resetWorkflowRunDetailsFunc: () => dispatch(resetWorkflowRunDetails()),
    setDialogConfig: (dialogConfig: ICommonState['dialogConfig']) =>
      dispatch(setDialogConfig(dialogConfig)),
    stopWorkflowRun: (
      payload: StopWorkflowRunInput,
      data: SelectionOnGetWorkflowRuns
    ) => stopWorkflowRun(dispatch, payload, data)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorfklowRuns)

export default StyleComponent
