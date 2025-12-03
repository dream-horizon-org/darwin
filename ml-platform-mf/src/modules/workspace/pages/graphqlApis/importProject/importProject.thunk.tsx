import React from 'react'
import {errorTypes} from '../../../../../components/workspace/workspaceLevelError/constants'
import WorkspaceLevelError from '../../../../../components/workspace/workspaceLevelError/workspaceLevelError'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {
  setAttachedCluster,
  setImportProject,
  setSelectedCodespace
} from '../../actions'
import {getClusterStatus} from '../getClusterStatus/getClusterStatus.thunk'
import {launchCodespace} from '../launchCodespace/launchCodespace.thunk'
import {ImportProject} from './importProject'

import {GQL as importProjectGql} from './importProjectGql'

export const importProject = (dispatch, data) => {
  const gql = {
    ...importProjectGql,
    variables: data
  }

  dispatch(
    setImportProject({
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

  gqlRequestTyped<null, ImportProject>(gql)
    .then((response) => {
      if (response && response.data && response.data.importProject) {
        if (response.data.importProject.attached_cluster) {
          dispatch(
            setImportProject({
              status: API_STATUS.SUCCESS,
              data: response.data.importProject,
              error: null
            })
          )

          dispatch(
            setSelectedCodespace({
              status: API_STATUS.SUCCESS,
              data: response.data.importProject,
              error: null
            })
          )

          dispatch(
            setAttachedCluster(response.data.importProject?.attached_cluster)
          )

          if (
            response.data.importProject.attached_cluster &&
            response.data.importProject.attached_cluster.cluster_status !==
              'active'
          ) {
            getClusterStatus(
              {
                clusterId:
                  response.data.importProject.attached_cluster.cluster_id
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
                  projectId: response.data.importProject.project_id,
                  codespaceId: response.data.importProject.codespace_id,
                  user: 'test1'
                })
              }
            })
          }
        } else {
          dispatch(
            setSelectedCodespace({
              status: API_STATUS.ERROR,
              data: null,
              error: {
                message:
                  'Project imported successfully but failed to attach a cluster.',
                component: () => (
                  <WorkspaceLevelError type={errorTypes.NO_CLUSTER} />
                )
              }
            })
          )
          dispatch(setAttachedCluster(null))
        }
      } else {
        dispatch(
          setImportProject({
            status: API_STATUS.ERROR,
            data: null,
            error: null
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
      }
    })
    .catch((err) => {
      dispatch(
        setImportProject({
          status: API_STATUS.ERROR,
          data: null,
          error: null
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
    })
}
