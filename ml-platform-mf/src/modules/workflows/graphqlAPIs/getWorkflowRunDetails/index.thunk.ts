import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {GetWorkflowRunDetails, GetWorkflowRunDetailsInput} from './index'

import {API_STATUS} from '../../../../utils/apiUtils'
import {
  setWorkflowDetails,
  setWorkflowRunDetails
} from '../../pages/workflowDetails/actions'
import {GQL as getWorkflowDetailsGql} from './indexGql'

export const getWorkflowRunDetails = (
  dispatch,
  payload: GetWorkflowRunDetailsInput
) => {
  const gql = {
    ...getWorkflowDetailsGql,
    variables: payload
  }

  dispatch(
    setWorkflowRunDetails({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const gqlResponse = gqlRequestTyped<
    GetWorkflowRunDetailsInput,
    GetWorkflowRunDetails
  >(gql)

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowRunDetails?.data) {
        dispatch(
          setWorkflowRunDetails({
            status: API_STATUS.SUCCESS,
            data: response?.data?.getWorkflowRunDetails?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowRunDetails({
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
