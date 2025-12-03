import config from 'config'

const loginGqlRequest = (userId: string, password: string) => {
  const headers = {
    'content-type': 'application/json',
    'x-access-token': localStorage.getItem('x-access-token') || '',
    'x-skip-validation': 'true'
  }
  return fetch(config.gqlUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `query login($username: String!, $password: String!, $grantType: String! = "password"){
  login(username: $username, password: $password, grant_type : $grantType) {
    accessToken
    refreshToken
    userId
    name
    email
    role
    permissions
    active
  }
}`,
      variables: {
        username: userId,
        password
      }
    })
  })
}

export default loginGqlRequest
