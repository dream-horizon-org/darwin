import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setGetAllClusters, setLastSyncTime} from '../../actions'
import {
  GetLastSyncedTimeForCodespace,
  GetLastSyncedTimeForCodespaceInput
} from './getLastSyncTime'

import {GQL as getLastSyncTimeGql} from './getLastSyncTimeGql'

export const getLastSyncTime = (dispatch, input) => {
  const gql = {
    ...getLastSyncTimeGql,
    variables: {
      ...input
    }
  }
  dispatch(
    setLastSyncTime({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlRequestTyped<
    GetLastSyncedTimeForCodespaceInput,
    GetLastSyncedTimeForCodespace
  >(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getLastSyncedTimeForCodespace &&
        (response.data.getLastSyncedTimeForCodespace.status === 'SUCCESS' ||
          response.data.getLastSyncedTimeForCodespace.status === 'Hello World')
      ) {
        dispatch(
          setLastSyncTime({
            status: API_STATUS.SUCCESS,
            data: response.data.getLastSyncedTimeForCodespace.data
              .last_synced_time,
            error: null
          })
        )
      } else {
        dispatch(
          setLastSyncTime({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setLastSyncTime({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
