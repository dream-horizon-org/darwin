import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setClusterStatus} from '../actions'
import {IClusterStatus} from '../reducer'
import {GetComputeCluster, GetComputeClusterInput} from './getClusterStatus'

import {GQL as getClusterStatusGql} from './getClusterStatusGql'

export const getClusterStatus = (
  dispatch,
  data: GetComputeClusterInput,
  preData: IClusterStatus['data']
) => {
  const gql = {
    ...getClusterStatusGql,
    variables: data
  }
  dispatch(
    setClusterStatus({
      status: API_STATUS.LOADING,
      data: preData || null,
      error: null
    })
  )

  gqlRequestTyped<GetComputeClusterInput, GetComputeCluster>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getComputeCluster &&
        response.data.getComputeCluster.status === 'SUCCESS'
      ) {
        dispatch(
          setClusterStatus({
            status: API_STATUS.SUCCESS,
            data: response.data.getComputeCluster.data,
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setClusterStatus({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
