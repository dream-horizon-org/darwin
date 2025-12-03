import {UpdateWorkflowSchedule, UpdateWorkflowScheduleInput} from '.'
import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {
  setUpdateWorkflowSchedule,
  setWorkflowDetails
} from '../../pages/workflowDetails/actions'
import {IWorkflowsDetailsState} from '../../pages/workflowDetails/reducer'

import {GQL as updateWorkflowScheduleGql} from './indexGql'

export const updateWorkflowSchedule = (
  dispatch,
  payload: UpdateWorkflowScheduleInput,
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
) => {
  const gql = {
    ...updateWorkflowScheduleGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    UpdateWorkflowScheduleInput,
    UpdateWorkflowSchedule
  >(gql)

  dispatch(
    setUpdateWorkflowSchedule({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data?.updateWorkflowSchedule?.data) {
        dispatch(
          setUpdateWorkflowSchedule({
            status: API_STATUS.SUCCESS,
            data: response?.data?.updateWorkflowSchedule?.data,
            error: null
          })
        )

        const updatedWorkflowDetails = {
          ...workflowDetails,
          data: {
            ...workflowDetails.data,
            schedule: response?.data?.updateWorkflowSchedule?.data?.schedule
          }
        }

        dispatch(setWorkflowDetails(updatedWorkflowDetails))
        dispatch(
          setGlobalSnackBar({
            message: 'Schedule updated Successfully',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )
      } else {
        dispatch(
          setUpdateWorkflowSchedule({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Unable to update workflow schedule'
          })
        )
        dispatch(
          setGlobalSnackBar({
            message: 'Schedule updated failed',
            open: true,
            type: SnackbarType.ERROR
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setUpdateWorkflowSchedule({
          status: API_STATUS.ERROR,
          data: null,
          error: error.message
        })
      )
      dispatch(
        setGlobalSnackBar({
          message: 'Schedule updated failed',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
