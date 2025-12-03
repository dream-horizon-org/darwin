import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setWorkflowRuns} from '../../pages/workflowDetails/actions'
import {setRunWorkflowRun, setWorkflows} from '../../pages/workflows/actions'
import {SelectionOnGetWorkflowRuns} from '../getWorkflowRuns'
import {SelectionOnGetWorkflows} from '../getWorkflows'
import {RunWorkflowRun, RunWorkflowRunInput} from './index'

import {GQL as runWorkflowRunGql} from './indexGql'

export const runWorkflowRun = (
  dispatch,
  payload: RunWorkflowRunInput,
  workflowsData: SelectionOnGetWorkflows,
  workflowRunsData?: SelectionOnGetWorkflowRuns
) => {
  const gql = {
    ...runWorkflowRunGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<RunWorkflowRunInput, RunWorkflowRun>(gql)

  dispatch(
    setRunWorkflowRun({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setGlobalSnackBar({
      message: 'Scheduling Workflow Run...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.runWorkflowRun?.data) {
        if (workflowsData) {
          const workflows = workflowsData.data.map((workflow) => {
            if (workflow.workflow_id === payload.workflowId) {
              return {
                ...workflow,
                last_runs_status: [
                  response.data.runWorkflowRun.data.last_run.run_status,
                  ...response.data.runWorkflowRun.data.last_runs_status
                ]
              }
            } else {
              return workflow
            }
          })

          dispatch(
            setWorkflows({
              status: API_STATUS.SUCCESS,
              data: {
                ...workflowsData,
                data: workflows
              },
              error: null,
              cancel: null
            })
          )
        } else if (workflowRunsData) {
          const newWorkflowRunsData = [...workflowRunsData.data.runs]
          newWorkflowRunsData.unshift({
            run_id: response.data.runWorkflowRun.data.last_run.run_id,
            start_time: response.data.runWorkflowRun.data.last_run.start_time,
            duration: response.data.runWorkflowRun.data.last_run.duration,
            run_status: response.data.runWorkflowRun.data.last_run.run_status,
            trigger: response.data.runWorkflowRun.data.last_run.trigger,
            trigger_by: response.data.runWorkflowRun.data.last_run.trigger_by,
            is_run_duration_exceeded:
              response.data.runWorkflowRun.data.last_run
                .is_run_duration_exceeded,
            expected_run_duration:
              response.data.runWorkflowRun.data.last_run.expected_run_duration
          })

          dispatch(
            setWorkflowRuns({
              status: API_STATUS.SUCCESS,
              data: {
                ...workflowRunsData,
                data: {
                  ...workflowRunsData.data,
                  runs: newWorkflowRunsData
                }
              },
              error: null
            })
          )
        }

        dispatch(
          setRunWorkflowRun({
            status: API_STATUS.SUCCESS,
            data: response.data.runWorkflowRun.data,
            error: null
          })
        )

        dispatch(
          setGlobalSnackBar({
            message: 'Workflow Run Scheduled...',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )
      } else {
        dispatch(
          setRunWorkflowRun({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setRunWorkflowRun({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
