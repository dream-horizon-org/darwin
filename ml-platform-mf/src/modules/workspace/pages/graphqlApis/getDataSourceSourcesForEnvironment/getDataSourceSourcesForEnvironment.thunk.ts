import {API_STATUS, GRAPHQL_API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setSourcesForEnvironment} from '../../actions'

import {
  GetDataSourceSourcesForEnvironment,
  GetDataSourceSourcesForEnvironmentInput
} from './getDataSourceSourcesForEnvironment'
import {GQL as getDataSourceSourcesForEnvironmentGql} from './getDataSourceSourcesForEnvironmentGql'

export const getDataSourceSourcesForEnvironment = (dispatch, data) => {
  const gql = {
    ...getDataSourceSourcesForEnvironmentGql,
    variables: data
  }

  dispatch(
    setSourcesForEnvironment({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<
    GetDataSourceSourcesForEnvironmentInput,
    GetDataSourceSourcesForEnvironment
  >(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getDataSourceSourcesForEnvironment &&
        response.data.getDataSourceSourcesForEnvironment.status ===
          GRAPHQL_API_STATUS.SUCCESS
      ) {
        dispatch(
          setSourcesForEnvironment({
            status: API_STATUS.SUCCESS,
            data: response.data.getDataSourceSourcesForEnvironment.data,
            error: null
          })
        )
      } else {
        setSourcesForEnvironment({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      }
    })
    .catch((err) => {
      setSourcesForEnvironment({
        status: API_STATUS.ERROR,
        data: null,
        error: err
      })
    })
}
