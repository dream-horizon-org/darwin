import {API_STATUS, GRAPHQL_API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setEnvironment} from '../../actions'

import {GetDataSourceEnvironments} from './getDataSourceEnvironments'
import {GQL as getDataSourceEnvironmentsGql} from './getDataSourceEnvironmentsGql'

export const getDataSourceEnvironments = (dispatch) => {
  const gql = {
    ...getDataSourceEnvironmentsGql
  }

  dispatch(
    setEnvironment({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<{}, GetDataSourceEnvironments>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getDataSourceEnvironments &&
        response.data.getDataSourceEnvironments.status ===
          GRAPHQL_API_STATUS.SUCCESS
      ) {
        dispatch(
          setEnvironment({
            status: API_STATUS.SUCCESS,
            data: response.data.getDataSourceEnvironments.data,
            error: null
          })
        )
      } else {
        setEnvironment({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      }
    })
    .catch((err) => {
      setEnvironment({
        status: API_STATUS.ERROR,
        data: null,
        error: err
      })
    })
}
