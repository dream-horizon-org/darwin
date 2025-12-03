import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setAllProjects} from '../../pages/workflows/actions'
import {GetProjects, GetProjectsInput} from './getProjects'

import {GQL as getProjectsGql} from './getProjectsGql'

export const getProjects = (dispatch, payload: GetProjectsInput) => {
  const gql = {
    ...getProjectsGql,
    variables: payload
  }

  dispatch(
    setAllProjects({
      status: API_STATUS.LOADING,
      data: null,
      error: null,
      workspaceId: payload.user
    })
  )

  gqlRequestTyped<GetProjectsInput, GetProjects>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getProjects &&
        response.data.getProjects.data
      ) {
        dispatch(
          setAllProjects({
            status: API_STATUS.SUCCESS,
            data: response.data.getProjects.data,
            error: null,
            workspaceId: payload.user
          })
        )
      } else {
        dispatch(
          setAllProjects({
            status: API_STATUS.ERROR,
            data: null,
            error: null,
            workspaceId: payload.user
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setAllProjects({
          status: API_STATUS.ERROR,
          data: null,
          error: null,
          workspaceId: payload.user
        })
      )
    })
}
