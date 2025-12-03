import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setDetachCluster} from '../../actions'
import {DetachCluster, DetachClusterInput} from './detachCluster'

import {GQL as detachClusterGql} from './detachClusterGql'

export const detachCluster = (input: DetachClusterInput, dispatch) => {
  const gql = {
    ...detachClusterGql,
    variables: {
      ...input
    }
  }
  dispatch(
    setDetachCluster({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlRequestTyped<DetachClusterInput, DetachCluster>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.detachCluster &&
        response.data.detachCluster.status === 'SUCCESS'
      ) {
        dispatch(
          setDetachCluster({
            status: API_STATUS.SUCCESS,
            data: null,
            error: null
          })
        )
      } else {
        dispatch(
          setDetachCluster({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setDetachCluster({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
