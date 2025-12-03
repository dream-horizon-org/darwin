import {GetLogLevels} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setLogLevels} from '../../../pages/graphqlApis/actions'
import {GQL as getLogLevelsGql} from './indexGql'

export const getLogLevels = (dispatch) => {
  const gql = {
    ...getLogLevelsGql
  }

  dispatch(
    setLogLevels({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetLogLevels>(gql)
    .then((response) => {
      if (response && response.data && response.data.getLogLevels) {
        dispatch(
          setLogLevels({
            status: API_STATUS.SUCCESS,
            data: response.data.getLogLevels.data,
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setLogLevels({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
