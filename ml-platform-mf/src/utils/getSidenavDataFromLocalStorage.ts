const storeSidenavStatetoLocal = (data: boolean, key: string) => {
  if (!window.localStorage || !window.JSON || !key) {
    return
  }
  const d = {isSidenavOpen: data}
  localStorage.setItem(key, JSON.stringify(d))
}

const getSidenavStateFromLocal = (key: string): boolean => {
  let item = localStorage.getItem(key)

  if (!item) {
    storeSidenavStatetoLocal(true, 'isSidenavOpen')
    return true
  }

  return JSON.parse(item).isSidenavOpen
}

export {storeSidenavStatetoLocal, getSidenavStateFromLocal}
