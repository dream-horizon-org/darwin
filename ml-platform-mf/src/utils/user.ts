export const getUserDetails = () => {
  const userDetails = localStorage.getItem('x-user-details')
  return userDetails ? JSON.parse(userDetails) : null
}
