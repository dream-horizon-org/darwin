import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {
  ValidateModelDeploymentName,
  ValidateModelDeploymentNameInput
} from './index'

import {API_STATUS} from '../../../../../utils/apiUtils'
import {setValidateModelDeploymentName} from '../../../data/actions'
import {GQL as validateModelDeploymentNameGql} from './indexGql'

export const setModelDeploymentName = (
  dispatch,
  payload: ValidateModelDeploymentNameInput
) => {
  dispatch(
    setValidateModelDeploymentName({
      status: API_STATUS.SUCCESS,
      data: payload,
      error: null
    })
  )
}

export const validateModelDeploymentName = (
  dispatch,
  payload: ValidateModelDeploymentNameInput
) => {
  const gql = {
    ...validateModelDeploymentNameGql,
    variables: payload
  }
  if (!payload.deploymentName) {
    dispatch(
      setValidateModelDeploymentName({
        status: API_STATUS.INIT,
        data: null,
        error: null
      })
    )
    return
  }

  dispatch(
    setValidateModelDeploymentName({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  const gqlResponse = gqlRequestTyped<
    ValidateModelDeploymentNameInput,
    ValidateModelDeploymentName
  >(gql)

  gqlResponse
    .then((response) => {
      const data = response?.data?.validateModelDeploymentName.data.unique
      if (data) {
        dispatch(
          setValidateModelDeploymentName({
            status: API_STATUS.SUCCESS,
            data: {
              deploymentName: payload.deploymentName
            },
            error: null
          })
        )
      } else {
        dispatch(
          setValidateModelDeploymentName({
            status: API_STATUS.ERROR,
            data: null,
            error: response?.errors
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setValidateModelDeploymentName({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
