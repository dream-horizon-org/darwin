import {
  GetDataForEnvironmentAndSource,
  GetDataForEnvironmentAndSourceInput
} from '.'
import {API_STATUS, GRAPHQL_API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setDataForEnvironmentAndSource} from '../../actions'
import {IWorkspaceState} from '../../reducer'

import {GQL as getDataForEnvironmentAndSourceGql} from './indexGql'

export const getDataForEnvironmentAndSource = (
  dispatch,
  data: GetDataForEnvironmentAndSourceInput,
  preLoadedData: IWorkspaceState['dataSource']['data']
) => {
  if (!data.env || !data.source) {
    return dispatch(
      setDataForEnvironmentAndSource({
        status: API_STATUS.INIT,
        data: null,
        error: null,
        totalRecordsCount: 0
      })
    )
  }
  const gql = {
    ...getDataForEnvironmentAndSourceGql,
    variables: data
  }

  dispatch(
    setDataForEnvironmentAndSource({
      status: API_STATUS.LOADING,
      data: [...preLoadedData],
      error: null,
      totalRecordsCount: null
    })
  )

  gqlRequestTyped<
    GetDataForEnvironmentAndSourceInput,
    GetDataForEnvironmentAndSource
  >(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getDataForEnvironmentAndSource &&
        response.data.getDataForEnvironmentAndSource.status ===
          GRAPHQL_API_STATUS.SUCCESS
      ) {
        dispatch(
          setDataForEnvironmentAndSource({
            status: API_STATUS.SUCCESS,
            data: [
              ...preLoadedData,
              ...response.data.getDataForEnvironmentAndSource.data.tables
            ],
            error: null,
            totalRecordsCount:
              response.data.getDataForEnvironmentAndSource.data.result_size
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch((err) => {
      dispatch(
        setDataForEnvironmentAndSource({
          status: API_STATUS.ERROR,
          data: [...preLoadedData],
          error: err,
          totalRecordsCount: null
        })
      )
    })
}
