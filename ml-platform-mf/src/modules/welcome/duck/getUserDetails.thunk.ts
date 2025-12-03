import config from 'config'
import {setHeading} from '../../../actions/commonActions'
import {GQLResponse} from '../../../types/gql.type'
// import {getPascalCaseGameName} from '../../../utils/getGameName'
// import {gqlRequest} from '../../../utils/gqlRequest'
import {getUserDetailsGql} from './getUserDetailsGql'

export const getUserDetails = () => (dispatch) => {
  // return gqlRequest(config.uiConfig.gqlUrl, getUserDetailsGql, {}).then(
  //   (
  //     response: GQLResponse<{
  //       getUserPermissions: {userId: string; name: string; email: string}
  //     }>
  //   ) => {
  //     if (response?.data?.getUserPermissions?.name) {
  //       dispatch(
  //         setHeading(
  //           `Welcome ${getPascalCaseGameName(
  //             response.data.getUserPermissions.name
  //           )}`
  //         )
  //       )
  //     }
  //   }
  // )
}
