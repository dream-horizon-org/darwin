import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setProjectCodespaces} from '../../pages/workflows/actions'
import {GetCodespaces, GetCodespacesInput} from './getCodespaces'

import {GQL as getCodespacesGql} from './getCodespacesGql'

export const getCodespaces = (dispatch, payload: GetCodespacesInput) => {
  const gql = {
    ...getCodespacesGql,
    variables: payload
  }

  dispatch(
    setProjectCodespaces({
      status: API_STATUS.LOADING,
      data: null,
      error: null,
      projectId: payload.projectId
    })
  )

  gqlRequestTyped<GetCodespacesInput, GetCodespaces>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getCodespaces &&
        response.data.getCodespaces.data
      ) {
        dispatch(
          setProjectCodespaces({
            status: API_STATUS.SUCCESS,
            data: response.data.getCodespaces.data,
            error: null,
            projectId: payload.projectId
          })
        )
      } else {
        dispatch(
          setProjectCodespaces({
            status: API_STATUS.ERROR,
            data: null,
            error: null,
            projectId: payload.projectId
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setProjectCodespaces({
          status: API_STATUS.ERROR,
          data: null,
          error: null,
          projectId: payload.projectId
        })
      )
    })
}
