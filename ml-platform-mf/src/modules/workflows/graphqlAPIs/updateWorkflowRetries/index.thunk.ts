import {UpdateWorkflowRetries, UpdateWorkflowRetriesInput} from '.'
import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {
  setUpdateWorkflowRetries,
  setWorkflowDetails
} from '../../pages/workflowDetails/actions'
import {IWorkflowsDetailsState} from '../../pages/workflowDetails/reducer'

import {GQL as updateWorkflowRetriesGql} from './indexGql'

export const updateWorkflowRetries = (
  dispatch,
  payload: UpdateWorkflowRetriesInput,
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
) => {
  const gql = {
    ...updateWorkflowRetriesGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    UpdateWorkflowRetriesInput,
    UpdateWorkflowRetries
  >(gql)

  dispatch(
    setUpdateWorkflowRetries({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data?.updateWorkflowRetries?.data?.workflow_id) {
        dispatch(
          setUpdateWorkflowRetries({
            status: API_STATUS.SUCCESS,
            data: response?.data?.updateWorkflowRetries?.data,
            error: null
          })
        )

        const updatedWorkflowDetails = {
          ...workflowDetails,
          data: {
            ...workflowDetails.data,
            retries: response?.data?.updateWorkflowRetries?.data?.retries
          }
        }

        dispatch(setWorkflowDetails(updatedWorkflowDetails))
        dispatch(
          setGlobalSnackBar({
            message: 'Retries updated Successfully',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )
      } else {
        dispatch(
          setUpdateWorkflowRetries({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Error in updating retries'
          })
        )

        dispatch(
          setGlobalSnackBar({
            message: 'Retries update failed',
            open: true,
            type: SnackbarType.ERROR
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setUpdateWorkflowRetries({
          status: API_STATUS.ERROR,
          data: null,
          error
        })
      )

      dispatch(
        setGlobalSnackBar({
          message: 'Retries update failed',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
