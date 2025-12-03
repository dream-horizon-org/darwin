import {Workspaces} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setAllWorkspaces} from '../../pages/workflows/actions'
import {GQL as getAllWorkspacesGql} from './indexGql'

export const getAllWorkspaces = (dispatch) => {
  const gql = {
    ...getAllWorkspacesGql
  }

  const gqlResponse = gqlRequestTyped<null, Workspaces>(gql)

  dispatch(
    setAllWorkspaces({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.workspaces?.data) {
        dispatch(
          setAllWorkspaces({
            status: API_STATUS.SUCCESS,
            data: response?.data?.workspaces?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setAllWorkspaces({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setAllWorkspaces({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
