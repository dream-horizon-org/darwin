import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeLimits} from '../actions'
import {GetComputeLimits} from './getComputeLimits'

import {GQL as getComputeLimitsGql} from './getComputeLimitsGql'

export const getComputeLimits = (dispatch) => {
  const gql = {
    ...getComputeLimitsGql
  }

  dispatch(
    setComputeLimits({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetComputeLimits>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getComputeLimits &&
        response.data.getComputeLimits.status === 'SUCCESS'
      ) {
        dispatch(
          setComputeLimits({
            status: API_STATUS.SUCCESS,
            data: response.data.getComputeLimits.data,
            error: null
          })
        )
      } else {
        dispatch(
          setComputeLimits({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setComputeLimits({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
