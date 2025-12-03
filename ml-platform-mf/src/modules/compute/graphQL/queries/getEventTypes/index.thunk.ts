import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setEventTypes} from '../../../pages/graphqlApis/actions'
import {GetEventTypes} from './index'
import {GQL as getEventTypesGql} from './indexGql'

export const getEventTypes = (dispatch) => {
  const gql = {
    ...getEventTypesGql
  }

  dispatch(
    setEventTypes({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetEventTypes>(gql)
    .then((response) => {
      if (response && response.data && response.data.getEventTypes) {
        dispatch(
          setEventTypes({
            status: API_STATUS.SUCCESS,
            data: response.data.getEventTypes.data,
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setEventTypes({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
