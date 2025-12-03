export const shouldRedirectTo = (localStorage: Storage) => {
  if (localStorage.getItem('returnToURL')) {
    let redirectURL = `${localStorage.getItem('returnToURL')}`

    // removing the local storage after it's first usage(for redirecting user to the same url),
    // as second time onwards this 'shouldRedirectTo' is getting used for
    // changing game context (Fantasy/FanCode), below logic should take care of that
    localStorage.removeItem('returnToURL')
    return redirectURL
  }
  return `/dashboard`
}
