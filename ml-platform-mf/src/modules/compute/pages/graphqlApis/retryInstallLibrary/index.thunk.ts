import {setGlobalSnackBar} from '../../../../../actions/commonActions'
import {ApiStatus} from '../../../../../gql-enums/api-status.enum'
import {SnackbarType} from '../../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setInstallLibrary, setRetryInstallLibrary} from '../actions'
import {RetryInstallLibrary, RetryInstallLibraryInput} from './index'
import {GQL as retryInstallLibraryGql} from './indexGql'

export const retryInstallLibrary = (
  dispatch,
  payload: RetryInstallLibraryInput
) => {
  const gql = {
    ...retryInstallLibraryGql,
    variables: payload
  }

  dispatch(
    setRetryInstallLibrary({
      status: API_STATUS.LOADING,
      data: null,
      libraryId: payload.input.library_id,
      error: null
    })
  )
  dispatch(
    setGlobalSnackBar({
      message: 'Retrying install library...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlRequestTyped<null, RetryInstallLibrary>(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.retryInstallLibrary &&
        response.data.retryInstallLibrary.data
      ) {
        dispatch(
          setRetryInstallLibrary({
            status: API_STATUS.SUCCESS,
            data: response.data.retryInstallLibrary,
            libraryId: payload.input.library_id,
            error: null
          })
        )

        if (response?.data?.retryInstallLibrary?.status === ApiStatus.SUCCESS) {
          dispatch(
            setInstallLibrary({
              status: API_STATUS.SUCCESS,
              data: response.data.retryInstallLibrary,
              error: null
            })
          )
        }

        dispatch(
          setGlobalSnackBar({
            message: response?.data?.retryInstallLibrary?.message,
            open: true,
            type:
              response?.data?.retryInstallLibrary?.status === ApiStatus.SUCCESS
                ? SnackbarType.SUCCESS
                : SnackbarType.ERROR
          })
        )
      } else {
        dispatch(
          setRetryInstallLibrary({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setRetryInstallLibrary({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
