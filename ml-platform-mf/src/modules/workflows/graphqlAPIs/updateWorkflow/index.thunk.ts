import {UpdateWorkflow, UpdateWorkflowInput} from '.'
import {
  setGlobalSnackBar,
  setShowGlobalSpinner
} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setUpdateWorkflow} from '../../pages/workflowEdit/actions'

import {GQL as updateWorkflowGql} from './indexGql'

export const updateWorkflow = (dispatch, payload: UpdateWorkflowInput) => {
  const gql = {
    ...updateWorkflowGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<UpdateWorkflowInput, UpdateWorkflow>(gql)

  dispatch(
    setUpdateWorkflow({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(setShowGlobalSpinner(true))

  gqlResponse
    .then((response) => {
      if (response.data?.updateWorkflow?.data?.workflow_id) {
        dispatch(
          setUpdateWorkflow({
            status: API_STATUS.SUCCESS,
            data: response?.data?.updateWorkflow?.data,
            error: null
          })
        )

        dispatch(setShowGlobalSpinner(false))
      } else {
        dispatch(
          setUpdateWorkflow({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Unable to update workflow'
          })
        )

        dispatch(setShowGlobalSpinner(false))

        dispatch(
          setGlobalSnackBar({
            message: 'Failed to Update Workflow',
            open: true,
            type: SnackbarType.ERROR
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setUpdateWorkflow({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )

      dispatch(setShowGlobalSpinner(false))
      dispatch(
        setGlobalSnackBar({
          message: 'Failed to Update Workflow',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
