import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {
  setWorkflowDetails,
  setWorkflowStatus
} from '../../pages/workflowDetails/actions'
import {
  setResumeWorkflowSchedule,
  setWorkflows
} from '../../pages/workflows/actions'
import {SelectionOnGetWorkflowDetails} from '../getWorkflowDetails'
import {SelectionOnGetWorkflows} from '../getWorkflows'
import {ResumeWorkflowSchedule, ResumeWorkflowScheduleInput} from './index'

import {GQL as resumeWorkflowScheduleGql} from './indexGql'

export const resumeWorkflowSchedule = (
  dispatch,
  payload: ResumeWorkflowScheduleInput,
  workflowsData: SelectionOnGetWorkflows,
  workflowDetailsData?: SelectionOnGetWorkflowDetails
) => {
  const gql = {
    ...resumeWorkflowScheduleGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    ResumeWorkflowScheduleInput,
    ResumeWorkflowSchedule
  >(gql)

  dispatch(
    setResumeWorkflowSchedule({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setGlobalSnackBar({
      message: 'Resuming Workflow Schedule...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.resumeWorkflowSchedule?.data) {
        if (workflowsData) {
          const workflows = workflowsData.data.map((workflow) => {
            if (workflow.workflow_id === payload.workflowId) {
              workflow.status =
                response.data.resumeWorkflowSchedule?.data?.workflow_status
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
                  response.data.resumeWorkflowSchedule.data.workflow_status
              },
              error: null
            })
          )

          dispatch(
            setWorkflowStatus({
              status: API_STATUS.SUCCESS,
              data: response.data.resumeWorkflowSchedule.data.workflow_status,
              error: null
            })
          )
        }

        dispatch(
          setResumeWorkflowSchedule({
            status: API_STATUS.SUCCESS,
            data: response.data.resumeWorkflowSchedule.data,
            error: null
          })
        )

        dispatch(
          setGlobalSnackBar({
            message: 'Workflow Schedule Resumed Successfully',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )
      } else {
        dispatch(
          setGlobalSnackBar({
            message: 'Failed to Resume Workflow Schedule',
            open: true,
            type: SnackbarType.ERROR
          })
        )

        dispatch(
          setResumeWorkflowSchedule({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setGlobalSnackBar({
          message: 'Failed to Resume Workflow Schedule',
          open: true,
          type: SnackbarType.ERROR
        })
      )

      dispatch(
        setResumeWorkflowSchedule({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
