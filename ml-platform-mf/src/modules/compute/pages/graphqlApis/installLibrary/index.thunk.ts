import {setGlobalSnackBar} from '../../../../../actions/commonActions'
import {ApiStatus} from '../../../../../gql-enums/api-status.enum'
import {SnackbarType} from '../../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setInstallLibrary} from '../actions'
import {InstallLibrary, InstallLibraryInput} from './index'
import {GQL as installLibraryGql} from './indexGql'

export const installLibrary = (dispatch, payload: InstallLibraryInput) => {
  const gql = {
    ...installLibraryGql,
    variables: payload
  }

  dispatch(
    setInstallLibrary({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, InstallLibrary>(gql)
    .then((response) => {
      if (response && response.data && response.data.installLibrary) {
        dispatch(
          setInstallLibrary({
            status: API_STATUS.SUCCESS,
            data: response.data.installLibrary,
            error: null
          })
        )
        if (response.data.installLibrary.data === null) {
          dispatch(
            setGlobalSnackBar({
              message: 'Library already installed',
              open: true,
              type: SnackbarType.SUCCESS
            })
          )
        } else {
          dispatch(
            setGlobalSnackBar({
              message: response?.data?.installLibrary?.message,
              open: true,
              type:
                response?.data?.installLibrary?.status === ApiStatus.SUCCESS
                  ? SnackbarType.SUCCESS
                  : SnackbarType.ERROR
            })
          )
        }
      } else {
        dispatch(
          setInstallLibrary({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setInstallLibrary({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
