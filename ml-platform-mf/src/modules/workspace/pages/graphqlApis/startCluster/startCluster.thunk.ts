import {CLUSTER_STATUS} from '../../../../../layouts/attachedClusterDetails/constant'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setAttachedCluster, setStartCluster} from '../../actions'
import {SelectionOnAttachedCluster} from '../attachCluster/attachCluster'
import {StartCluster, StartClusterInput} from './startCluster'

import {GQL as startClusterGql} from './startClusterGql'

export const startCluster = (
  input: StartClusterInput,
  attachedCluster: SelectionOnAttachedCluster,
  dispatch
) => {
  const gql = {
    ...startClusterGql,
    variables: input
  }
  dispatch(
    setStartCluster({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlRequestTyped<StartClusterInput, StartCluster>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.startCluster &&
        response.data.startCluster.status === 'SUCCESS'
      ) {
        dispatch(
          setStartCluster({
            status: API_STATUS.SUCCESS,
            data: response.data.startCluster.data,
            error: null
          })
        )
        const cluster = {...attachedCluster}
        cluster.cluster_status = CLUSTER_STATUS.creating
        dispatch(setAttachedCluster(cluster))
      } else {
        dispatch(
          setStartCluster({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setStartCluster({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
