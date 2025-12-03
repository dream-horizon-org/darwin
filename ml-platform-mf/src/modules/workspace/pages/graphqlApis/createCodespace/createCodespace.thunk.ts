import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {
  createCodespace as createCodespaceFun,
  setAttachedCluster,
  setGenericSnackBar,
  setSelectedCodespace
} from '../../actions'
import {SnackbarType} from '../../reducer'
import {getClusterStatus} from '../getClusterStatus/getClusterStatus.thunk'
import {launchCodespace} from '../launchCodespace/launchCodespace.thunk'
import {CreateCodespace} from './createCodespace'

import {GQL as createCodespaceGql} from './createCodespaceGql'

export const createCodespace = (dispatch, payload) => {
  const gql = {
    ...createCodespaceGql,
    variables: payload
  }

  dispatch(
    createCodespaceFun({
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

  dispatch(setAttachedCluster(null))

  gqlRequestTyped<null, CreateCodespace>(gql)
    .then((response) => {
      if (response && response.data && response.data.createCodespace) {
        dispatch(
          createCodespaceFun({
            status: API_STATUS.SUCCESS,
            data: response.data.createCodespace
          })
        )

        dispatch(
          setSelectedCodespace({
            status: API_STATUS.SUCCESS,
            data: response.data.createCodespace,
            error: null
          })
        )

        dispatch(
          setAttachedCluster(
            response.data.createCodespace.attached_cluster || null
          )
        )

        dispatch(
          setGenericSnackBar({
            message: 'Codespace created successfully!',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )

        if (
          response.data.createCodespace.attached_cluster &&
          response.data.createCodespace.attached_cluster.cluster_status !==
            'active'
        ) {
          getClusterStatus(
            {
              clusterId:
                response.data.createCodespace.attached_cluster.cluster_id
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
                projectId: response.data.createCodespace.project_id,
                codespaceId: response.data.createCodespace.codespace_id,
                user: 'test1'
              })
            }
          })
        }
      } else {
        dispatch(
          createCodespaceFun({
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

        dispatch(setAttachedCluster(null))

        dispatch(
          setGenericSnackBar({
            message: 'Codespace failed to create!',
            open: true,
            type: SnackbarType.ERROR
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        createCodespaceFun({
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

      dispatch(setAttachedCluster(null))

      dispatch(
        setGenericSnackBar({
          message: 'Codespace failed to create!',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
