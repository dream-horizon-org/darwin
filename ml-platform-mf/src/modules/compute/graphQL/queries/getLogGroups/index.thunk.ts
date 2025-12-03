import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setLogGroups} from '../../../pages/graphqlApis/actions'
import {GetLogGroups, GetLogGroupsInput} from './index'

import {GQL as getLogGroupsGql} from './indexGql'

export const getLogGroups = (dispatch, data: GetLogGroupsInput) => {
  const gql = {
    ...getLogGroupsGql,
    variables: data
  }

  dispatch(
    setLogGroups({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<GetLogGroupsInput, GetLogGroups>(gql)
    .then((response) => {
      if (response && response.data && response.data.getLogGroups) {
        dispatch(
          setLogGroups({
            status: API_STATUS.SUCCESS,
            data: response.data.getLogGroups.data,
            error: null
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setLogGroups({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
