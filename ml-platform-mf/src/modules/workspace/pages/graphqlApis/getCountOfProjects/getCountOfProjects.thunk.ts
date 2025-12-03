import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setCountOfProjects} from '../../actions'
import {GetCountOfProjects} from './getCountOfProjects'

import {GQL as getCountOfProjectsGql} from './getCountOfProjectsGql'

export const getCountOfProjects = (dispatch) => {
  const gql = {
    ...getCountOfProjectsGql
  }

  dispatch(
    setCountOfProjects({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetCountOfProjects>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getCountOfProjects &&
        response.data.getCountOfProjects.status === 'SUCCESS'
      ) {
        dispatch(
          setCountOfProjects({
            status: API_STATUS.SUCCESS,
            data: response.data.getCountOfProjects.data,
            error: null
          })
        )
      } else {
        throw new Error('Cannot get count of projects')
      }
    })
    .catch((err) => {
      dispatch(
        setCountOfProjects({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )
    })
}
