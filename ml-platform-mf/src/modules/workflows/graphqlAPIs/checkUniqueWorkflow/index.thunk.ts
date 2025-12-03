import {CheckUniqueWorkflow, CheckUniqueWorkflowInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setCheckUniqueWorkflow} from '../../pages/workflowCreate/actions'

import {GQL as checkUniqueCodespaceGql} from './indexGql'

export const checkUnqiueWorkflow = (
  dispatch,
  variables: CheckUniqueWorkflowInput
) => {
  const gql = {
    ...checkUniqueCodespaceGql,
    variables
  }

  const gqlRequest = gqlRequestTyped<
    CheckUniqueWorkflowInput,
    CheckUniqueWorkflow
  >(gql)

  dispatch(
    setCheckUniqueWorkflow({
      status: API_STATUS.LOADING,
      data: null,
      error: null,
      cancel: gqlRequest.cancel
    })
  )

  gqlRequest
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.checkUniqueWorkflow &&
        response.data.checkUniqueWorkflow.data
      ) {
        dispatch(
          setCheckUniqueWorkflow({
            status: API_STATUS.SUCCESS,
            data: response.data.checkUniqueWorkflow.data,
            error: null,
            cancel: null
          })
        )
      } else {
        dispatch(
          setCheckUniqueWorkflow({
            status: API_STATUS.ERROR,
            data: null,
            error: null,
            cancel: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setCheckUniqueWorkflow({
          status: API_STATUS.ERROR,
          data: null,
          error: err,
          cancel: null
        })
      )
    })
}
