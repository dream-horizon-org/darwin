import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setProjectList} from '../../actions'
import {GetProjects} from './getProjects'

import {GQL as getProjectsGql} from './getProjectsGql'

export const getProjects = (dispatch, payload = {}) => {
  const gql = {
    ...getProjectsGql,
    variables: payload
  }

  dispatch(
    setProjectList({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetProjects>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getProjects &&
        response.data.getProjects.data
      ) {
        dispatch(
          setProjectList({
            status: API_STATUS.SUCCESS,
            data: response.data.getProjects.data,
            error: null
          })
        )
      } else {
        dispatch(
          setProjectList({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setProjectList({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
