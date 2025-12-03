import {
  GetDatabasesForEnvironmentAndSource,
  GetDatabasesForEnvironmentAndSourceInput,
  SelectionOnDatabases
} from '.'
import {API_STATUS, GRAPHQL_API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setDatabaseForEnvironmentAndSource} from '../../actions'

import {GQL as getDatabasesForEnvironmentAndSourceGql} from './indexGql'

export const getDatabasesForEnvironmentAndSource = (
  dispatch,
  data: GetDatabasesForEnvironmentAndSourceInput,
  preLoadedData: Array<SelectionOnDatabases>
) => {
  const gql = {
    ...getDatabasesForEnvironmentAndSourceGql,
    variables: data
  }

  dispatch(
    setDatabaseForEnvironmentAndSource({
      status: API_STATUS.LOADING,
      data: [...preLoadedData],
      error: null,
      totalRecordsCount: null
    })
  )

  gqlRequestTyped<
    GetDatabasesForEnvironmentAndSourceInput,
    GetDatabasesForEnvironmentAndSource
  >(gql)
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getDatabasesForEnvironmentAndSource &&
        response.data.getDatabasesForEnvironmentAndSource.status ===
          GRAPHQL_API_STATUS.SUCCESS
      ) {
        dispatch(
          setDatabaseForEnvironmentAndSource({
            status: API_STATUS.SUCCESS,
            data: [
              ...preLoadedData,
              ...response.data.getDatabasesForEnvironmentAndSource.data
                .databases
            ],
            error: null,
            totalRecordsCount:
              response.data.getDatabasesForEnvironmentAndSource.data.result_size
          })
        )
      } else {
        throw new Error()
      }
    })
    .catch((err) => {
      dispatch(
        setDatabaseForEnvironmentAndSource({
          status: API_STATUS.ERROR,
          data: [...preLoadedData],
          error: err,
          totalRecordsCount: null
        })
      )
    })
}
