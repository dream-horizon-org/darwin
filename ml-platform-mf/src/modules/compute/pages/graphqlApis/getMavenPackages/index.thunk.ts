import {API_STATUS} from '../../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setMavenPackages} from '../actions'
import {
  GetMavenPackages,
  GetMavenPackagesInput,
  SelectionOnGetMavenPackages
} from './index'
import {GQL as getMavenPackagesGql} from './indexGql'

export const getMavenPackages = (
  dispatch,
  payload: GetMavenPackagesInput,
  prevData: SelectionOnGetMavenPackages
) => {
  const gql = {
    ...getMavenPackagesGql,
    variables: payload
  }
  const gqlRequest = gqlRequestTyped<null, GetMavenPackages>(gql)

  dispatch(
    setMavenPackages({
      status: API_STATUS.LOADING,
      data: prevData,
      error: null,
      cancel: gqlRequest.cancel
    })
  )

  gqlRequest
    .then((response) => {
      if (
        response &&
        response.data &&
        response.data.getMavenPackages &&
        response.data.getMavenPackages.data
      ) {
        dispatch(
          setMavenPackages({
            status: API_STATUS.SUCCESS,
            data: prevData
              ? {
                  ...response.data.getMavenPackages,
                  data: {
                    result_size:
                      response.data.getMavenPackages.data.result_size,
                    packages: [
                      ...prevData.data.packages,
                      ...response.data.getMavenPackages.data.packages
                    ]
                  }
                }
              : response.data.getMavenPackages,
            error: null,
            cancel: null
          })
        )
      } else {
        dispatch(
          setMavenPackages({
            status: API_STATUS.ERROR,
            data: null,
            error: null,
            cancel: null
          })
        )
      }
    })
    .catch(() => {
      dispatch(
        setMavenPackages({
          status: API_STATUS.ERROR,
          data: null,
          error: null,
          cancel: null
        })
      )
    })
}
