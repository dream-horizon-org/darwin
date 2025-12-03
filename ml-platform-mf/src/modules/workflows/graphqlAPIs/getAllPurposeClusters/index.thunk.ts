import {GetAllClusters, GetAllClustersInput, SelectionOnGetAllClusters} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setAllPurposeClusters} from '../../pages/workflowCreate/actions'
import {GQL as getAllPurposeClustersGql} from './indexGql'

export const getAllPurposeClusters = (
  dispatch,
  payload: GetAllClustersInput,
  prevData: SelectionOnGetAllClusters
) => {
  const gql = {
    ...getAllPurposeClustersGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetAllClustersInput, GetAllClusters>(gql)

  dispatch(
    setAllPurposeClusters({
      status: API_STATUS.LOADING,
      data: prevData,
      error: null,
      cancel: gqlResponse.cancel
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.getAllClusters?.data) {
        if (prevData?.data) {
          dispatch(
            setAllPurposeClusters({
              status: API_STATUS.SUCCESS,
              data: {
                ...response.data.getAllClusters,
                data: [...prevData.data, ...response.data.getAllClusters.data]
              },
              error: null,
              cancel: null
            })
          )
        } else {
          dispatch(
            setAllPurposeClusters({
              status: API_STATUS.SUCCESS,
              data: {
                ...response.data.getAllClusters,
                data: [...response.data.getAllClusters.data]
              },
              error: null,
              cancel: null
            })
          )
        }
      } else {
        dispatch(
          setAllPurposeClusters({
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
        setAllPurposeClusters({
          status: API_STATUS.ERROR,
          data: null,
          error: err,
          cancel: null
        })
      )
    })
}
