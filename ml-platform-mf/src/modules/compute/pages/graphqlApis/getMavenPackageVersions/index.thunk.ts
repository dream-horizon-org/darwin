import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setMavenPackageVersions} from '../actions'
import {GetMavenPackageVersions, GetMavenPackageVersionsInput} from './index'
import {GQL as getMavenPackageVersionsGql} from './indexGql'

export const getMavenPackageVersions = (
  dispatch,
  payload: GetMavenPackageVersionsInput
) => {
  const gql = {
    ...getMavenPackageVersionsGql,
    variables: payload
  }

  dispatch(
    setMavenPackageVersions({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlRequestTyped<null, GetMavenPackageVersions>(gql)
    .then((response) => {
      if (response && response.data && response.data.getMavenPackageVersions) {
        dispatch(
          setMavenPackageVersions({
            status: API_STATUS.SUCCESS,
            data: response.data.getMavenPackageVersions,
            error: null
          })
        )
      } else {
        dispatch(
          setMavenPackageVersions({
            status: API_STATUS.ERROR,
            data: null,
            error: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setMavenPackageVersions({
          status: API_STATUS.ERROR,
          data: null,
          error: null
        })
      )
    })
}
