import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setStartSparkHistoryServer} from '../actions'
import {StartSparkHistoryServer, StartSparkHistoryServerInput} from './index'

import {GQL as startSparkHistoryServerGql} from './indexGql'

export const startSparkHistoryServer = (
  dispatch,
  payload: StartSparkHistoryServerInput
) => {
  const gql = {
    ...startSparkHistoryServerGql,
    variables: payload
  }

  dispatch(
    setStartSparkHistoryServer({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const gqlRequest = gqlRequestTyped<
    StartSparkHistoryServerInput,
    StartSparkHistoryServer
  >(gql)

  gqlRequest
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.startSparkHistoryServer &&
        response.data.startSparkHistoryServer.data
      ) {
        dispatch(
          setStartSparkHistoryServer({
            status: API_STATUS.SUCCESS,
            data: response.data.startSparkHistoryServer.data,
            error: null
          })
        )
      } else {
        dispatch(
          setStartSparkHistoryServer({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setStartSparkHistoryServer({
          status: API_STATUS.ERROR,
          data: null,
          error: error
        })
      )
    })
}
