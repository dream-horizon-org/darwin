import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setWorkflowRuns} from '../../pages/workflowDetails/actions'
import {setStopWorkflowRun} from '../../pages/workflows/actions'
import {SelectionOnGetWorkflowRuns} from '../getWorkflowRuns'
import {StopWorkflowRun, StopWorkflowRunInput} from './index'

import {GQL as stopRunGql} from './indexGql'

export const stopWorkflowRun = (
  dispatch,
  payload: StopWorkflowRunInput,
  workflowRuns: SelectionOnGetWorkflowRuns
) => {
  const gql = {
    ...stopRunGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<StopWorkflowRunInput, StopWorkflowRun>(
    gql
  )

  dispatch(
    setStopWorkflowRun({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.stopWorkflowRun?.data) {
        if (workflowRuns) {
          const updatedWorkflowRuns = workflowRuns.data.runs.map(
            (workflowRun) => {
              if (workflowRun.run_id === payload.runId) {
                return {
                  ...workflowRun,
                  run_status: response.data.stopWorkflowRun.data.run_status
                }
              }
              return workflowRun
            }
          )
          dispatch(
            setWorkflowRuns({
              status: API_STATUS.SUCCESS,
              data: {
                ...workflowRuns,
                data: {
                  ...workflowRuns.data,
                  runs: updatedWorkflowRuns
                }
              },
              error: null
            })
          )
        }
        dispatch(
          setStopWorkflowRun({
            status: API_STATUS.SUCCESS,
            data: response.data.stopWorkflowRun.data,
            error: null
          })
        )
      } else {
        dispatch(
          setStopWorkflowRun({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setStopWorkflowRun({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
