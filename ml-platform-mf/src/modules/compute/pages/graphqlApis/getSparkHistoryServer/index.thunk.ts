import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setSparkHistoryServer} from '../actions'
import {IComputeState} from '../reducer'
import {GetSparkHistoryServer, GetSparkHistoryServerInput} from './index'

import {GQL as getSparkHistoryServerGql} from './indexGql'

export const getSparkHistoryServer = (
  dispatch,
  payload: GetSparkHistoryServerInput
) => {
  const gql = {
    ...getSparkHistoryServerGql,
    variables: payload
  }

  dispatch(
    setSparkHistoryServer({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const gqlRequest = gqlRequestTyped<
    GetSparkHistoryServerInput,
    GetSparkHistoryServer
  >(gql)

  gqlRequest
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getSparkHistoryServer &&
        response.data.getSparkHistoryServer.data
      ) {
        dispatch(
          setSparkHistoryServer({
            status: API_STATUS.SUCCESS,
            data: response.data.getSparkHistoryServer.data,
            error: null
          })
        )
      } else {
        dispatch(
          setSparkHistoryServer({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setSparkHistoryServer({
          status: API_STATUS.ERROR,
          data: null,
          error: error
        })
      )
    })
}
