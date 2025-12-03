import CreateIcon from '@mui/icons-material/Create'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import {Box, ClickAwayListener} from '@mui/material'
import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useMemo, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import {Datatable} from '../../../bit-components/datatable/index'
import {
  Popout,
  PopoutHorizontalPositions,
  PopoutVerticalPositions
} from '../../../bit-components/popout/index'
import {TableCellSize} from '../../../bit-components/table-cells/tc-cell'
import {routes} from '../../../constants'
import {getWorkflowFilters} from '../../../modules/workflows/graphqlAPIs/getWorkflowFilters/index.thunk'
import {
  GetWorkflows,
  GetWorkflowsInput,
  SelectionOnGetWorkflows
} from '../../../modules/workflows/graphqlAPIs/getWorkflows'
import {getWorkflows} from '../../../modules/workflows/graphqlAPIs/getWorkflows/index.thunk'
import {IWorkflowsState} from '../../../modules/workflows/pages/workflows/reducer'
import {
  CommonState,
  defaultDialogConfig,
  ICommonState
} from '../../../reducers/commonReducer'
import {API_STATUS} from '../../../utils/apiUtils'
import debounce from '../../../utils/debounce'
import {
  IFeatureGroupFilters,
  IFeatureGroupFiltersValues
} from '../../featureStore/featureGroupsHeader'
import FilterDrop from '../../filterDrop'
import useQuery, {WorkflowsQueryParams} from '../../useQuery'
import NoResultsFound from '../noResultsFound'
import WorkflowListItemMenu from '../workflowListItemMenu'
import {Data, getColumnComfig, getPopoutOptions} from './columnConfig'
import {
  PAGE_SIZE,
  WORKFLOW_ACTIONS,
  WORKFLOW_DIALOG,
  ZERO_OFFSET
} from './constant'
import {getParsedWorkflowsData} from './utils'

import {setDialogConfig} from '../../../actions/commonActions'
import {
  LoaderSize,
  ProgressCircle
} from '../../../bit-components/progress-circle/index'
import {DeleteWorkflowInput} from '../../../modules/workflows/graphqlAPIs/deleteWorkflow'
import {deleteWorkflow} from '../../../modules/workflows/graphqlAPIs/deleteWorkflow/index.thunk'
import {PauseWorkflowScheduleInput} from '../../../modules/workflows/graphqlAPIs/pauseWorkflowSchedule'
import {pauseWorkflowSchedule} from '../../../modules/workflows/graphqlAPIs/pauseWorkflowSchedule/index.thunk'
import {ResumeWorkflowScheduleInput} from '../../../modules/workflows/graphqlAPIs/resumeWorkflowSchedule'
import {resumeWorkflowSchedule} from '../../../modules/workflows/graphqlAPIs/resumeWorkflowSchedule/index.thunk'
import {RunWorkflowRunInput} from '../../../modules/workflows/graphqlAPIs/runWorkflowRun'
import {runWorkflowRun} from '../../../modules/workflows/graphqlAPIs/runWorkflowRun/index.thunk'
import {resetDeleteWorkflow} from '../../../modules/workflows/pages/workflows/actions'
import {
  WORKFLOW_STANDARDS_ACTIVE,
  WORKFLOW_STANDARDS_INACTIVE
} from '../../../modules/workflows/pages/workflows/constants'
import styles from './indexJSS'
interface IProps extends WithStyles<typeof styles> {
  workflows: IWorkflowsState['workflows']
  filters: IWorkflowsState['filters']
  deleteWorkflowRes: IWorkflowsState['deleteWorkflow']
  resetDeleteWorkflow: () => void
  getWorkflows: (
    payload: GetWorkflowsInput,
    oldData?: GetWorkflows['getWorkflows']
  ) => void
  getWorkflowFilters: () => void
  setDialogConfig: (dialogConfig: ICommonState['dialogConfig']) => void
  runWorkflowRun: (
    payload: RunWorkflowRunInput,
    data: SelectionOnGetWorkflows
  ) => void
  deleteWorkflow: (
    payload: RunWorkflowRunInput,
    data: SelectionOnGetWorkflows
  ) => void
  pauseWorkflowSchedule: (
    payload: PauseWorkflowScheduleInput,
    data: SelectionOnGetWorkflows
  ) => void
  resumeWorkflowSchedule: (
    payload: ResumeWorkflowScheduleInput,
    data: SelectionOnGetWorkflows
  ) => void
}

const AllWorkflows = (props: IProps) => {
  const {
    classes,
    workflows,
    getWorkflows,
    getWorkflowFilters,
    filters: workflowFilters,
    setDialogConfig,
    runWorkflowRun,
    deleteWorkflow,
    deleteWorkflowRes,
    pauseWorkflowSchedule,
    resumeWorkflowSchedule,
    resetDeleteWorkflow
  } = props
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [anchorElForPopout, setAnchorElForPopout] =
    useState<HTMLButtonElement | null>(null)
  const [anchorElForMenu, setAnchorElForMenu] = useState<SVGSVGElement | null>(
    null
  )
  const [openedMenuWorkflow, setOpenedMenuWorkflow] = useState<Data | null>(
    null
  )
  const [offset, setOffset] = useState(0)
  const [deleteOffset, setDeleteOffset] = useState(0)
  const sortBy = 'created_at'
  const sortOrder = 'desc'
  const history = useHistory()
  const query = useQuery()
  const searchQuery = query.get(WorkflowsQueryParams.QUERY) || ''
  const filtersQuery = query.get(WorkflowsQueryParams.FILTERS)
  const parsedFiltersQuery = JSON.parse(filtersQuery)
  const [filters, setFilters] = useState<IFeatureGroupFilters[]>([])

  const getWorkflowsDebounced = useMemo(() => debounce(getWorkflows), [])

  const getMenuItems = (workflow: Data) => {
    if (workflow?.status === WORKFLOW_STANDARDS_ACTIVE) {
      return [
        {
          actionIcon: <PlayArrowIcon className={classes.actionIcon} />,
          actionName: WORKFLOW_ACTIONS.RUN_NOW
        },
        {
          actionIcon: <DeleteOutlineIcon className={classes.actionIcon} />,
          actionName: WORKFLOW_ACTIONS.DELETE
        },
        {
          actionIcon: <PauseIcon className={classes.actionIcon} />,
          actionName: WORKFLOW_ACTIONS.PAUSE_SCHEDULE
        },
        {
          actionIcon: <CreateIcon className={classes.actionIcon} />,
          actionName: WORKFLOW_ACTIONS.EDIT_WORKFLOW
        }
      ]
    } else if (workflow?.status === WORKFLOW_STANDARDS_INACTIVE) {
      return [
        {
          actionIcon: <DeleteOutlineIcon className={classes.actionIcon} />,
          actionName: WORKFLOW_ACTIONS.DELETE
        },
        {
          actionIcon: <ReplayIcon className={classes.actionIcon} />,
          actionName: WORKFLOW_ACTIONS.RESTART_SCHEDULE
        },
        {
          actionIcon: <CreateIcon className={classes.actionIcon} />,
          actionName: WORKFLOW_ACTIONS.EDIT_WORKFLOW
        }
      ]
    }
    return []
  }

  const parsedWorkflowsData = workflows?.data?.data
    ? getParsedWorkflowsData(workflows?.data?.data)
    : []

  const handleShowMoreTagsClicked = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: Data
  ) => {
    setAnchorElForPopout(e.currentTarget)
    setSelectedRow(item)
    e.stopPropagation()
  }

  const handleShowMoreTagsClosed = (e: any) => {
    setAnchorElForPopout(null)
    setSelectedRow(null)
    e.stopPropagation()
    e.preventDefault()
  }

  const handleMenuClick = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
    workflow: Data
  ): void => {
    event.stopPropagation()
    setOpenedMenuWorkflow(workflow)
    setAnchorElForMenu(event.currentTarget)
  }

  const columnConfig = getColumnComfig(
    classes,
    handleShowMoreTagsClicked,
    handleMenuClick
  )

  const getFilterValues = (type: string) => {
    if (parsedFiltersQuery && type in parsedFiltersQuery) {
      return parsedFiltersQuery[type]
    }
    return []
  }

  const getFilterValuesForQuery = (type: string) => {
    const filterType = filters.find((f) => f.name === type)
    return Object.keys(filterType?.values || []).filter(
      (f) => filterType?.values[f]
    )
  }

  useEffect(() => {
    if (deleteWorkflowRes?.status === API_STATUS.SUCCESS) {
      setDeleteOffset(deleteOffset - 1)
    }
  }, [deleteWorkflowRes?.status])

  useEffect(() => {
    if (workflows?.cancel) workflows.cancel()
    setOffset(0)
    const payload: GetWorkflowsInput = {
      query: searchQuery,
      filters: {
        user: getFilterValues('users'),
        status: getFilterValues('status')
      },
      pageSize: PAGE_SIZE,
      offset: 0,
      sortBy: sortBy,
      sortOrder: sortOrder
    }
    getWorkflowsDebounced(payload)
    setOffset(0)
  }, [searchQuery, filtersQuery])

  useEffect(() => {
    if (offset === ZERO_OFFSET) return

    if (workflows?.cancel) workflows.cancel()

    const payload: GetWorkflowsInput = {
      query: searchQuery,
      filters: {
        user: getFilterValues('users'),
        status: getFilterValues('status')
      },
      pageSize: PAGE_SIZE,
      offset: offset,
      sortBy: sortBy,
      sortOrder: sortOrder
    }
    getWorkflows(payload, workflows.data)
  }, [offset])

  useEffect(() => {
    getWorkflowFilters()

    return () => {
      resetDeleteWorkflow()
    }
  }, [])

  const getFilterValueFromFilterQuery = (filterName, filterKey) => {
    if (parsedFiltersQuery && filterName in parsedFiltersQuery) {
      return parsedFiltersQuery[filterName].includes(filterKey)
    }
    return false
  }

  useEffect(() => {
    if (workflowFilters.status === API_STATUS.SUCCESS) {
      const defaultFilters: IFeatureGroupFilters[] = Object.keys(
        workflowFilters.data
      ).map((filter) => ({
        name: filter,
        values: workflowFilters.data[filter].reduce(
          (acc, v, vi) =>
            Object.assign(acc, {
              [v]: getFilterValueFromFilterQuery(filter, v)
            }),
          {}
        )
      }))
      setFilters(defaultFilters)
    }
  }, [workflowFilters.status, filtersQuery])

  const onWorkflowClicked = (row: Data) => {
    if (row && row.id) history.push(`/workflows/${row.id}/runs`)
  }

  const selectFilters = (fIdx: number, fValues: IFeatureGroupFiltersValues) => {
    const newFilters = [...filters]
    newFilters[fIdx].values = fValues
    setFilters(newFilters)

    const newFiltersQuery = {
      users: getFilterValuesForQuery('users'),
      status: getFilterValuesForQuery('status')
    }
    history.replace({
      pathname: routes.workflows,
      search: `?${WorkflowsQueryParams.QUERY}=${encodeURIComponent(
        searchQuery
      )}&${WorkflowsQueryParams.FILTERS}=${encodeURIComponent(
        JSON.stringify(newFiltersQuery)
      )}`
    })
  }

  const onDialogClosed = () => {
    setDialogConfig(defaultDialogConfig)
  }

  const onRunWorkflow = () => {
    runWorkflowRun(
      {
        workflowId: openedMenuWorkflow?.id
      },
      workflows.data
    )
    onDialogClosed()
  }

  const onDeleteWorkflow = () => {
    deleteWorkflow(
      {
        workflowId: openedMenuWorkflow?.id
      },
      workflows.data
    )
    onDialogClosed()
  }

  const onPauseWorkflowSchedule = () => {
    pauseWorkflowSchedule(
      {
        workflowId: openedMenuWorkflow?.id
      },
      workflows.data
    )
    onDialogClosed()
  }

  const onResumeWorkflowSchedule = () => {
    resumeWorkflowSchedule(
      {
        workflowId: openedMenuWorkflow?.id
      },
      workflows.data
    )
    onDialogClosed()
  }

  const onSecondaryBtnClicked = () => {
    onDialogClosed()
  }

  const handleMenuItemClicked = (actionName: string) => {
    if (actionName === WORKFLOW_ACTIONS.RUN_NOW) {
      setDialogConfig({
        title: WORKFLOW_DIALOG.RUN_NOW.title,
        open: true,
        message: WORKFLOW_DIALOG.RUN_NOW.message,
        primaryBtnText: WORKFLOW_DIALOG.RUN_NOW.primaryBtnText,
        secondaryBtnText: WORKFLOW_DIALOG.RUN_NOW.secondaryBtnText,
        onClose: onDialogClosed,
        onPrimaryBtnClicked: onRunWorkflow,
        onSecondaryBtnClicked: onSecondaryBtnClicked
      })
    } else if (actionName === WORKFLOW_ACTIONS.PAUSE_SCHEDULE) {
      setDialogConfig({
        title: WORKFLOW_DIALOG.PAUSE_SCHEDULE.title,
        open: true,
        message: WORKFLOW_DIALOG.PAUSE_SCHEDULE.message,
        primaryBtnText: WORKFLOW_DIALOG.PAUSE_SCHEDULE.primaryBtnText,
        secondaryBtnText: WORKFLOW_DIALOG.PAUSE_SCHEDULE.secondaryBtnText,
        onClose: onDialogClosed,
        onPrimaryBtnClicked: onPauseWorkflowSchedule,
        onSecondaryBtnClicked: onSecondaryBtnClicked
      })
    } else if (actionName === WORKFLOW_ACTIONS.RESTART_SCHEDULE) {
      setDialogConfig({
        title: WORKFLOW_DIALOG.RESTART_SCHEDULE.title,
        open: true,
        message: WORKFLOW_DIALOG.RESTART_SCHEDULE.message,
        primaryBtnText: WORKFLOW_DIALOG.RESTART_SCHEDULE.primaryBtnText,
        secondaryBtnText: WORKFLOW_DIALOG.RESTART_SCHEDULE.secondaryBtnText,
        onClose: onDialogClosed,
        onPrimaryBtnClicked: onResumeWorkflowSchedule,
        onSecondaryBtnClicked: onSecondaryBtnClicked
      })
    } else if (actionName === WORKFLOW_ACTIONS.DELETE) {
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
    } else if (actionName === WORKFLOW_ACTIONS.EDIT_WORKFLOW) {
      history.push(`/workflows/${openedMenuWorkflow?.id}/edit`)
    }

    handleMenuClose()
  }

  const handleMenuClose = () => {
    setAnchorElForMenu(null)
    setOpenedMenuWorkflow(null)
  }

  return (
    <>
      <div className={classes.container}>
        <div className={classes.heading}>
          <div className={classes.left}>
            <div className={classes.title}>All Workflows</div>
            <div className={classes.total} data-testid='total-workflows-count'>
              {workflows?.data?.result_size || 0}
            </div>
          </div>
          <div className={classes.right}>
            <div className={classes.filterByText}>Filter By:</div>
            <div className={classes.filterContainer}>
              {filters.map((filter, fIdx) => (
                <Box key={filter.name} sx={{marginLeft: '8px'}}>
                  <FilterDrop
                    selectFilters={(f) => selectFilters(fIdx, f)}
                    data={filter as unknown as IFeatureGroupFilters}
                    capitalizeFirstLetter={filter.name === 'status'}
                    dataTestId='workflows-filter'
                  />
                </Box>
              ))}
            </div>
          </div>
        </div>
        <div className={classes.dataList}>
          <Datatable<Data>
            enablePagination={false}
            enableSelection={true}
            singleSelection={true}
            size={TableCellSize.Large}
            columnConfig={columnConfig}
            data={parsedWorkflowsData}
            indexKeyName={'id'}
            onSelectAllClick={() => {}}
            enableSelectionColumn={false}
            onRowClick={onWorkflowClicked}
            loading={
              offset === ZERO_OFFSET && workflows?.status === API_STATUS.LOADING
            }
            enableInfiniteScroll={true}
            onScrollToPageEnd={() => {
              if (workflows?.status !== API_STATUS.LOADING) {
                if (
                  offset + deleteOffset + PAGE_SIZE <=
                  workflows?.data?.result_size
                ) {
                  setOffset(offset + deleteOffset + PAGE_SIZE)
                  setDeleteOffset(0)
                }
              }
            }}
            loadingNextPageItems={
              offset !== ZERO_OFFSET && workflows?.status === API_STATUS.LOADING
            }
            totalRow={workflows?.data?.result_size || 0}
          />
          {workflows?.status === API_STATUS.SUCCESS &&
            workflows?.data?.data?.length === 0 && <NoResultsFound />}
          {workflows?.status === API_STATUS.LOADING && (
            <div className={classes.loaderContainer}>
              <ProgressCircle
                size={LoaderSize.Large}
                data-testid='workflows-scroll-loading'
              />
            </div>
          )}
        </div>
      </div>

      <WorkflowListItemMenu
        anchorEl={anchorElForMenu}
        open={Boolean(anchorElForMenu)}
        handleClick={handleMenuItemClicked}
        handleClose={handleMenuClose}
        menuItems={getMenuItems(openedMenuWorkflow)}
      />

      <ClickAwayListener
        onClickAway={(ev) => {
          if (anchorElForPopout) handleShowMoreTagsClosed(ev)
        }}
      >
        <Popout
          anchorEl={anchorElForPopout}
          optionsList={getPopoutOptions(selectedRow?.tags || [])}
          handleClose={(ev) => {
            handleShowMoreTagsClosed(ev)
            ev.stopPropagation()
            ev.preventDefault()
          }}
          anchorOrigin={{
            vertical: PopoutVerticalPositions.BOTTOM,
            horizontal: PopoutHorizontalPositions.LEFT
          }}
          transformOrigin={{
            vertical: PopoutVerticalPositions.TOP,
            horizontal: PopoutHorizontalPositions.LEFT
          }}
        />
      </ClickAwayListener>
    </>
  )
}

const mapStateToProps = (state: CommonState) => ({
  workflows: state.workflowsReducer.workflows,
  filters: state.workflowsReducer.filters,
  deleteWorkflowRes: state.workflowsReducer.deleteWorkflow
})

const mapDispatchToProps = (dispatch) => {
  return {
    getWorkflows: (
      payload: GetWorkflowsInput,
      oldData: GetWorkflows['getWorkflows'] = null
    ) => getWorkflows(dispatch, payload, false, oldData),
    getWorkflowFilters: () => getWorkflowFilters(dispatch),
    setDialogConfig: (dialogConfig: ICommonState['dialogConfig']) =>
      dispatch(setDialogConfig(dialogConfig)),
    runWorkflowRun: (
      payload: RunWorkflowRunInput,
      data: SelectionOnGetWorkflows
    ) => runWorkflowRun(dispatch, payload, data),
    deleteWorkflow: (
      payload: DeleteWorkflowInput,
      data: SelectionOnGetWorkflows
    ) => deleteWorkflow(dispatch, payload, data),
    resetDeleteWorkflow: () => dispatch(resetDeleteWorkflow()),
    pauseWorkflowSchedule: (
      payload: PauseWorkflowScheduleInput,
      data: SelectionOnGetWorkflows
    ) => pauseWorkflowSchedule(dispatch, payload, data),
    resumeWorkflowSchedule: (
      payload: ResumeWorkflowScheduleInput,
      data: SelectionOnGetWorkflows
    ) => resumeWorkflowSchedule(dispatch, payload, data)
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(AllWorkflows)

export default StyleComponent
