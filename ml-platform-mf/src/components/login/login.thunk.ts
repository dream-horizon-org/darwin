export interface IUserDetails {
  accessToken: string
  refreshToken: string
  userId: number
  name: string
  email: string
  role: string
  permissions: Array<string>
  active: boolean
}
