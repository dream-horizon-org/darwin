import {ApiStatus} from '../../../../gql-enums/api-status.enum'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setFeatureGroupFilters} from '../../pages/featureStoreGroups/actions'
import {GetFeatureGroupFilters, GetFeatureGroupFiltersInput} from './index'

import {GQL as getFeatureGroupFiltersGql} from './indexGql'

export const getFeatureGroupFilters = (dispatch, payload = {}) => {
  const gql = {
    ...getFeatureGroupFiltersGql,
    variables: payload
  }

  dispatch(
    setFeatureGroupFilters({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<GetFeatureGroupFiltersInput, GetFeatureGroupFilters>(gql)
    .then((response) => {
      if (response.data.getFeatureGroupFilters.status === ApiStatus.SUCCESS) {
        dispatch(
          setFeatureGroupFilters({
            status: API_STATUS.SUCCESS,
            data: response.data.getFeatureGroupFilters.data,
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setFeatureGroupFilters({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
