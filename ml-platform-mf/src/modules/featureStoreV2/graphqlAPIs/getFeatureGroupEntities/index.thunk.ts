import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {GetFeatureGroupEntities, GetFeatureGroupEntitiesInput} from './index'

import {API_STATUS} from '../../../../utils/apiUtils'
import {setFeatureGroupEntities} from '../../pages/featureStoreGroupDetails/actions'
import {GQL as getFeatureGroupEntitiesGql} from './indexGql'

export const getFeatureGroupEntities = (
  dispatch,
  payload: GetFeatureGroupEntitiesInput
) => {
  const gql = {
    ...getFeatureGroupEntitiesGql,
    variables: payload
  }

  dispatch(
    setFeatureGroupEntities({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<GetFeatureGroupEntitiesInput, GetFeatureGroupEntities>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getFeatureGroupEntities &&
        response.data.getFeatureGroupEntities.status === 'SUCCESS'
      ) {
        dispatch(
          setFeatureGroupEntities({
            status: API_STATUS.SUCCESS,
            data: response.data.getFeatureGroupEntities.data,
            error: null
          })
        )
      } else {
        dispatch(
          setFeatureGroupEntities({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setFeatureGroupEntities({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
