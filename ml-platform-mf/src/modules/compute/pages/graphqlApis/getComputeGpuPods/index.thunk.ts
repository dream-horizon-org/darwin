import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeGpuPods} from '../actions'
import {GetComputeGpuPods} from './index'

import {GQL as getComputeGpuPodsGql} from './indexGql'

export const getComputeGpuPods = (dispatch) => {
  const gql = {
    ...getComputeGpuPodsGql
  }

  dispatch(
    setComputeGpuPods({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetComputeGpuPods>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getComputeGpuPods &&
        response.data.getComputeGpuPods.status === 'SUCCESS'
      ) {
        dispatch(
          setComputeGpuPods({
            status: API_STATUS.SUCCESS,
            data: response.data.getComputeGpuPods.data,
            error: null
          })
        )
      } else {
        dispatch(
          setComputeGpuPods({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setComputeGpuPods({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
