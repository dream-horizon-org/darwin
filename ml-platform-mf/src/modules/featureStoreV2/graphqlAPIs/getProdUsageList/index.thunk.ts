import {ApiStatus} from '../../../../gql-enums/api-status.enum'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {
  setFeaturs,
  setProdUsageList
} from '../../pages/featureStoreGroupDetails/actions'
import {setFeatureGroups} from '../../pages/featureStoreGroups/actions'
import {GetProdUsageList, GetProdUsageListInput} from './index'

import {GQL as getFeatureGroupsGql} from './indexGql'

export const getProdUsageList = (dispatch, payload: GetProdUsageListInput) => {
  const gql = {
    ...getFeatureGroupsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetProdUsageListInput, GetProdUsageList>(
    gql
  )

  dispatch(
    setProdUsageList({
      status: API_STATUS.LOADING,
      data: [],
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data.getProdUsageList.status === ApiStatus.SUCCESS) {
        dispatch(
          setProdUsageList({
            status: API_STATUS.SUCCESS,
            data: [...response.data.getProdUsageList.data],
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setProdUsageList({
          status: API_STATUS.ERROR,
          data: [],
          error: null
        })
      )
    })
}
