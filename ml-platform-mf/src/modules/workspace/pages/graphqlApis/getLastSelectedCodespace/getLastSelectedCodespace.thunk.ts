import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {
  setAttachedCluster,
  setLastSelectedCodespace,
  setLastSyncTime,
  setSelectedCodespace
} from '../../actions'
import {getClusterStatus} from '../getClusterStatus/getClusterStatus.thunk'
import {launchCodespace} from '../launchCodespace/launchCodespace.thunk'
import {GetLastSelectedCodespace} from './getLastSelectedCodespace'

import {GQL as getLastSelectedCodespaceGql} from './getLastSelectedCodespaceGql'

export const getLastSelectedCodespace = (dispatch) => {
  const gql = {
    ...getLastSelectedCodespaceGql,
    variables: {}
  }

  dispatch(
    setLastSelectedCodespace({
      status: API_STATUS.LOADING,
      data: null
    })
  )

  dispatch(
    setSelectedCodespace({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setLastSyncTime({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(setAttachedCluster(null))

  gqlRequestTyped<null, GetLastSelectedCodespace>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getLastSelectedCodespace &&
        response.data.getLastSelectedCodespace.data
      ) {
        dispatch(
          setLastSelectedCodespace({
            status: API_STATUS.SUCCESS,
            data: response.data.getLastSelectedCodespace.data
          })
        )

        dispatch(
          setSelectedCodespace({
            status: API_STATUS.SUCCESS,
            data: response.data.getLastSelectedCodespace.data,
            error: null
          })
        )

        dispatch(
          setAttachedCluster(
            response.data.getLastSelectedCodespace.data.attached_cluster || null
          )
        )

        dispatch(
          setLastSyncTime({
            status: API_STATUS.SUCCESS,
            data: response.data.getLastSelectedCodespace.data.last_sync_time,
            error: null
          })
        )

        if (
          response.data.getLastSelectedCodespace.data.attached_cluster &&
          response.data.getLastSelectedCodespace.data.attached_cluster
            .cluster_id &&
          response.data.getLastSelectedCodespace.data.attached_cluster
            .cluster_status !== 'active'
        ) {
          getClusterStatus(
            {
              clusterId:
                response.data.getLastSelectedCodespace.data.attached_cluster
                  .cluster_id
            },
            dispatch
          ).then((res) => {
            if (
              res &&
              res.data &&
              res.data.getComputeCluster &&
              res.data.getComputeCluster.data &&
              res.data.getComputeCluster.data.status === 'active'
            ) {
              launchCodespace(dispatch, {
                projectId:
                  response.data.getLastSelectedCodespace.data.project_id,
                codespaceId:
                  response.data.getLastSelectedCodespace.data.codespace_id,
                user: 'test1'
              })
            }
          })
        }
      } else {
        dispatch(
          setLastSelectedCodespace({
            status: API_STATUS.ERROR,
            data: null
          })
        )

        dispatch(
          setSelectedCodespace({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )

        dispatch(
          setLastSyncTime({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setLastSelectedCodespace({
          status: API_STATUS.ERROR,
          data: null
        })
      )

      dispatch(
        setSelectedCodespace({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )

      dispatch(
        setLastSyncTime({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
