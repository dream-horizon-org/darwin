import config from 'config'
import qs from 'query-string'
import React, {useEffect} from 'react'
import {useHistory} from 'react-router'
import {GQLResponse} from '../../types/gql.type'
import {getPermissionsGql} from './getPermissionGql'
import {deleteCookie, getCookie} from './utils'
import {handleLoginSuccess, transformUserDetails} from './utils'

const GoogleLoginCallback = () => {
  const history = useHistory()
  useEffect(() => {
    // TODO: Convert this to fp-ts function
    try {
      const userDetails = getCookie('userDetails')
      const decodedData = decodeURIComponent(userDetails)
      const parsedJson = JSON.parse(decodedData)
      if (parsedJson && parsedJson?.code === 200) {
        const redirectUrl = qs.parse(location?.search).returnUrl
        fetch(config.gqlUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-access-token': parsedJson.access_token
          },
          body: JSON.stringify({query: getPermissionsGql, variables: {}})
        })
          .then((response: any) => response.json())
          .then(
            (
              response: GQLResponse<{
                getUserPermissions: {permissions: Array<string>}
              }>
            ) => {
              const transformedJson = transformUserDetails({
                ...parsedJson,
                permission: response.data.getUserPermissions.permissions
              })

              handleLoginSuccess(transformedJson, () => {
                deleteCookie('userDetails')
                if (redirectUrl) {
                  Array.isArray(redirectUrl)
                    ? history.push(redirectUrl[0])
                    : history.push(redirectUrl)
                } else {
                  history.push(`/dashboard`)
                }
              })
            }
          )
          .catch((error) => {})
      } else {
        alert(`${parsedJson?.error?.message}`)
        history.push(`/login`)
      }
    } catch (e) {
      alert('Something went wrong. Contact Admin')
      history.push(`/login`)
    }
  }, [])
  return <div>loading</div>
}

export default GoogleLoginCallback
