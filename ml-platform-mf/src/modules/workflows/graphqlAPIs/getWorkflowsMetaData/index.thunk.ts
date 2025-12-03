import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'

import {GetWorkflowsMetaData, GetWorkflowsMetaDataInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {setWorkflowsMetaData} from '../../pages/workflowDetails/actions'
import {GQL as getWorkflowsMetaDataGql} from './indexGql'

export const getWorkflowsMetaData = (
  dispatch,
  payload: GetWorkflowsMetaDataInput
) => {
  const gql = {
    ...getWorkflowsMetaDataGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    GetWorkflowsMetaDataInput,
    GetWorkflowsMetaData
  >(gql)

  dispatch(
    setWorkflowsMetaData({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getWorkflowsMetaData &&
        response.data.getWorkflowsMetaData.data
      ) {
        dispatch(
          setWorkflowsMetaData({
            status: API_STATUS.SUCCESS,
            data: response?.data?.getWorkflowsMetaData?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowsMetaData({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setWorkflowsMetaData({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
