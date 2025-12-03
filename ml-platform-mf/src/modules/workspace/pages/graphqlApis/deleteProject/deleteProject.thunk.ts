import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setDeleteProject, setGenericSnackBar} from '../../actions'
import {SnackbarType} from '../../reducer'
import {getLastSelectedCodespace} from '../getLastSelectedCodespace/getLastSelectedCodespace.thunk'
import {DeleteProject, DeleteProjectInput} from './deleteProject'

import {GQL as deleteProjectGql} from './deleteProjectGql'

export const deleteProject = (input, dispatch) => {
  const gql = {
    ...deleteProjectGql,
    variables: {
      ...input
    }
  }

  dispatch(
    setDeleteProject({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setGenericSnackBar({
      message: 'Deleting Project! Please Wait...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlRequestTyped<DeleteProjectInput, DeleteProject>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.deleteProject &&
        response.data.deleteProject.status === 'SUCCESS'
      ) {
        dispatch(
          setDeleteProject({
            status: API_STATUS.SUCCESS,
            data: response.data.deleteProject.data,
            error: null
          })
        )

        dispatch(
          setGenericSnackBar({
            message: 'Project Deleted Successfully!',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )

        if (input.launchedProject) {
          getLastSelectedCodespace(dispatch)
        }
        dispatch(
          setGenericSnackBar({
            message: 'Project Deleted Successfully!',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )
      } else {
        throw new Error('Failed to delete project')
      }
    })
    .catch((err) => {
      dispatch(
        setDeleteProject({
          status: API_STATUS.ERROR,
          data: null,
          error: err
        })
      )

      dispatch(
        setGenericSnackBar({
          message: 'Failed to delete project!',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
