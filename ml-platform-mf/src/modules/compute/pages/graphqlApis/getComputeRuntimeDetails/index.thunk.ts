import {GetComputeRuntimeDetailsInput} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeRuntimeDetails} from '../actions'
import {GQL as computeRuntimeDetailsGQL} from './indexGql'

export const getComputeRuntimeDetails = (
  dispatch,
  payload: GetComputeRuntimeDetailsInput
) => {
  const gql = {
    ...computeRuntimeDetailsGQL,
    variables: payload
  }
  const gqlResponse = gqlRequestTyped<GetComputeRuntimeDetailsInput, any>(gql)

  dispatch(
    setComputeRuntimeDetails({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlResponse
    .then((response) => {
      if (
        response &&
        response?.data &&
        response?.data?.getComputeRuntimeDetails &&
        response?.data?.getComputeRuntimeDetails?.data
      ) {
        const newData = response.data.getComputeRuntimeDetails.data

        dispatch(
          setComputeRuntimeDetails({
            status: API_STATUS.SUCCESS,
            data: newData,
            error: null
          })
        )
      } else {
        dispatch(
          setComputeRuntimeDetails({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Error fetching compute runtime details'
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setComputeRuntimeDetails({
          status: API_STATUS.ERROR,
          data: null,
          error: error.message || 'Error fetching compute runtime details'
        })
      )
    })
}
