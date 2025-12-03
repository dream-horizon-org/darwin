import React from 'react'
import {errorTypes} from '../../../../../components/workspace/workspaceLevelError/constants'
import WorkspaceLevelError from '../../../../../components/workspace/workspaceLevelError/workspaceLevelError'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {
  setAttachedCluster,
  setLaunchCodespace,
  setSelectedCodespace
} from '../../actions'
import {getClusterStatus} from '../getClusterStatus/getClusterStatus.thunk'
import {LaunchCodespace} from './launchCodespace'

import {GQL as launchCodespaceGql} from './launchCodespaceGql'

export const launchCodespace = (dispatch, payload = {}) => {
  const gql = {
    ...launchCodespaceGql,
    variables: payload
  }

  dispatch(
    setLaunchCodespace({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  dispatch(
    setSelectedCodespace({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const handleLaunchError = (err = null) => {
    dispatch(
      setLaunchCodespace({
        status: API_STATUS.ERROR,
        data: null,
        error: null
      })
    )
    dispatch(
      setSelectedCodespace({
        status: API_STATUS.ERROR,
        data: null,
        error: {
          message: 'Failed to launch codespace.',
          component: () => (
            <WorkspaceLevelError type={errorTypes.LAUNCH_CODESPACE_FAILED} />
          )
        }
      })
    )
    dispatch(setAttachedCluster(null))
  }

  // const handleClusterActivationError = (_err = null, data = null) => {
  //   dispatch(
  //     setSelectedCodespace({
  //       status: API_STATUS.ERROR,
  //       data,
  //       error: {
  //         message: 'Failed to activate cluster.',
  //         component: () => (
  //           <WorkspaceLevelError type={errorTypes.CLUSTER_ACTIVATION_FAILED} />
  //         )
  //       }
  //     })
  //   )
  // }

  gqlRequestTyped<null, LaunchCodespace>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.launchCodespace &&
        response.data.launchCodespace.project_id
      ) {
        dispatch(
          setLaunchCodespace({
            status: API_STATUS.SUCCESS,
            data: response.data.launchCodespace,
            error: null
          })
        )
        dispatch(
          setSelectedCodespace({
            status: API_STATUS.SUCCESS,
            data: response.data.launchCodespace,
            error: null
          })
        )
        dispatch(
          setAttachedCluster(
            response.data.launchCodespace.attached_cluster || null
          )
        )

        if (
          response.data.launchCodespace.attached_cluster &&
          response.data.launchCodespace.attached_cluster.cluster_status ===
            'creating'
        ) {
          launchCodespaceOnceClusterActivated(
            {
              clusterId:
                response.data.launchCodespace.attached_cluster.cluster_id,
              projectId: response.data.launchCodespace.project_id,
              codespaceId: response.data.launchCodespace.codespace_id
            },
            dispatch
          )
        }
      } else {
        handleLaunchError()
      }
    })
    .catch(handleLaunchError)
}

export const launchCodespaceOnceClusterActivated = (
  {clusterId, projectId, codespaceId},
  dispatch
) => {
  getClusterStatus(
    {
      clusterId
    },
    dispatch
  )
    .then((res) => {
      if (
        res &&
        res.data &&
        res.data.getComputeCluster &&
        res.data.getComputeCluster.data &&
        res.data.getComputeCluster.data.status === 'active'
      ) {
        launchCodespace(dispatch, {
          projectId,
          codespaceId,
          user: 'test1'
        })
      }
    })
    .catch((err) =>
      dispatch(
        setSelectedCodespace({
          status: API_STATUS.ERROR,
          data: null,
          error: {
            message: 'Failed to activate cluster.',
            component: () => (
              <WorkspaceLevelError
                type={errorTypes.CLUSTER_ACTIVATION_FAILED}
              />
            )
          }
        })
      )
    )
}
