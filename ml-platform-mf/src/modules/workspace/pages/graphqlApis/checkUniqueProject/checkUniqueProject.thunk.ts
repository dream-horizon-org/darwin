import {API_STATUS, GRAPHQL_API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setGetAllClusters, setUniqueProject} from '../../actions'
import {CheckUniqueProject, CheckUniqueProjectInput} from './checkUniqueProject'

import {GQL as checkUniqueProjectGql} from './checkUniqueProjectGql'

export const checkUniqueProject = (
  dispatch,
  variables: CheckUniqueProjectInput
) => {
  const gql = {
    ...checkUniqueProjectGql,
    variables
  }
  dispatch(
    setUniqueProject({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )
  gqlRequestTyped<CheckUniqueProjectInput, CheckUniqueProject>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.checkUniqueProject &&
        response.data.checkUniqueProject.status === GRAPHQL_API_STATUS.SUCCESS
      ) {
        dispatch(
          setUniqueProject({
            status: API_STATUS.SUCCESS,
            data: response.data.checkUniqueProject.data,
            error: null
          })
        )
      } else {
        dispatch(
          setUniqueProject({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setUniqueProject({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
