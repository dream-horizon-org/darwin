import {CreateWorkflow, CreateWorkflowInput} from '.'
import {
  setGlobalSnackBar,
  setShowGlobalSpinner
} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setCreateWorkflow} from '../../pages/workflowCreate/actions'

import {GQL as createWorkflowGql} from './indexGql'

export const createWorkflow = (dispatch, payload: CreateWorkflowInput) => {
  const gql = {
    ...createWorkflowGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<CreateWorkflowInput, CreateWorkflow>(gql)

  dispatch(
    setCreateWorkflow({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(setShowGlobalSpinner(true))

  gqlResponse
    .then((response) => {
      if (response.data?.createWorkflow?.data) {
        dispatch(
          setCreateWorkflow({
            status: API_STATUS.SUCCESS,
            data: response?.data?.createWorkflow?.data,
            error: null
          })
        )

        dispatch(setShowGlobalSpinner(false))

        dispatch(
          setGlobalSnackBar({
            message: 'Workflow Created Successfully',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )
      } else {
        dispatch(
          setCreateWorkflow({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Unable to create workflow'
          })
        )

        dispatch(setShowGlobalSpinner(false))

        dispatch(
          setGlobalSnackBar({
            message: 'Failed to Create Workflow',
            open: true,
            type: SnackbarType.ERROR
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setCreateWorkflow({
          status: API_STATUS.ERROR,
          data: null,
          error
        })
      )

      dispatch(setShowGlobalSpinner(false))

      dispatch(
        setGlobalSnackBar({
          message: 'Failed to Create Workflow',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
