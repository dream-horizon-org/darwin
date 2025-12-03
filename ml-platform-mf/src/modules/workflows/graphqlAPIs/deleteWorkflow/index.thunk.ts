import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setDeleteWorkflow, setWorkflows} from '../../pages/workflows/actions'
import {SelectionOnGetWorkflows} from '../getWorkflows'
import {DeleteWorkflow, DeleteWorkflowInput} from './index'

import {GQL as deleteWorkflowGql} from './indexGql'

export const deleteWorkflow = (
  dispatch,
  payload: DeleteWorkflowInput,
  workflowsData: SelectionOnGetWorkflows
) => {
  const gql = {
    ...deleteWorkflowGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<DeleteWorkflowInput, DeleteWorkflow>(gql)

  dispatch(
    setDeleteWorkflow({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setGlobalSnackBar({
      message: 'Deleting Workflow...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.deleteWorkflow?.data.is_deleted) {
        if (workflowsData) {
          const workflows = workflowsData.data.filter(
            (workflow) => workflow.workflow_id !== payload.workflowId
          )

          dispatch(
            setWorkflows({
              status: API_STATUS.SUCCESS,
              data: {
                ...workflowsData,
                result_size: workflowsData.result_size - 1,
                data: workflows
              },
              error: null,
              cancel: null
            })
          )
        }
        dispatch(
          setGlobalSnackBar({
            message: 'Workflow Deleted Successfully',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )

        dispatch(
          setDeleteWorkflow({
            status: API_STATUS.SUCCESS,
            data: response.data.deleteWorkflow.data,
            error: null
          })
        )
      } else {
        dispatch(
          setGlobalSnackBar({
            message: 'Failed to Delete Workflow',
            open: true,
            type: SnackbarType.ERROR
          })
        )

        dispatch(
          setDeleteWorkflow({
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
          message: 'Failed to Delete Workflow',
          open: true,
          type: SnackbarType.ERROR
        })
      )

      dispatch(
        setDeleteWorkflow({
          status: API_STATUS.ERROR,
          data: null,
          error
        })
      )
    })
}
