import {GetComputeLibraryDetails, GetComputeLibraryDetailsInput} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeLibraryDetails} from '../actions'
import {GQL as getComputeLibraryDetailsGql} from './indexGql'

export const getComputeLibraryDetails = (
  dispatch,
  payload: GetComputeLibraryDetailsInput
) => {
  const gql = {
    ...getComputeLibraryDetailsGql,
    variables: payload
  }

  dispatch(
    setComputeLibraryDetails({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetComputeLibraryDetails>(gql)
    .then((response) => {
      if (response && response.data && response.data.getComputeLibraryDetails) {
        dispatch(
          setComputeLibraryDetails({
            status: API_STATUS.SUCCESS,
            data: response.data.getComputeLibraryDetails,
            error: null
          })
        )
      } else {
        dispatch(
          setComputeLibraryDetails({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setComputeLibraryDetails({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
