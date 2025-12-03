import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {
  createProject as createProjectFun,
  setAttachedCluster,
  setSelectedCodespace
} from '../../actions'
import {getClusterStatus} from '../getClusterStatus/getClusterStatus.thunk'
import {launchCodespace} from '../launchCodespace/launchCodespace.thunk'
import {CreateProject} from './createProject'

import {GQL as createProjectGql} from './createProjectGql'

export const createProject = (dispatch, payload) => {
  const gql = {
    ...createProjectGql,
    variables: payload
  }

  dispatch(
    createProjectFun({
      status: API_STATUS.LOADING
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

  gqlRequestTyped<null, CreateProject>(gql)
    .then((response) => {
      if (response && response.data && response.data.createProject) {
        dispatch(
          createProjectFun({
            status: API_STATUS.SUCCESS
          })
        )

        dispatch(
          setSelectedCodespace({
            status: API_STATUS.SUCCESS,
            data: response.data.createProject,
            error: null
          })
        )

        dispatch(
          setAttachedCluster(
            response.data.createProject.attached_cluster || null
          )
        )

        if (
          response.data.createProject.attached_cluster &&
          response.data.createProject.attached_cluster.cluster_status !==
            'active'
        ) {
          getClusterStatus(
            {
              clusterId: response.data.createProject.attached_cluster.cluster_id
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
                projectId: response.data.createProject.project_id,
                codespaceId: response.data.createProject.codespace_id,
                user: 'test1'
              })
            }
          })
        }
      } else {
        throw new Error('Failed creating project!')
      }
    })
    .catch((err) => {
      dispatch(
        createProjectFun({
          status: API_STATUS.ERROR
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
