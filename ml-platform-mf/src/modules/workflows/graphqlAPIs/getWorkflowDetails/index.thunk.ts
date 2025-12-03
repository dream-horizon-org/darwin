import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {GetWorkflowDetails, GetWorkflowDetailsInput} from './index'

import {API_STATUS} from '../../../../utils/apiUtils'
import {
  setWorkflowDetails,
  setWorkflowStatus
} from '../../pages/workflowDetails/actions'
import {GQL as getWorkflowDetailsGql} from './indexGql'

export const getWorkflowDetails = (
  dispatch,
  payload: GetWorkflowDetailsInput
) => {
  const gql = {
    ...getWorkflowDetailsGql,
    variables: payload
  }

  dispatch(
    setWorkflowDetails({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  dispatch(
    setWorkflowStatus({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const gqlResponse = gqlRequestTyped<
    GetWorkflowDetailsInput,
    GetWorkflowDetails
  >(gql)

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowDetails?.data) {
        dispatch(
          setWorkflowDetails({
            status: API_STATUS.SUCCESS,
            data: response?.data?.getWorkflowDetails?.data,
            error: null
          })
        )
        dispatch(
          setWorkflowStatus({
            status: API_STATUS.SUCCESS,
            data: response.data.getWorkflowDetails.data.workflow_status,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowDetails({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setWorkflowDetails({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
