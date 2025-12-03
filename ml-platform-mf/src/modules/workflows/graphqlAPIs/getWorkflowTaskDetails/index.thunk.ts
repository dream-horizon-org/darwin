import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setWorkflowTaskDetails} from '../../pages/workflowDetails/actions'
import {GetWorkflowTaskDetails, GetWorkflowTaskDetailsInput} from './index'
import {GQL as getWorkflowTaskDetailsGql} from './indexGql'

export const getWorkflowTaskDetails = (
  dispatch,
  payload: GetWorkflowTaskDetailsInput
) => {
  const gql = {
    ...getWorkflowTaskDetailsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    GetWorkflowTaskDetailsInput,
    GetWorkflowTaskDetails
  >(gql)

  dispatch(
    setWorkflowTaskDetails({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowTaskDetails) {
        dispatch(
          setWorkflowTaskDetails({
            status: API_STATUS.SUCCESS,
            data: response?.data?.getWorkflowTaskDetails?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowTaskDetails({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setWorkflowTaskDetails({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
