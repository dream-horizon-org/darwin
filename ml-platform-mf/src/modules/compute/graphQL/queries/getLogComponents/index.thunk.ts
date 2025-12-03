import {GetLogComponents} from '.'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setLogComponents} from '../../../pages/graphqlApis/actions'
import {GQL as getLogComponentsGql} from './indexGql'

export const getLogComponents = (dispatch) => {
  const gql = {
    ...getLogComponentsGql
  }

  dispatch(
    setLogComponents({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetLogComponents>(gql)
    .then((response) => {
      if (response && response.data && response.data.getLogComponents) {
        dispatch(
          setLogComponents({
            status: API_STATUS.SUCCESS,
            data: response.data.getLogComponents.data,
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setLogComponents({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
