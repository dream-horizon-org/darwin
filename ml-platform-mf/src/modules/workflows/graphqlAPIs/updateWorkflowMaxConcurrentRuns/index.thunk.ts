import {
  UpdateWorkflowMaxConcurrentRuns,
  UpdateWorkflowMaxConcurrentRunsInput
} from '.'
import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {
  setUpdateWorkflowConcurrentRuns,
  setWorkflowDetails
} from '../../pages/workflowDetails/actions'
import {IWorkflowsDetailsState} from '../../pages/workflowDetails/reducer'

import {GQL as updateWorkflowMaxConcurrentRunsGql} from './indexGql'

export const updateWorkflowMaxConcurrentRuns = (
  dispatch,
  payload: UpdateWorkflowMaxConcurrentRunsInput,
  workflowDetails: IWorkflowsDetailsState['workflowDetails']
) => {
  const gql = {
    ...updateWorkflowMaxConcurrentRunsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    UpdateWorkflowMaxConcurrentRunsInput,
    UpdateWorkflowMaxConcurrentRuns
  >(gql)

  dispatch(
    setUpdateWorkflowConcurrentRuns({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data?.updateWorkflowMaxConcurrentRuns?.data?.workflow_id) {
        dispatch(
          setUpdateWorkflowConcurrentRuns({
            status: API_STATUS.SUCCESS,
            data: response?.data?.updateWorkflowMaxConcurrentRuns?.data,
            error: null
          })
        )

        const updatedWorkflowDetails = {
          ...workflowDetails,
          data: {
            ...workflowDetails.data,
            max_concurrent_runs:
              response?.data?.updateWorkflowMaxConcurrentRuns?.data
                ?.max_concurrent_runs
          }
        }

        dispatch(setWorkflowDetails(updatedWorkflowDetails))
        dispatch(
          setGlobalSnackBar({
            message: 'Max Concurrent Runs updated Successfully',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )
      } else {
        dispatch(
          setUpdateWorkflowConcurrentRuns({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Error in updating max concurrent runs'
          })
        )

        dispatch(
          setGlobalSnackBar({
            message: 'Max Concurrent Runs update Failed',
            open: true,
            type: SnackbarType.ERROR
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setUpdateWorkflowConcurrentRuns({
          status: API_STATUS.ERROR,
          data: null,
          error: error
        })
      )

      dispatch(
        setGlobalSnackBar({
          message: 'Max Concurrent Runs update Failed',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
