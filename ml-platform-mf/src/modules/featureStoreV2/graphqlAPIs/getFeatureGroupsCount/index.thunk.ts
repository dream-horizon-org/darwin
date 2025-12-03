import {ApiStatus} from '../../../../gql-enums/api-status.enum'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setFeatureGroupsCount} from '../../pages/featureStoreGroups/actions'
import {GetFeatureGroupsCount, GetFeatureGroupsCountInput} from './index'
import {GQL as getFeatureGroupsCountGql} from './indexGql'

export const getFeatureGroupsCount = (
  dispatch,
  payload: GetFeatureGroupsCountInput
) => {
  const gql = {
    ...getFeatureGroupsCountGql,
    variables: payload
  }

  dispatch(
    setFeatureGroupsCount({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const gqlResponse = gqlRequestTyped<null, GetFeatureGroupsCount>(gql)

  gqlResponse
    .then((response) => {
      if (response.data.getFeatureGroupsCount.status === ApiStatus.SUCCESS) {
        dispatch(
          setFeatureGroupsCount({
            status: API_STATUS.SUCCESS,
            data: response.data.getFeatureGroupsCount.data,
            error: null
          })
        )
      } else {
        dispatch(
          setFeatureGroupsCount({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setFeatureGroupsCount({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
