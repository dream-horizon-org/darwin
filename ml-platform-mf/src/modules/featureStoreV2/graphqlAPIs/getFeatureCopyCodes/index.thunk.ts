import {setGlobalSnackBar, setSnackBar} from '../../../../actions/commonActions'
import {ApiStatus} from '../../../../gql-enums/api-status.enum'
import {SnackbarType} from '../../../../reducers/commonReducer'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setFeatureCopyCodes} from '../../pages/featureStoreGroupDetails/actions'
import {GetFeatureCopyCodes, GetFeatureCopyCodesInput} from './index'

import {GQL as getFeatureCopyCodesGql} from './indexGql'

export const getFeatureCopyCodes = (
  dispatch,
  payload: GetFeatureCopyCodesInput
) => {
  const gql = {
    ...getFeatureCopyCodesGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    GetFeatureCopyCodesInput,
    GetFeatureCopyCodes
  >(gql)

  dispatch(
    setFeatureCopyCodes({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  dispatch(
    setGlobalSnackBar({
      message: 'Copying code...',
      open: true,
      type: SnackbarType.SUCCESS
    })
  )

  gqlResponse
    .then((response) => {
      if (response.data.getFeatureCopyCodes.status === ApiStatus.SUCCESS) {
        dispatch(
          setFeatureCopyCodes({
            status: API_STATUS.SUCCESS,
            data: response.data.getFeatureCopyCodes.data,
            error: null
          })
        )
        navigator.clipboard.writeText(response.data.getFeatureCopyCodes.data)
        dispatch(
          setGlobalSnackBar({
            message: 'Code copied successfully!',
            open: true,
            type: SnackbarType.SUCCESS
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch(() => {
      dispatch(
        setFeatureCopyCodes({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
      dispatch(
        setGlobalSnackBar({
          message: 'Copying code failed!',
          open: true,
          type: SnackbarType.ERROR
        })
      )
    })
}
