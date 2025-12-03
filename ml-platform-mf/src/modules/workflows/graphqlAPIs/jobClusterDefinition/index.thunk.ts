import {JobClusterDefinition, JobClusterDefinitionInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setJobClusterDefinition} from '../../pages/workflows/actions'
import {GQL} from './indexGql'

export const jobClusterDefinition = (
  dispatch,
  payload: JobClusterDefinitionInput
) => {
  const gql = {
    ...GQL,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    JobClusterDefinitionInput,
    JobClusterDefinition
  >(gql)

  dispatch(
    setJobClusterDefinition({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlResponse
    .then((response) => {
      if (response?.data?.jobClusterDefinition?.data) {
        dispatch(
          setJobClusterDefinition({
            status: API_STATUS.SUCCESS,
            data: response.data.jobClusterDefinition.data,
            error: null
          })
        )
      } else {
        throw new Error('No data found')
      }
    })
    .catch((err) => {
      dispatch(
        setJobClusterDefinition({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
