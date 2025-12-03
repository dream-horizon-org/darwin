import {API_STATUS, GRAPHQL_API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setSampleDataForDataSource} from '../../actions'

import {
  GetSampleDataForDataSource,
  GetSampleDataForDataSourceInput
} from './getSampleDataForDataSource'
import {GQL as getSampleDataForDataSourceGql} from './getSampleDataForDataSourceGql'

export const getSampleDataForDataSource = (dispatch, data) => {
  const gql = {
    ...getSampleDataForDataSourceGql,
    variables: data
  }

  dispatch(
    setSampleDataForDataSource({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<GetSampleDataForDataSourceInput, GetSampleDataForDataSource>(
    gql
  )
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getSampleDataForDataSource &&
        response.data.getSampleDataForDataSource.status ===
          GRAPHQL_API_STATUS.SUCCESS
      ) {
        dispatch(
          setSampleDataForDataSource({
            status: API_STATUS.SUCCESS,
            data: response.data.getSampleDataForDataSource.data,
            error: null
          })
        )
      } else {
        setSampleDataForDataSource({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      }
    })
    .catch((err) => {
      setSampleDataForDataSource({
        status: API_STATUS.ERROR,
        data: null,
        error: err
      })
    })
}
