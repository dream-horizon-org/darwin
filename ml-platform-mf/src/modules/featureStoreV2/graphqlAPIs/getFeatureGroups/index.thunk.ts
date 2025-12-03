import {ApiStatus} from '../../../../gql-enums/api-status.enum'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setFeatureGroups} from '../../pages/featureStoreGroups/actions'
import {GetFeatureGroups, GetFeatureGroupsInput} from './index'

import {GQL as getFeatureGroupsGql} from './indexGql'

export const getFeatureGroups = (
  dispatch,
  payload: GetFeatureGroupsInput,
  preLoadedData: GetFeatureGroups['getFeatureGroups']['data']
) => {
  const gql = {
    ...getFeatureGroupsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetFeatureGroupsInput, GetFeatureGroups>(
    gql
  )

  dispatch(
    setFeatureGroups({
      status: API_STATUS.LOADING,
      data: [...preLoadedData],
      error: null,
      totalRecordsCount: null,
      cancel: gqlResponse.cancel
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data.getFeatureGroups.status === ApiStatus.SUCCESS) {
        dispatch(
          setFeatureGroups({
            status: API_STATUS.SUCCESS,
            data: [...preLoadedData, ...response.data.getFeatureGroups.data],
            error: null,
            totalRecordsCount: response.data.getFeatureGroups.totalRecordsCount
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setFeatureGroups({
          status: API_STATUS.ERROR,
          data: [...preLoadedData],
          error: null,
          totalRecordsCount: null
        })
      )
    })
}
