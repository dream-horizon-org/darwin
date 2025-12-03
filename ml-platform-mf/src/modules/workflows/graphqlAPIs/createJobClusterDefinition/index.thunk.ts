import {CreateJobClusterDefinition, CreateJobClusterDefinitionInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setCreateJobClusterDefinition} from '../../pages/workflows/actions'
import {GQL} from './indexGql'

export const createJobClusterDefinition = (
  dispatch,
  payload: CreateJobClusterDefinitionInput
) => {
  const gql = {
    ...GQL,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    CreateJobClusterDefinitionInput,
    CreateJobClusterDefinition
  >(gql)

  dispatch(
    setCreateJobClusterDefinition({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlResponse
    .then((response) => {
      if (response?.data?.createJobClusterDefinition?.data) {
        dispatch(
          setCreateJobClusterDefinition({
            status: API_STATUS.SUCCESS,
            data: response?.data.createJobClusterDefinition.data,
            error: null
          })
        )
      } else {
        throw new Error('No data returned from createJobClusterDefinition')
      }
    })
    .catch((err) => {
      dispatch(
        setCreateJobClusterDefinition({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
