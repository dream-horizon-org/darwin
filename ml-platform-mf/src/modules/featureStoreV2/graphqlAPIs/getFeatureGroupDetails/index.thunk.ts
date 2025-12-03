import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {ApiStatus} from '../../../../gql-enums/api-status.enum'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setFeatureGroupDetails} from '../../pages/featureStoreGroupDetails/actions'
import {GetFeatureGroupDetails, GetFeatureGroupDetailsInput} from './index'

import {GQL as getFeatureGroupsGql} from './indexGql'

export const getFeatureGroupDetails = (
  dispatch,
  payload: GetFeatureGroupDetailsInput
) => {
  const gql = {
    ...getFeatureGroupsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    GetFeatureGroupDetailsInput,
    GetFeatureGroupDetails
  >(gql)

  dispatch(
    setFeatureGroupDetails({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data.getFeatureGroupDetails.status === ApiStatus.SUCCESS) {
        dispatch(
          setFeatureGroupDetails({
            status: API_STATUS.SUCCESS,
            data: response.data.getFeatureGroupDetails.data,
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setFeatureGroupDetails({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )

      dispatch(
        setGlobalSnackBar({
          message: 'Failed to fetch feature group details!',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
