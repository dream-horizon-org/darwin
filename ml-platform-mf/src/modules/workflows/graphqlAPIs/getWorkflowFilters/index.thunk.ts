import {GetWorkflowFilters} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setWorkflowFilters} from '../../pages/workflows/actions'
import {GQL as getWorkflowFiltersGql} from './indexGql'

export const getWorkflowFilters = (dispatch) => {
  const gql = {
    ...getWorkflowFiltersGql
  }

  const gqlResponse = gqlRequestTyped<null, GetWorkflowFilters>(gql)

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowFilters?.data) {
        dispatch(
          setWorkflowFilters({
            status: API_STATUS.SUCCESS,
            data: response?.data?.getWorkflowFilters?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowFilters({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setWorkflowFilters({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
