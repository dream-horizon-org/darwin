import {UpdateJobClusterDefinition, UpdateJobClusterDefinitionInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setUpdateJobClusterDefinition} from '../../pages/workflows/actions'
import {GQL} from './indexGql'

export const updateJobClusterDefinition = (
  dispatch,
  payload: UpdateJobClusterDefinitionInput
) => {
  const gql = {
    ...GQL,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    UpdateJobClusterDefinitionInput,
    UpdateJobClusterDefinition
  >(gql)

  dispatch(
    setUpdateJobClusterDefinition({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlResponse
    .then((response) => {
      if (response?.data?.updateJobClusterDefinition?.data) {
        dispatch(
          setUpdateJobClusterDefinition({
            status: API_STATUS.SUCCESS,
            data: response.data.updateJobClusterDefinition.data,
            error: null
          })
        )
      } else {
        throw new Error('No data found')
      }
    })
    .catch((err) => {
      dispatch(
        setUpdateJobClusterDefinition({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
