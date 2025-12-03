import {ApiStatus} from '../../../../gql-enums/api-status.enum'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setFeaturs} from '../../pages/featureStoreGroupDetails/actions'
import {GetFeatures, GetFeaturesInput} from './index'

import {GQL as getFeatureGroupsGql} from './indexGql'

export const getFeatures = (
  dispatch,
  payload: GetFeaturesInput,
  preLoadedData: GetFeatures['getFeatures']['data']
) => {
  const gql = {
    ...getFeatureGroupsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetFeaturesInput, GetFeatures>(gql)

  dispatch(
    setFeaturs({
      status: API_STATUS.LOADING,
      data: [...preLoadedData],
      error: null,
      totalRecordsCount: null,
      cancel: gqlResponse.cancel
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data.getFeatures.status === ApiStatus.SUCCESS) {
        dispatch(
          setFeaturs({
            status: API_STATUS.SUCCESS,
            data: [...preLoadedData, ...response.data.getFeatures.data],
            error: null,
            totalRecordsCount: response.data.getFeatures.totalRecordsCount
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setFeaturs({
          status: API_STATUS.ERROR,
          data: [...preLoadedData],
          error: null,
          totalRecordsCount: null
        })
      )
    })
}
