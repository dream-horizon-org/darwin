import {GetLogLineDetails, GetLogLineDetailsInput} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setLogDetails} from '../../../pages/graphqlApis/actions'
import {GQL as getLogDetailsGql} from './indexGql'

export const getLogDetails = (dispatch, data: GetLogLineDetailsInput) => {
  const gql = {
    ...getLogDetailsGql,
    variables: data
  }

  dispatch(
    setLogDetails({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<GetLogLineDetailsInput, GetLogLineDetails>(gql)
    .then((response) => {
      if (response && response.data && response.data.getLogLineDetails) {
        dispatch(
          setLogDetails({
            status: API_STATUS.SUCCESS,
            data: response.data.getLogLineDetails.data,
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setLogDetails({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
