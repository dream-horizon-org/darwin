import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setComputeNodeTypes} from '../actions'
import {GetComputeNodeTypes} from './index'

import {GQL as getComputeNodeTypesGql} from './indexGql'

export const getComputeNodeTypes = (dispatch) => {
  const gql = {
    ...getComputeNodeTypesGql
  }

  dispatch(
    setComputeNodeTypes({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetComputeNodeTypes>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getComputeNodeTypes &&
        response.data.getComputeNodeTypes.status === 'SUCCESS'
      ) {
        dispatch(
          setComputeNodeTypes({
            status: API_STATUS.SUCCESS,
            data: response.data.getComputeNodeTypes.data,
            error: null
          })
        )
      } else {
        dispatch(
          setComputeNodeTypes({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setComputeNodeTypes({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
