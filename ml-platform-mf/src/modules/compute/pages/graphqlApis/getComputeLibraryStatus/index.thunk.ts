import {GetComputeLibraryStatusInput} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeLibraryStatus} from '../actions'
import {GetComputeLibraryStatus} from './index'
import {GQL as getComputeLibraryStatusGql} from './indexGql'

export const getComputeLibraryStatus = (
  dispatch,
  payload: GetComputeLibraryStatusInput
) => {
  const gql = {
    ...getComputeLibraryStatusGql,
    variables: payload
  }

  const gqlRequest = gqlRequestTyped<null, GetComputeLibraryStatus>(gql)
  dispatch(
    setComputeLibraryStatus({
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
        response.data.getComputeLibraryStatus &&
        response.data.getComputeLibraryStatus.data
      ) {
        dispatch(
          setComputeLibraryStatus({
            status: API_STATUS.SUCCESS,
            data: response.data.getComputeLibraryStatus,
            error: null,
            cancel: null
          })
        )
      } else {
        dispatch(
          setComputeLibraryStatus({
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
        setComputeLibraryStatus({
          status: API_STATUS.ERROR,
          data: null,
          error: error,
          cancel: null
        })
      )
    })
}
