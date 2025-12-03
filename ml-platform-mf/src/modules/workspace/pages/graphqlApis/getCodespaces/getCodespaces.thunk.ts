import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setCodespaces} from '../../actions'
import {GetCodespaces} from './getCodespaces'

import {GQL as getCodespacesGql} from './getCodespacesGql'

export const getCodespaces = (dispatch, payload) => {
  const gql = {
    ...getCodespacesGql,
    variables: payload
  }

  dispatch(
    setCodespaces({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetCodespaces>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getCodespaces &&
        response.data.getCodespaces.data
      ) {
        dispatch(
          setCodespaces({
            status: API_STATUS.SUCCESS,
            data: response.data.getCodespaces.data,
            error: null
          })
        )
      } else {
        dispatch(
          setCodespaces({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setCodespaces({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
