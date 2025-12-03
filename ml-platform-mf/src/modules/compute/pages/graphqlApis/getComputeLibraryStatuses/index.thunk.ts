import {GetComputeLibraryStatusesInput} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeLibraryStatuses} from '../actions'

import {GQL as getComputeLibraryStatusesGql} from './indexGql'

export const getComputeLibraryStatuses = (
  dispatch,
  payload: GetComputeLibraryStatusesInput
) => {
  const gql = {
    ...getComputeLibraryStatusesGql,
    variables: payload
  }

  const gqlRequest = gqlRequestTyped<null, any>(gql)
  dispatch(
    setComputeLibraryStatuses({
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
        response.data.getComputeLibraryStatuses &&
        response.data.getComputeLibraryStatuses.data
      ) {
        dispatch(
          setComputeLibraryStatuses({
            status: API_STATUS.SUCCESS,
            data: response.data.getComputeLibraryStatuses,
            error: null,
            cancel: null
          })
        )
      } else {
        dispatch(
          setComputeLibraryStatuses({
            status: API_STATUS.ERROR,
            data: null,
            error: response.errors,
            cancel: null
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setComputeLibraryStatuses({
          status: API_STATUS.ERROR,
          data: null,
          error: error,
          cancel: null
        })
      )
    })
}
