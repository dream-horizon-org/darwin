import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setWorkflowPathIds} from '../../pages/workflowDetails/actions'
import {GetWorkflowPathIds, GetWorkflowPathIdsInput} from './index'
import {GQL as getWorkflowPathIdsGql} from './indexGql'

export const getWorkflowPathIds = (
  dispatch,
  payload: GetWorkflowPathIdsInput
) => {
  const gql = {
    ...getWorkflowPathIdsGql,
    variables: payload
  }
  const gqlResponse = gqlRequestTyped<
    GetWorkflowPathIdsInput,
    GetWorkflowPathIds
  >(gql)

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowPathDetails?.data) {
        dispatch(
          setWorkflowPathIds({
            status: API_STATUS.SUCCESS,
            data: response?.data?.getWorkflowPathDetails?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowPathIds({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Workflow path ids not found'
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setWorkflowPathIds({
          status: API_STATUS.ERROR,
          data: null,
          error: error.message
        })
      )
    })
}
