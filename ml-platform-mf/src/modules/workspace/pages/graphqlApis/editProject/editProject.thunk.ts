import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setEditProject, setGenericSnackBar} from '../../actions'
import {SnackbarType} from '../../reducer'
import {launchCodespace} from '../launchCodespace/launchCodespace.thunk'
import {EditProject, EditProjectInput} from './editProject'

import {GQL as editProjectGql} from './editProjectGql'

export const editProject = (dispatch, payload) => {
  const gql = {
    ...editProjectGql,
    variables: payload
  }

  dispatch(
    setEditProject({
      status: API_STATUS.LOADING,
      error: null
    })
  )

  gqlRequestTyped<EditProjectInput, EditProject>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.editProject &&
        response.data.editProject.status === 'SUCCESS'
      ) {
        dispatch(
          setEditProject({
            status: API_STATUS.SUCCESS,
            error: null
          })
        )

        dispatch(
          setGenericSnackBar({
            message: 'Project Name Edited Successfully!',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )

        if (payload.launchedProject) {
          launchCodespace(dispatch, {
            projectId: payload.projectId,
            codespaceId: payload.codespaceId
          })
        }
      } else {
        throw new Error('Failed while editing project')
      }
    })
    .catch((err) => {
      dispatch(
        setEditProject({
          status: API_STATUS.ERROR,
          error: err
        })
      )

      dispatch(
        setGenericSnackBar({
          message: 'Failed To Edit Project Name!',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
