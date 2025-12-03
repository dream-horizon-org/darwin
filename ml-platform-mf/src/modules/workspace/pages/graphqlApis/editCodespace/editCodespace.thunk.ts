import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setEditCodespace, setGenericSnackBar} from '../../actions'
import {SnackbarType} from '../../reducer'
import {launchCodespace} from '../launchCodespace/launchCodespace.thunk'
import {EditCodespace, EditCodespaceInput} from './editCodespace'

import {GQL as editCodespaceGql} from './editCodespaceGql'

export const editCodespace = (dispatch, payload) => {
  const gql = {
    ...editCodespaceGql,
    variables: payload
  }

  dispatch(
    setEditCodespace({
      status: API_STATUS.LOADING,
      error: null
    })
  )

  gqlRequestTyped<EditCodespaceInput, EditCodespace>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.editCodespace &&
        response.data.editCodespace.status === 'SUCCESS'
      ) {
        dispatch(
          setEditCodespace({
            status: API_STATUS.SUCCESS,
            error: null
          })
        )

        dispatch(
          setGenericSnackBar({
            message: 'Codespace Name Edited Successfully!',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )

        if (payload.launchedCodespace) {
          launchCodespace(dispatch, {
            projectId: payload.projectId,
            codespaceId: payload.codespaceId
          })
        }
      } else {
        throw new Error('Failed while editing codespace')
      }
    })
    .catch((err) => {
      dispatch(
        setEditCodespace({
          status: API_STATUS.ERROR,
          error: err
        })
      )

      dispatch(
        setGenericSnackBar({
          message: 'Failed To Edit Codespace Name!',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
