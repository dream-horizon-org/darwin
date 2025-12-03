export const refreshTokenGql = `
query {
  refreshToken {
    accessToken
    refreshToken
    code
  }
}`
