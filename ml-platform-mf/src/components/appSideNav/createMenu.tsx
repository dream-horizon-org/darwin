import config from 'config'
import {Location} from 'history'
import queryString from 'query-string'
import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
// import {getSidenavStateFromLocal} from '../../utils/get-sidenav-data-from-localStorage'
import {accessibleTab} from '../../modules/login/utils'
import {getSidenavStateFromLocal} from '../../utils/getSidenavDataFromLocalStorage'
import {useAppDrawerStyles} from './appSideNavJSS'

const CHEVRON = `${config.cfMsdAssetUrl}/icons/chevron-down.svg`

const isRouteMatching = (path, route) => {
  const routeMathcer = new RegExp(route.replace(/:[^\s/]+/g, '([\\w-]+)'))
  return path.match(routeMathcer)
}
enum AppContext {
  SHIELD = 'shield'
}
interface ICreateMenuProps {
  menu: any
  userPermissions: string[]
  handleListToggle: (type: string) => void
  menuState: {
    [k: string]: boolean
  }
  closeSideDrawer: () => void
  activeAppRoute?: string
  location: Location<any>
  appContext?: string
}

const CreateMenu = (props: ICreateMenuProps) => {
  const {
    menu,
    menuState,
    userPermissions,
    handleListToggle,
    activeAppRoute,
    location,
    appContext
  } = props
  const classes = useAppDrawerStyles()

  if (menu && !Array.isArray(menu.menus)) {
    const queryStrings = queryString.parse(location.search)
    const gameId = queryStrings.gameId || 2
    if (menu.permission && accessibleTab(userPermissions, menu.permission)) {
      let activeApp = activeAppRoute ? `/${activeAppRoute}` : ''
      if (menu.activeApp) {
        activeApp = `/${menu.activeApp}`
      }
      const link = `${activeApp}${menu.link}${
        menu.skipGameId ? '' : `?gameId=${gameId}`
      }`
      const shieldLink = `${activeApp}${menu.link}`
      const currentLink = () => {
        if (appContext === AppContext.SHIELD) {
          return shieldLink
        } else {
          return link
        }
      }
      return (
        <Link
          to={currentLink()}
          className={classes.noTextDecor}
          key={menu.menuName}
        >
          <li
            className={`${
              isRouteMatching(location.pathname, menu.link)
                ? `${classes.selectedMenuItem} ${
                    !menu.noParent && classes.selectedRoute
                  }`
                : ''
            } ${menu.noParent ? classes.mainMenuItem : classes.route}`}
            onClick={() => {
              // to close sidenav on click only when it is in hover state
              getSidenavStateFromLocal('isSidenavOpen') &&
                props.closeSideDrawer()
            }}
          >
            {menu.menuName}
          </li>
        </Link>
      )
    }
    return null
  }

  if (menu && menu.menuName !== '') {
    if (menu.permission && accessibleTab(userPermissions, menu.permission)) {
      return (
        <div key={menu.menuName}>
          <li
            onClick={() => handleListToggle(menu.menuName)}
            className={classes.mainMenuItem}
          >
            {menu.menuName}
            <img
              className={
                menuState[menu.menuName] ? classes.rotate : classes.reverse
              }
              src={CHEVRON}
              alt=''
              height={20}
              width={20}
            />
          </li>
          <div
            className={`${classes.menu} ${
              menuState[menu.menuName] && classes.collapseMenu
            }`}
          >
            <div className={classes.listContainer}>
              {menu.menus.map((menu1, index) => (
                <CreateMenu {...props} menu={menu1} key={`menu1-${index}`} />
              ))}
            </div>
          </div>
        </div>
      )
    }
    return null
  }
  return (
    <div className={classes.drawerList}>
      {menu &&
        menu.menus.map((menu1, index) => (
          <CreateMenu {...props} menu={menu1} key={`menu-${index}`} />
        ))}
    </div>
  )
}

export default CreateMenu
