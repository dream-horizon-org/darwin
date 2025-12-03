import {API_STATUS, GRAPHQL_API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setUniqueCodespace} from '../../actions'
import {
  CheckUniqueCodespace,
  CheckUniqueCodespaceInput
} from './checkUniqueCodespace'

import {GQL as checkUniqueCodespaceGql} from './checkUniqueCodespaceGql'

export const checkUniqueCodespace = (
  dispatch,
  variables: CheckUniqueCodespaceInput
) => {
  const gql = {
    ...checkUniqueCodespaceGql,
    variables
  }
  dispatch(
    setUniqueCodespace({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlRequestTyped<CheckUniqueCodespaceInput, CheckUniqueCodespace>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.checkUniqueCodespace &&
        response.data.checkUniqueCodespace.status === GRAPHQL_API_STATUS.SUCCESS
      ) {
        dispatch(
          setUniqueCodespace({
            status: API_STATUS.SUCCESS,
            data: response.data.checkUniqueCodespace.data,
            error: null
          })
        )
      } else {
        dispatch(
          setUniqueCodespace({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setUniqueCodespace({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
