import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setDeleteCodespace, setGenericSnackBar} from '../../actions'
import {SnackbarType} from '../../reducer'
import {getLastSelectedCodespace} from '../getLastSelectedCodespace/getLastSelectedCodespace.thunk'
import {DeleteCodespace, DeleteCodespaceInput} from './deleteCodespace'

import {GQL as deleteCodespaceGql} from './deleteCodespaceGql'

export const deleteCodespace = (input, dispatch) => {
  const gql = {
    ...deleteCodespaceGql,
    variables: {
      ...input
    }
  }

  dispatch(
    setDeleteCodespace({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setGenericSnackBar({
      message: 'Deleting Codespace! Please Wait...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlRequestTyped<DeleteCodespaceInput, DeleteCodespace>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.deleteCodespace &&
        response.data.deleteCodespace.status === 'SUCCESS'
      ) {
        dispatch(
          setDeleteCodespace({
            status: API_STATUS.SUCCESS,
            data: response.data.deleteCodespace.data,
            error: null
          })
        )

        dispatch(
          setGenericSnackBar({
            message: 'Codespace Deleted Successfully!',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )

        if (input.launchedCodespace) {
          getLastSelectedCodespace(dispatch)
        }
      } else {
        throw new Error('Failed to delete codespace')
      }
    })
    .catch((err) => {
      dispatch(
        setDeleteCodespace({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )

      dispatch(
        setGenericSnackBar({
          message: 'Failed to delete codespace!',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
