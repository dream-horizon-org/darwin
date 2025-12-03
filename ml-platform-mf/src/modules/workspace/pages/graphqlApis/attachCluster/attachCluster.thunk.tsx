import React from 'react'
import {errorTypes} from '../../../../../components/workspace/workspaceLevelError/constants'
import WorkspaceLevelError from '../../../../../components/workspace/workspaceLevelError/workspaceLevelError'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {
  setAttachCluster,
  setAttachedCluster,
  setSelectedCodespace
} from '../../actions'
import {getClusterStatus} from '../getClusterStatus/getClusterStatus.thunk'
import {launchCodespace} from '../launchCodespace/launchCodespace.thunk'
import {AttachCluster, AttachClusterInput} from './attachCluster'

import {GQL as attachClusterGql} from './attachClusterGql'

export const attachCluster = (input, dispatch) => {
  const gql = {
    ...attachClusterGql,
    variables: {
      ...input
    }
  }
  dispatch(
    setAttachCluster({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const handleClusterActivationError = (_err = null, data = null) => {
    dispatch(
      setSelectedCodespace({
        status: API_STATUS.ERROR,
        data,
        error: {
          message: 'Failed to activate cluster.',
          component: () => (
            <WorkspaceLevelError type={errorTypes.CLUSTER_ACTIVATION_FAILED} />
          )
        }
      })
    )
  }

  gqlRequestTyped<AttachClusterInput, AttachCluster>(gql)
    .then((response) => {
      if (response && response.data && response.data.attachCluster) {
        dispatch(
          setAttachCluster({
            status: API_STATUS.SUCCESS,
            data: response.data.attachCluster,
            error: null
          })
        )
        dispatch(
          setAttachedCluster(
            response.data.attachCluster?.attached_cluster || null
          )
        )

        if (
          response.data.attachCluster.attached_cluster &&
          response.data.attachCluster.attached_cluster.cluster_id &&
          response.data.attachCluster.attached_cluster.cluster_status !==
            'active'
        ) {
          getClusterStatus(
            {
              clusterId: response.data.attachCluster.attached_cluster.cluster_id
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
                  projectId: response.data.attachCluster.project_id,
                  codespaceId: response.data.attachCluster.codespace_id,
                  user: 'test1'
                })
              }
            })
            .catch((err) =>
              handleClusterActivationError(err, response.data.attachCluster)
            )
        }
      } else {
        throw new Error('Failed to attach cluster.')
      }
    })
    .catch((err) => {
      dispatch(
        setAttachCluster({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
