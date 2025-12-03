import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {GetFeatureGroupRuns, GetFeatureGroupRunsInput} from './index'

import {API_STATUS} from '../../../../utils/apiUtils'
import {setFeatureGroupRuns} from '../../pages/featureStoreGroupDetails/actions'
import {GQL as getFeatureGroupRunsGql} from './indexGql'

export const getFeatureGroupRuns = (
  dispatch,
  payload: GetFeatureGroupRunsInput
) => {
  const gql = {
    ...getFeatureGroupRunsGql,
    variables: payload
  }

  dispatch(
    setFeatureGroupRuns({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<GetFeatureGroupRunsInput, GetFeatureGroupRuns>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getFeatureGroupRuns &&
        response.data.getFeatureGroupRuns.status === 'SUCCESS'
      ) {
        dispatch(
          setFeatureGroupRuns({
            status: API_STATUS.SUCCESS,
            data: response.data.getFeatureGroupRuns.data,
            error: null
          })
        )
      } else {
        dispatch(
          setFeatureGroupRuns({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setFeatureGroupRuns({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
