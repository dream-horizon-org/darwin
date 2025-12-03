import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setGetAllClusters} from '../../actions'
import {
  GetAllClusters,
  GetAllClustersInput,
  SelectionOnGetAllClusters
} from './getAllClusters'

import {GQL as getAllClustersGql} from './getAllClustersGql'

export const getAllClusters = (
  dispatch,
  payload: GetAllClustersInput,
  preLoadedData: SelectionOnGetAllClusters['data'],
  resultSize: SelectionOnGetAllClusters['resultSize']
) => {
  const gql = {
    ...getAllClustersGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetAllClustersInput, GetAllClusters>(gql)

  dispatch(
    setGetAllClusters({
      status: API_STATUS.LOADING,
      data: [...preLoadedData],
      error: null,
      pageSize: null,
      offset: null,
      resultSize: resultSize,
      cancel: gqlResponse.cancel
    })
  )
  gqlResponse
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getAllClusters &&
        response.data.getAllClusters.data
      ) {
        dispatch(
          setGetAllClusters({
            status: API_STATUS.SUCCESS,
            data: [...preLoadedData, ...response.data.getAllClusters.data],
            error: null,
            pageSize: response.data.getAllClusters.pageSize,
            offset: response.data.getAllClusters.offset,
            resultSize: response.data.getAllClusters.resultSize
          })
        )
      } else {
        dispatch(
          setGetAllClusters({
            status: API_STATUS.ERROR,
            data: [...preLoadedData],
            error: null,
            pageSize: null,
            offset: null,
            resultSize: resultSize
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setGetAllClusters({
          status: API_STATUS.INIT,
          data: [...preLoadedData],
          error: null,
          pageSize: null,
          offset: null,
          resultSize: resultSize
        })
      )
    })
}
