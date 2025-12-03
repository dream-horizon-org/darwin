import {API_STATUS, GRAPHQL_API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setUniqueLink} from '../../actions'
import {CheckUniqueLink, CheckUniqueLinkInput} from './checkUniqueLink'

import {GQL as checkUniqueLinkGql} from './checkUniqueLinkGql'

export const checkUniqueLink = (dispatch, variables: CheckUniqueLinkInput) => {
  const gql = {
    ...checkUniqueLinkGql,
    variables
  }
  dispatch(
    setUniqueLink({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlRequestTyped<CheckUniqueLinkInput, CheckUniqueLink>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.checkUniqueLink &&
        response.data.checkUniqueLink.status === GRAPHQL_API_STATUS.SUCCESS
      ) {
        dispatch(
          setUniqueLink({
            status: API_STATUS.SUCCESS,
            data: response.data.checkUniqueLink.data,
            error: null
          })
        )
      } else {
        dispatch(
          setUniqueLink({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setUniqueLink({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
