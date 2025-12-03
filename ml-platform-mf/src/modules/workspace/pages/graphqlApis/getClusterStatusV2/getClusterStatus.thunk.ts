import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setWorkspaceClusterStatus} from '../../actions'
import {GetComputeCluster, GetComputeClusterInput} from './getClusterStatus'

import {GQL as getClusterStatusGql} from './getClusterStatusGql'

export const getWorkspaceClusterStatus = (
  data: GetComputeClusterInput,
  prevData: GetComputeCluster['getComputeCluster'],
  dispatch
) => {
  const gql = {
    ...getClusterStatusGql,
    variables: data
  }

  const gqlRequest = gqlRequestTyped<GetComputeClusterInput, GetComputeCluster>(
    gql
  )
  dispatch(
    setWorkspaceClusterStatus({
      data: prevData || null,
      error: null,
      status: API_STATUS.LOADING
    })
  )

  gqlRequest
    .then((res) => {
      if (res?.data?.getComputeCluster?.data) {
        dispatch(
          setWorkspaceClusterStatus({
            data: res.data.getComputeCluster,
            error: null,
            status: API_STATUS.SUCCESS
          })
        )
      } else {
        throw new Error('Cluster failed to activate!')
      }
    })
    .catch((err) => {
      dispatch(
        setWorkspaceClusterStatus({
          data: prevData || null,
          error: err,
          status: API_STATUS.ERROR
        })
      )
    })
}
