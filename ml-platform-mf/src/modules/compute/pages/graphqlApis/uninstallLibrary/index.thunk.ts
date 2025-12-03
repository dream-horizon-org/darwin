import {setGlobalSnackBar} from '../../../../../actions/commonActions'
import {ApiStatus} from '../../../../../gql-enums/api-status.enum'
import {SnackbarType} from '../../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setUninstallLibrary} from '../actions'
import {UninstallLibrary, UninstallLibraryInput} from './index'
import {GQL as uninstallLibraryGql} from './indexGql'

export const uninstallLibrary = (dispatch, payload: UninstallLibraryInput) => {
  const gql = {
    ...uninstallLibraryGql,
    variables: payload
  }

  dispatch(
    setUninstallLibrary({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, UninstallLibrary>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.uninstallLibrary &&
        response.data.uninstallLibrary.data
      ) {
        dispatch(
          setUninstallLibrary({
            status: API_STATUS.SUCCESS,
            data: response.data.uninstallLibrary,
            error: null
          })
        )

        dispatch(
          setGlobalSnackBar({
            message: response?.data?.uninstallLibrary?.message,
            open: true,
            type:
              response?.data?.uninstallLibrary?.status === ApiStatus.SUCCESS
                ? SnackbarType.SUCCESS
                : SnackbarType.ERROR
          })
        )
      } else {
        dispatch(
          setUninstallLibrary({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setUninstallLibrary({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
