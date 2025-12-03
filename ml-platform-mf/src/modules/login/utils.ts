import config from 'config'

export const transformUserDetails = (input: {
  access_token: string
  refresh_token: string
  id: {
    id: number
    name: string
    email: string
    role: string
  }
  permission: Array<string>
  active: true
}) => ({
  accessToken: input?.access_token,
  refreshToken: input?.refresh_token,
  userId: input?.id.id,
  name: input?.id.name,
  email: input?.id.email,
  role: input?.id.role,
  permissions: input.permission,
  active: input.active
})

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

export const handleLoginSuccess = (
  userDetails: {
    accessToken: string
    refreshToken: string
    userId: number
    name: string
    email: string
    role: string
    permissions: Array<string>
    active: boolean
  },
  callback = () => {}
) => {
  localStorage.setItem('x-access-token', userDetails.accessToken)
  localStorage.setItem('x-refresh-token', userDetails.refreshToken)
  localStorage.setItem('x-permissions', JSON.stringify(userDetails.permissions))
  localStorage.setItem(
    'x-user-details',
    JSON.stringify({
      userId: userDetails.userId,
      name: userDetails.name,
      email: userDetails.email,
      role: userDetails.role,
      active: userDetails.active
    })
  )
  const urlParams = new URLSearchParams(window.location.search)
  const returnUrl = urlParams.get('returnUrl')
  if (returnUrl) {
    window.location.href = returnUrl
  } else {
    window.location.href = `/dashboard`
  }
  callback()
}

export const accessibleTab = (
  userPermissions: Array<string>,
  permissionsReq: string | Array<string>
) => {
  if (permissionsReq === 'everyone') {
    return true
  }

  return Array.isArray(permissionsReq)
    ? permissionsReq.some((perm) => userPermissions.includes(perm))
    : userPermissions.includes(permissionsReq)
}

export const getActiveAppFromLocation = (location: string) => {
  // TODO: Add tests
  const urlParams = location.split('/')
  if (urlParams.length && urlParams[2] !== 'login') {
    return urlParams[2]
  }
  return null
}

export const deleteCookie = (name) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
}

export const getCookie = (cname) => {
  const name = `${cname}=`
  const ca = document.cookie.split(';')
  let i
  let c
  for (i = 0; i < ca.length; i += 1) {
    c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
