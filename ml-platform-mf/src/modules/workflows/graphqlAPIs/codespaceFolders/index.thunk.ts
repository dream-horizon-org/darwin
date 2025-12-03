import {CodespaceFolders, CodespaceFoldersInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setCodespaceFolders} from '../../pages/workflows/actions'
import {GQL as getCodespaceFoldersGql} from './indexGql'

export const getCodespaceFolders = (
  dispatch,
  payload: CodespaceFoldersInput
) => {
  const gql = {
    ...getCodespaceFoldersGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<CodespaceFoldersInput, CodespaceFolders>(
    gql
  )

  dispatch(
    setCodespaceFolders({
      status: API_STATUS.LOADING,
      data: null,
      error: null,
      codespaceId: payload.codespaceId,
      folderPath: payload.folderPath
    })
  )
  gqlResponse
    .then((response) => {
      if (response?.data?.codespaceFolders?.data) {
        dispatch(
          setCodespaceFolders({
            status: API_STATUS.SUCCESS,
            data: response?.data?.codespaceFolders?.data,
            error: null,
            codespaceId: payload.codespaceId,
            folderPath: payload.folderPath
          })
        )
      } else {
        dispatch(
          setCodespaceFolders({
            status: API_STATUS.ERROR,
            data: null,
            error: null,
            codespaceId: payload.codespaceId,
            folderPath: payload.folderPath
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setCodespaceFolders({
          status: API_STATUS.ERROR,
          data: null,
          error: err,
          codespaceId: payload.codespaceId,
          folderPath: payload.folderPath
        })
      )
    })
}
