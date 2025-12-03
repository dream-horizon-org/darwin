import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {GetWorkflowStatus, GetWorkflowStatusInput} from './index'

import {API_STATUS} from '../../../../utils/apiUtils'
import {setWorkflowStatus} from '../../pages/workflowDetails/actions'
import {GQL as getWorkflowDetailsGql} from './indexGql'

export const getWorkflowStatus = (
  dispatch,
  payload: GetWorkflowStatusInput
) => {
  const gql = {
    ...getWorkflowDetailsGql,
    variables: payload
  }
  const gqlResponse = gqlRequestTyped<
    GetWorkflowStatusInput,
    GetWorkflowStatus
  >(gql)

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowDetails?.data?.workflow_status) {
        dispatch(
          setWorkflowStatus({
            status: API_STATUS.SUCCESS,
            data: response.data.getWorkflowDetails.data.workflow_status,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowStatus({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Workflow status not found'
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setWorkflowStatus({
          status: API_STATUS.ERROR,
          data: null,
          error:
            err.message || 'An error occurred while fetching workflow status'
        })
      )
    })
}
