import {gqlRequestTyped} from '../../../../../../utils/gqlRequestTyped'

import {GetMLFlowRegisteredModels} from './index'

import {API_STATUS} from '../../../../../../utils/apiUtils'

import {setMLFlowRegisteredModels} from '../../../../data/actions'

import {GQL as getMLFlowRegisteredModelsGql} from './indexGql'

export const getMLFlowRegisteredModelsApi = (dispatch) => {
  const gql = {
    ...getMLFlowRegisteredModelsGql
  }

  dispatch(
    setMLFlowRegisteredModels({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const gqlResponse = gqlRequestTyped<null, GetMLFlowRegisteredModels>(gql)

  gqlResponse
    .then((response) => {
      const data = response?.data?.getMLFlowRegisteredModels.registered_models
      if (data) {
        dispatch(
          setMLFlowRegisteredModels({
            status: API_STATUS.SUCCESS,
            data: data,
            error: null
          })
        )
      } else {
        dispatch(
          setMLFlowRegisteredModels({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setMLFlowRegisteredModels({
          status: API_STATUS.ERROR,
          data: null,
          error: error
        })
      )
    })
}
