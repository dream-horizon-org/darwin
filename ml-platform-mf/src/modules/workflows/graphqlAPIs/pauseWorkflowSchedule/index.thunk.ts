import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {
  setWorkflowDetails,
  setWorkflowStatus
} from '../../pages/workflowDetails/actions'
import {
  setPauseWorkflowSchedule,
  setWorkflows
} from '../../pages/workflows/actions'
import {SelectionOnGetWorkflowDetails} from '../getWorkflowDetails'
import {SelectionOnGetWorkflows} from '../getWorkflows'
import {PauseWorkflowSchedule, PauseWorkflowScheduleInput} from './index'

import {GQL as pauseWorkflowScheduleGql} from './indexGql'

export const pauseWorkflowSchedule = (
  dispatch,
  payload: PauseWorkflowScheduleInput,
  workflowsData: SelectionOnGetWorkflows,
  workflowDetailsData?: SelectionOnGetWorkflowDetails
) => {
  const gql = {
    ...pauseWorkflowScheduleGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    PauseWorkflowScheduleInput,
    PauseWorkflowSchedule
  >(gql)

  dispatch(
    setPauseWorkflowSchedule({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setGlobalSnackBar({
      message: 'Pausing Workflow Schedule...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.pauseWorkflowSchedule?.data) {
        if (workflowsData) {
          const workflows = workflowsData.data.map((workflow) => {
            if (workflow.workflow_id === payload.workflowId) {
              workflow.status =
                response.data.pauseWorkflowSchedule.data.workflow_status
            }

            return workflow
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
        } else if (workflowDetailsData) {
          dispatch(
            setWorkflowDetails({
              status: API_STATUS.SUCCESS,
              data: {
                ...workflowDetailsData.data,
                workflow_status:
                  response.data.pauseWorkflowSchedule.data.workflow_status
              },
              error: null
            })
          )
          dispatch(
            setWorkflowStatus({
              status: API_STATUS.SUCCESS,
              data: response.data.pauseWorkflowSchedule.data.workflow_status,
              error: null
            })
          )
        }

        dispatch(
          setGlobalSnackBar({
            message: 'Workflow Schedule Paused Successfully',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )

        dispatch(
          setPauseWorkflowSchedule({
            status: API_STATUS.SUCCESS,
            data: response.data.pauseWorkflowSchedule.data,
            error: null
          })
        )
      } else {
        dispatch(
          setGlobalSnackBar({
            message: 'Failed to Pause Workflow Schedule',
            open: true,
            type: SnackbarType.ERROR
          })
        )

        dispatch(
          setPauseWorkflowSchedule({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setGlobalSnackBar({
          message: 'Failed to Pause Workflow Schedule',
          open: true,
          type: SnackbarType.ERROR
        })
      )

      dispatch(
        setPauseWorkflowSchedule({
          status: API_STATUS.ERROR,
          data: null,
          error
        })
      )
    })
}
