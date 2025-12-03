import {CLUSTER_STATUS} from '../../../../../layouts/attachedClusterDetails/constant'
import {SnackbarType} from '../../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {
  setAttachedCluster,
  setGenericSnackBar,
  setStopCluster
} from '../../actions'
import {IWorkspaceState} from '../../reducer'
import {SelectionOnAttachedCluster} from '../attachCluster/attachCluster'
import {StopCluster, StopClusterInput} from './stopCluster'

import {GQL as stopClusterGql} from './stopClusterGql'

export const stopCluster = (
  data: StopClusterInput,
  attachedCluster: SelectionOnAttachedCluster,
  dispatch
) => {
  const gql = {
    ...stopClusterGql,
    variables: data
  }

  dispatch(
    setStopCluster({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<StopClusterInput, StopCluster>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.stopCluster &&
        response.data.stopCluster.status === 'SUCCESS'
      ) {
        dispatch(
          setStopCluster({
            status: API_STATUS.SUCCESS,
            data: response.data.stopCluster.data,
            error: null
          })
        )
        const cluster = {...attachedCluster}
        cluster.cluster_status = CLUSTER_STATUS.inactive
        dispatch(setAttachedCluster(cluster))
      } else {
        dispatch(
          setStopCluster({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
        setGenericSnackBar({
          open: true,
          message: 'Failed to stop cluster!',
          type: SnackbarType.ERROR
        })
      }
    })
    .catch((err) => {
      dispatch(
        setStopCluster({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
      setGenericSnackBar({
        open: true,
        message: 'Failed to stop cluster!',
        type: SnackbarType.ERROR
      })
    })
}
