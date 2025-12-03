import {gqlRequestTyped} from '../../../../../../utils/gqlRequestTyped'

import {GetMLFlowModelVersions, GetMLFlowModelVersionsInput} from './index'

import {API_STATUS} from '../../../../../../utils/apiUtils'

import {setMLFlowModelVersions} from '../../../../data/actions'

import {GQL as getMLFlowModelVersionsGql} from './indexGql'

export const getMLFlowModelVersionsApi = (
  dispatch,
  payload: GetMLFlowModelVersionsInput
) => {
  const gql = {
    ...getMLFlowModelVersionsGql,
    variables: payload
  }

  if (!payload.modelName) {
    dispatch(
      setMLFlowModelVersions({
        status: API_STATUS.INIT,
        data: null,
        error: null
      })
    )
    return
  }

  dispatch(
    setMLFlowModelVersions({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const gqlResponse = gqlRequestTyped<
    GetMLFlowModelVersionsInput,
    GetMLFlowModelVersions
  >(gql)

  gqlResponse
    .then((response) => {
      const data = response?.data?.getMLFlowModelVersions.model_versions
      if (data) {
        dispatch(
          setMLFlowModelVersions({
            status: API_STATUS.SUCCESS,
            data: data,
            error: null
          })
        )
      } else {
        dispatch(
          setMLFlowModelVersions({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setMLFlowModelVersions({
          status: API_STATUS.ERROR,
          data: null,
          error: error
        })
      )
    })
}
