import {CheckUniqueJobClusterName, CheckUniqueJobClusterNameInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setCheckUniqueJobClusterName} from '../../pages/workflowCreate/actions'

import {GQL as checkUniqueJobClusterNameGql} from './indexGql'

export const checkUniqueJobClusterName = (
  dispatch,
  variables: CheckUniqueJobClusterNameInput
) => {
  const gql = {
    ...checkUniqueJobClusterNameGql,
    variables
  }

  const gqlRequest = gqlRequestTyped<
    CheckUniqueJobClusterNameInput,
    CheckUniqueJobClusterName
  >(gql)

  dispatch(
    setCheckUniqueJobClusterName({
      status: API_STATUS.LOADING,
      data: null,
      error: null,
      cancel: gqlRequest.cancel
    })
  )

  gqlRequest
    .then((response) => {
      if (response?.data?.checkUniqueJobClusterName?.data) {
        dispatch(
          setCheckUniqueJobClusterName({
            status: API_STATUS.SUCCESS,
            data: response.data.checkUniqueJobClusterName.data,
            error: null,
            cancel: null
          })
        )
      } else {
        dispatch(
          setCheckUniqueJobClusterName({
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
        setCheckUniqueJobClusterName({
          status: API_STATUS.ERROR,
          data: null,
          error: err,
          cancel: null
        })
      )
    })
}
