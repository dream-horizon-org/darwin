import {setGlobalSnackBar} from '../../../../actions/commonActions'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setGetWorkflowYaml} from '../../pages/workflows/actions'
import {GetWorkflowYaml, GetWorkflowYamlInput} from './index'

import {GQL as getWorkflowYamlGql} from './indexGql'

export const getWorkflowYaml = (dispatch, payload: GetWorkflowYamlInput) => {
  const gql = {
    ...getWorkflowYamlGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetWorkflowYamlInput, GetWorkflowYaml>(
    gql
  )

  dispatch(
    setGetWorkflowYaml({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setGlobalSnackBar({
      message: 'Downloading YAML...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowYaml?.data) {
        dispatch(
          setGetWorkflowYaml({
            status: API_STATUS.SUCCESS,
            data: response.data.getWorkflowYaml.data,
            error: null
          })
        )
      } else {
        dispatch(
          setGetWorkflowYaml({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setGetWorkflowYaml({
          status: API_STATUS.ERROR,
          data: null,
          error
        })
      )
    })
}
