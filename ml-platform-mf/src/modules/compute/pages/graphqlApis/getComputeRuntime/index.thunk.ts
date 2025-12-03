import {
  GetComputeRuntime,
  GetComputeRuntimeInput,
  SelectionOnGetComputeRuntime
} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeRuntime} from '../actions'
import {GQL as computeRuntimeGQL} from './indexGql'

export const getComputeRuntime = (
  dispatch,
  payload: GetComputeRuntimeInput,
  prevData: SelectionOnGetComputeRuntime
) => {
  const gql = {
    ...computeRuntimeGQL,
    variables: payload
  }
  const gqlResponse = gqlRequestTyped<
    GetComputeRuntimeInput,
    GetComputeRuntime
  >(gql)

  dispatch(
    setComputeRuntime({
      status: API_STATUS.LOADING,
      data: prevData?.data || null,
      error: null
    })
  )
  gqlResponse
    .then((response) => {
      if (
        response &&
        response?.data &&
        response?.data?.getComputeRuntime &&
        response?.data?.getComputeRuntime?.data
      ) {
        const newData = response.data.getComputeRuntime.data

        const mergedData =
          prevData && prevData?.data
            ? prevData.data.map((prevItem) => {
                const matchingNewItem =
                  newData[0]?.class === prevItem.class ? newData[0] : null

                if (matchingNewItem) {
                  prevItem.runtimes = prevItem.runtimes.map((prevRuntime) => {
                    const matchingNewRuntime =
                      matchingNewItem.runtimes[0]?.type === prevRuntime.type
                        ? matchingNewItem.runtimes[0]
                        : null

                    if (matchingNewRuntime) {
                      prevRuntime.runtime_list = [
                        ...matchingNewRuntime.runtime_list
                      ]
                    }
                    return prevRuntime
                  })
                }

                return prevItem
              })
            : newData
        dispatch(
          setComputeRuntime({
            status: API_STATUS.SUCCESS,
            data: mergedData,
            error: null
          })
        )
      } else {
        dispatch(
          setComputeRuntime({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Compute runtime not found'
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setComputeRuntime({
          status: API_STATUS.ERROR,
          data: null,
          error: err.message
        })
      )
    })
}
