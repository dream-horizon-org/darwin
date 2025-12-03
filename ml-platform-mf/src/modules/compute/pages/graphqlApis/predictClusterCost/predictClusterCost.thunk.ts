import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setPredictClusterCost} from '../actions'
import {PredictClusterCost, PredictClusterCostInput} from './predictClusterCost'
import {GQL as predictClusterCostGQL} from './predictClusterCostGql'

export const predictClusterCost = (
  dispatch,
  payload: PredictClusterCostInput
) => {
  const gql = {
    ...predictClusterCostGQL,
    variables: payload
  }
  const gqlResponse = gqlRequestTyped<
    PredictClusterCostInput,
    PredictClusterCost
  >(gql)

  dispatch(
    setPredictClusterCost({
      status: API_STATUS.LOADING,
      data: null,
      error: null,
      cancel: gqlResponse.cancel
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.predictClusterCost?.data) {
        dispatch(
          setPredictClusterCost({
            status: API_STATUS.SUCCESS,
            data: response.data.predictClusterCost.data,
            error: null,
            cancel: null
          })
        )
      } else {
        dispatch(
          setPredictClusterCost({
            status: API_STATUS.ERROR,
            data: null,
            error: 'Predicted cluster cost not found',
            cancel: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setPredictClusterCost({
          status: API_STATUS.ERROR,
          data: null,
          error:
            err.message || 'An error occurred while predicting cluster cost',
          cancel: null
        })
      )
    })
}
