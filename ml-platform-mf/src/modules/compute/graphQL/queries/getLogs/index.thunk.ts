import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setLogs} from '../../../pages/graphqlApis/actions'
import {GetLogs, GetLogsInput} from './index'
import {GQL as getLogsGql} from './indexGql'

export const getLogs = (dispatch, data: GetLogsInput) => {
  const gql = {
    ...getLogsGql,
    variables: data
  }

  const gqlRequest = gqlRequestTyped<GetLogsInput, GetLogs>(gql)

  dispatch(
    setLogs({
      status: API_STATUS.LOADING,
      data: null,
      error: null,
      cancel: gqlRequest.cancel
    })
  )

  gqlRequest
    .then((response) => {
      if (response && response.data && response.data.getLogs) {
        dispatch(
          setLogs({
            status: API_STATUS.SUCCESS,
            data: response.data.getLogs.data,
            error: null,
            cancel: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setLogs({
          status: API_STATUS.ERROR,
          data: null,
          error: null,
          cancel: null
        })
      )
    })
}
