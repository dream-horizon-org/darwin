import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setClusterResources} from '../../actions'
import {
  GetClusterResources,
  GetClusterResourcesInput
} from './getClusterResources'

import {GQL as getClusterResourcesGql} from './getClusterResourcesGql'

export const getClusterResources = (
  input: GetClusterResourcesInput,
  dispatch
) => {
  const gql = {
    ...getClusterResourcesGql,
    variables: {
      ...input
    }
  }
  dispatch(
    setClusterResources({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlRequestTyped<GetClusterResourcesInput, GetClusterResources>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getClusterResources &&
        response.data.getClusterResources.status === 'SUCCESS'
      ) {
        dispatch(
          setClusterResources({
            status: API_STATUS.SUCCESS,
            data: response.data.getClusterResources.data,
            error: null
          })
        )
      } else {
        throw new Error('Error fetching cluster resources')
      }
    })
    .catch((err) => {
      dispatch(
        setClusterResources({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
