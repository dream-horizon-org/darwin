import {GetRecentlyVisitedWorkflows} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setRecentlyVisited} from '../../pages/workflows/actions'
import {GQL as getRecentlyVisitedWorkflowsGql} from './indexGql'

export const getRecentlyVisitedWorkflows = (dispatch) => {
  const gql = {
    ...getRecentlyVisitedWorkflowsGql
  }

  const gqlResponse = gqlRequestTyped<null, GetRecentlyVisitedWorkflows>(gql)

  dispatch(
    setRecentlyVisited({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data?.getRecentlyVisitedWorkflows?.data) {
        dispatch(
          setRecentlyVisited({
            status: API_STATUS.SUCCESS,
            data: response.data?.getRecentlyVisitedWorkflows?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setRecentlyVisited({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setRecentlyVisited({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
