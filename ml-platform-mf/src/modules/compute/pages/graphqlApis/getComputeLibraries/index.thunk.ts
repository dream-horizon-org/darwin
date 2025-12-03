import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeLibraries} from '../actions'
import {
  GetComputeLibraries,
  GetComputeLibrariesInput,
  SelectionOnGetComputeLibraries
} from './index'
import {GQL as getComputeLibrariesGql} from './indexGql'

export const getComputeLibraries = (
  dispatch,
  payload: GetComputeLibrariesInput,
  prevData: SelectionOnGetComputeLibraries
) => {
  const gql = {
    ...getComputeLibrariesGql,
    variables: payload
  }

  const gqlRequest = gqlRequestTyped<null, GetComputeLibraries>(gql)
  dispatch(
    setComputeLibraries({
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
        response.data.getComputeLibraries &&
        response.data.getComputeLibraries.data
      ) {
        dispatch(
          setComputeLibraries({
            status: API_STATUS.SUCCESS,
            data:
              prevData && prevData?.data
                ? {
                    message: response.data.getComputeLibraries.message,
                    status: response.data.getComputeLibraries.status,
                    data: {
                      ...response.data.getComputeLibraries.data,
                      packages: [
                        ...(prevData.data.packages || []),
                        ...(response.data.getComputeLibraries.data.packages ||
                          [])
                      ]
                    }
                  }
                : response.data.getComputeLibraries,
            error: null,
            cancel: null
          })
        )
      } else {
        dispatch(
          setComputeLibraries({
            status: API_STATUS.ERROR,
            data: null,
            error: null,
            cancel: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setComputeLibraries({
          status: API_STATUS.ERROR,
          data: null,
          error: null,
          cancel: null
        })
      )
    })
}
