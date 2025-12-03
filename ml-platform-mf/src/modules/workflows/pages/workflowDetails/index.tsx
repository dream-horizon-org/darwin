import {withStyles, WithStyles} from '@mui/styles'
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {useHistory} from 'react-router'
import {compose} from 'redux'
import {setShowGlobalSpinner} from '../../../../actions/commonActions'
import WorkflowDetailsHeader from '../../../../components/workflows/workflowDetailsHeader'
import WorkflowDetailsSection from '../../../../components/workflows/workflowDetailsSection'
import {CommonState} from '../../../../reducers/commonReducer'
import {EventTypes, SeverityTypes} from '../../../../types/events.types'
import {API_STATUS} from '../../../../utils/apiUtils'
import {logEvent} from '../../../../utils/events'
import {GetWorkflowDetailsInput} from '../../graphqlAPIs/getWorkflowDetails'
import {getWorkflowDetails} from '../../graphqlAPIs/getWorkflowDetails/index.thunk'
import {
  resetWorkflowDetails,
  resetWorkflowRuns,
  resetWorkflowTaskDetailsWithoutRun
} from './actions'
import styles from './indexJSS'
import {IWorkflowsDetailsState} from './reducer'

interface IProps extends WithStyles<typeof styles> {
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
  workflowRuns: IWorkflowsDetailsState['workflowRuns']
  getWorkflowDetails: (payload: GetWorkflowDetailsInput) => void
  workflowRunDetails: IWorkflowsDetailsState['workflowRunDetails']
  setShowGlobalSpinner: (payload: boolean) => void
  resetWorkflowRunsFunc: () => void
  resetWorkflowDetailsFunc: () => void
  resetWorkflowTaskDetailsWithoutRunFunc: () => void
}

const WorkflowDetails = (props: IProps) => {
  const {
    classes,
    workflowDetails,
    getWorkflowDetails,
    workflowRunDetails,
    setShowGlobalSpinner,
    resetWorkflowRunsFunc,
    resetWorkflowDetailsFunc,
    resetWorkflowTaskDetailsWithoutRunFunc
  } = props
  const history = useHistory()
  const tabs = ['Runs', 'Tasks']
  const [activeTab, setActiveTab] = React.useState(0)
  const splittedPath = history.location.pathname.split('/')
  const [workflowId, setWorkflowId] = useState(splittedPath[2])
  const [runId, setRunId] = useState(
    splittedPath.length > 4 ? splittedPath[4] : null
  )
  const [taskIdOfRun, setTaskIdOfRun] = useState(
    splittedPath.length > 6 ? splittedPath[6] : null
  )
  const [taskIdWithoutRun, setTaskIdWithoutRun] = useState(
    tabs[activeTab] === 'Tasks'
      ? splittedPath.length > 4
        ? splittedPath[4]
        : null
      : null
  )

  useEffect(() => {
    const splittedPath = history.location.pathname.split('/')
    const isRunsTabActive = splittedPath[3] === 'runs'
    if (isRunsTabActive) {
      setActiveTab(0)
      resetWorkflowTaskDetailsWithoutRunFunc()
      setTaskIdWithoutRun(null)
    } else {
      setActiveTab(1)
      setRunId(null)
      setTaskIdOfRun(null)
    }

    if (isRunsTabActive && splittedPath.length > 3) {
      const newRunId = splittedPath[4]
      if (newRunId !== runId) {
        setRunId(newRunId)
      }
    } else {
      setRunId(null)
    }

    if (isRunsTabActive && splittedPath.length > 6) {
      const newTaskIdOfRun = splittedPath[6]
      if (newTaskIdOfRun !== taskIdOfRun) {
        setTaskIdOfRun(newTaskIdOfRun)
      }
    } else {
      setTaskIdOfRun(null)
    }

    if (!isRunsTabActive && splittedPath.length > 4) {
      const newTaskIdWithoutRun = splittedPath[4]
      if (newTaskIdWithoutRun !== taskIdWithoutRun) {
        setTaskIdWithoutRun(newTaskIdWithoutRun)
      }
    } else {
      setTaskIdWithoutRun(null)
    }
  }, [history.location.pathname])

  useEffect(() => {
    const payload = {
      workflowId: workflowId
    }
    getWorkflowDetails(payload)
  }, [workflowId])

  useEffect(() => {
    if (workflowDetails?.status === API_STATUS.LOADING) {
      setShowGlobalSpinner(true)
    } else {
      setShowGlobalSpinner(false)
    }

    return () => {
      setShowGlobalSpinner(false)
    }
  }, [workflowDetails?.status])

  useEffect(() => {
    logEvent(EventTypes.WORKFLOWS.DETAILS_OPEN, SeverityTypes.INFO)

    return () => {
      resetWorkflowRunsFunc()
      resetWorkflowDetailsFunc()
    }
  }, [])

  return (
    <div className={classes.container} data-testid='workflow-details-page'>
      <WorkflowDetailsHeader workflowDetails={workflowDetails} />
      <WorkflowDetailsSection
        workflowDetails={workflowDetails}
        workflowRunDetails={workflowRunDetails}
        tabs={tabs}
        activeTab={activeTab}
        taskIdOfRun={taskIdOfRun}
        runId={runId}
        taskIdWithoutRun={taskIdWithoutRun}
      />
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
    getWorkflowDetails: (payload: GetWorkflowDetailsInput) =>
      getWorkflowDetails(dispatch, payload),
    setShowGlobalSpinner: (payload: boolean) =>
      dispatch(setShowGlobalSpinner(payload)),
    resetWorkflowRunsFunc: () => dispatch(resetWorkflowRuns()),
    resetWorkflowDetailsFunc: () => dispatch(resetWorkflowDetails()),
    resetWorkflowTaskDetailsWithoutRunFunc: () =>
      dispatch(resetWorkflowTaskDetailsWithoutRun())
  }
}

const StyleComponent = compose<any>(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, {withTheme: true})
)(WorkflowDetails)

export default StyleComponent
