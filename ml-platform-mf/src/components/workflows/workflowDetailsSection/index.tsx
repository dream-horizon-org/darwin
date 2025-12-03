import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'

import {connect} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {compose} from 'redux'
import {SIDE_PANELS} from '../../../modules/workflows/pages/workflowDetails/constants'
import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {CommonState} from '../../../reducers/commonReducer'
import {IBasicFilterDropdownValues} from '../../basicFilterDropdown/constants'
import FilterDrop from '../../filterDrop'
import FormDateFilterDropwdown from '../../FormDateFilterDropwdown'
import TaskDetails from '../taskDetails'
import WorkflowDetailsClosedSidePanel from '../workflowDetailsClosedSidePanel'
import WorkflowDetailsSidePanel from '../workflowDetailsSidePanel'
import WorkflowDetailsTabs from '../workflowDetailsTabs'
import WorkflowRunDetailsSidePanel from '../workflowRunDetailsSidePanel'
import WorkflowTasks from '../workflowTasks'
import WorfklowRuns from '../workfowRuns'
import styles from './indexJSS'

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  workflowRunDetails: IWorkflowsDetailsState['workflowRunDetails']
  tabs: string[]
  activeTab: number
  taskIdOfRun: string
  runId: string
  taskIdWithoutRun: string
}

const WorkflowDetailsSection = (props: IProps) => {
  const {
    classes,
    workflowDetails,
    workflowRunDetails,
    tabs,
    activeTab,
    taskIdOfRun,
    runId,
    taskIdWithoutRun
  } = props
  const history = useHistory()
  const [sidepanel, setSidePanel] = useState(SIDE_PANELS.workflowDetails)
  const [showSideapnel, setShowSidePanel] = useState(true)
  const [runsStartDate, setRunsStartDate] = useState(null)
  const [runsEndDate, setRunsEndDate] = useState(null)
  const [removeFilterTabs, setRemoveFilterTabs] = useState(false)
  const [statusFilterValues, setStatusFilterValues] =
    React.useState<IBasicFilterDropdownValues>({
      running: false,
      failed: false,
      success: false,
      skipped: false
    })

  const onWorkflowRunSelected = () => {
    setSidePanel(SIDE_PANELS.workflowRunDetails)
    setRemoveFilterTabs(true)
  }

  const onWorkflowRunDeselected = () => {
    setSidePanel(SIDE_PANELS.workflowDetails)
    setRemoveFilterTabs(false)
  }

  return (
    <div className={classes.container}>
      <div
        className={classes.header}
        style={{flex: showSideapnel ? '0 0 75%' : '1'}}
      >
        {!removeFilterTabs && (
          <div className={classes.filterTabs}>
            <WorkflowDetailsTabs
              tabs={tabs}
              activeTab={activeTab}
              workflowId={workflowDetails?.data?.workflow_id}
            />
            <div className={classes.filterDropdown}>
              <div className={classes.dateFilter}>
                <FormDateFilterDropwdown
                  setSelectedDateRange={(dateRange) => {
                    setRunsStartDate(dateRange.startDate)
                    setRunsEndDate(dateRange.endDate)
                  }}
                  dateRange={{
                    startDate: runsStartDate,
                    endDate: runsEndDate
                  }}
                  disabled={false}
                  onReset={() => {
                    setRunsStartDate(null)
                    setRunsEndDate(null)
                  }}
                />
              </div>
              <div className={classes.filterByTitle}>Filter By : </div>
              <div className={classes.filterByDropdown}>
                <FilterDrop
                  data={{
                    name: 'Status',
                    values: statusFilterValues
                  }}
                  selectFilters={(f: IBasicFilterDropdownValues) => {
                    setStatusFilterValues(f)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className={classes.mainContent}>
          {tabs[activeTab] === 'Runs' && (
            <WorfklowRuns
              runsStartDate={runsStartDate}
              runsEndDate={runsEndDate}
              statusFilterValues={statusFilterValues}
              onWorkflowRunSelected={onWorkflowRunSelected}
              onWorkflowRunDeselected={onWorkflowRunDeselected}
              setSidePanel={setSidePanel}
              taskIdOfRun={taskIdOfRun}
              runId={runId}
            />
          )}
          {tabs[activeTab] === 'Tasks' && (
            <WorkflowTasks
              activeTab={tabs[activeTab]}
              setSidePanel={setSidePanel}
              taskIdOfRun={taskIdOfRun}
              taskIdWithoutRun={taskIdWithoutRun}
            />
          )}
        </div>
      </div>
      {showSideapnel && sidepanel === SIDE_PANELS.workflowDetails && (
        <WorkflowDetailsSidePanel
          setShowSidePanel={setShowSidePanel}
          workflowDetails={workflowDetails}
        />
      )}
      {showSideapnel && sidepanel === SIDE_PANELS.workflowRunDetails && (
        <WorkflowRunDetailsSidePanel
          setShowSidePanel={setShowSidePanel}
          workflowRunDetails={workflowRunDetails}
        />
      )}
      {showSideapnel && sidepanel === SIDE_PANELS.workflowTaskDetails && (
        <TaskDetails setShowSidePanel={setShowSidePanel} />
      )}
      {!showSideapnel && (
        <WorkflowDetailsClosedSidePanel setShowSidePanel={setShowSidePanel} />
      )}
    </div>
  )
}

const mapStateToProps = (state: CommonState) => ({})

const mapDispatchToProps = (dispatch) => {
  return {}
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorkflowDetailsSection)

export default StyleComponent
