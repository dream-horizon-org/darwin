import {
  GetWorkflowTaskDetailsWithoutRun,
  GetWorkflowTaskDetailsWithoutRunInput
} from './index'

import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setWorkflowTaskDetailsWithoutRun} from '../../pages/workflowDetails/actions'
import {GQL as getWorkflowTaskDetailsWithoutRunGql} from './indexGql'

export const getWorkflowTaskDetailsWithoutRun = (
  dispatch,
  payload: GetWorkflowTaskDetailsWithoutRunInput
) => {
  const gql = {
    ...getWorkflowTaskDetailsWithoutRunGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    GetWorkflowTaskDetailsWithoutRunInput,
    GetWorkflowTaskDetailsWithoutRun
  >(gql)

  dispatch(
    setWorkflowTaskDetailsWithoutRun({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowTaskDetailsWithoutRun) {
        dispatch(
          setWorkflowTaskDetailsWithoutRun({
            status: API_STATUS.SUCCESS,
            data: response?.data?.getWorkflowTaskDetailsWithoutRun?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowTaskDetailsWithoutRun({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setWorkflowTaskDetailsWithoutRun({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
