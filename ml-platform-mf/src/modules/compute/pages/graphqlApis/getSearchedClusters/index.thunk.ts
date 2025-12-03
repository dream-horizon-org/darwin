import {
  GetSearchedClusters,
  GetSearchedClustersInput,
  SelectionOnGetSearchedClusters
} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setClusters} from '../actions'

import {GQL as getSearchedClustersGql} from './indexGql'

export const getSearchedClusters = (
  dispatch,
  payload: GetSearchedClustersInput,
  prevData: SelectionOnGetSearchedClusters
) => {
  const gql = {
    ...getSearchedClustersGql,
    variables: payload
  }

  const gqlRequest = gqlRequestTyped<null, GetSearchedClusters>(gql)

  dispatch(
    setClusters({
      status: API_STATUS.LOADING,
      data: prevData ? prevData : null,
      error: null,
      cancel: gqlRequest.cancel
    })
  )

  gqlRequest
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getSearchedClusters &&
        response.data.getSearchedClusters.data
      ) {
        dispatch(
          setClusters({
            status: API_STATUS.SUCCESS,
            data: prevData
              ? {
                  ...response.data.getSearchedClusters,
                  data: [
                    ...prevData.data,
                    ...response.data.getSearchedClusters.data
                  ]
                }
              : response.data.getSearchedClusters,
            error: null,
            cancel: null
          })
        )
      } else {
        dispatch(
          setClusters({
            status: API_STATUS.ERROR,
            data: null,
            error: null,
            cancel: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setClusters({
          status: API_STATUS.INIT,
          data: null,
          error: err,
          cancel: null
        })
      )
    })
}
