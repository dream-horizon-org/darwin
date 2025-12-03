import config from 'config'
import {Location} from 'history'
import queryString from 'query-string'
import React, {Fragment, useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {BitThemeWrapper} from '../../bit-components/bit-theme-wrapper/index'
import {useCatalogStore} from '../../modules/catalog/store/catalogStore'
// import {getSidenavStateFromLocal} from '../../utils/get-sidenav-data-from-localStorage'
import {accessibleTab} from '../../modules/login/utils'
import {getSidenavStateFromLocal} from '../../utils/getSidenavDataFromLocalStorage'
import {useAppDrawerStyles} from './appSideNavbarJSS'
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
  activeAppRoute?: string
  location: Location<any>
  appContext?: string
  handleMenuClose: () => void
}
const CreateMenu = (props: ICreateMenuProps) => {
  const {
    menu,
    menuState,
    userPermissions,
    handleListToggle,
    activeAppRoute,
    location,
    appContext,
    handleMenuClose
  } = props
  const classes = useAppDrawerStyles()
  const [topMenus, setTopMenus] = React.useState([])
  const [bottomMenus, setBottomMenus] = React.useState([])
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const {resetSearchAssets, resetExpandedItems, resetQuerySearchAssets} =
    useCatalogStore()

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    handleMenuClose()
  }

  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (menu.component) {
      e.preventDefault()
      setIsDrawerOpen(true)
    } else {
      handleMenuClose()
    }
  }

  useEffect(() => {
    if (menu && Array.isArray(menu.menus)) {
      const topMenus = menu.menus.filter((menu) => !menu.pushToBottom)
      const bottomMenus = menu.menus.filter((menu) => menu.pushToBottom)
      if (topMenus.length > 0) {
        setTopMenus(topMenus)
      }
      if (bottomMenus.length > 0) {
        setBottomMenus(bottomMenus)
      }
    }
  }, [menu])
  if (menu && !Array.isArray(menu.menus)) {
    const queryStrings = queryString.parse(location.search)
    const gameId = queryStrings.gameId || 2
    if (menu.permission && accessibleTab(userPermissions, menu.permission)) {
      let activeApp = activeAppRoute ? `/${activeAppRoute}` : ''
      if (menu.activeApp) {
        activeApp = `/${menu.activeApp}`
      }
      const link = `${menu.link}${menu.skipGameId ? '' : `?gameId=${gameId}`}`
      const shieldLink = `${activeApp}${menu.link}`
      const currentLink = () => {
        if (appContext === AppContext.SHIELD) {
          return shieldLink
        } else {
          return link
        }
      }

      return (
        <>
          <Link
            to={menu.component ? '#' : currentLink()}
            className={classes.noTextDecor}
            key={menu.menuName}
            data-testid={`menu-${menu.menuName}`}
            onClick={handleMenuClick}
          >
            <li
              className={`${
                isRouteMatching(location.pathname, menu.link)
                  ? `${classes.selectedMenuItem} ${
                      !menu.noParent && classes.selectedRoute
                    }`
                  : ''
              } ${menu.noParent ? classes.mainMenuItem : classes.route}`}
            >
              <span>
                <img src={config.cfMsdAssetUrl + menu.iconUrl} />
              </span>
              <span className='title'>{menu.menuName}</span>
            </li>
          </Link>
          {menu.component ? (
            <BitThemeWrapper theme={'dark'}>
              <menu.component
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
              />
            </BitThemeWrapper>
          ) : null}
        </>
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
    <div className={classes.drawerListContainer}>
      <div className={classes.drawerList}>
        {menu &&
          topMenus.map((menu1, index) => (
            <CreateMenu {...props} menu={menu1} key={`menu-${index}`} />
          ))}
      </div>
      <div className={classes.drawerListBottom}>
        {menu &&
          bottomMenus.map((menu1, index) => (
            <Fragment data-cy={`bottom-menu-${menu1.menuName}`}>
              <CreateMenu {...props} menu={menu1} key={`menu-${index}`} />
            </Fragment>
          ))}
      </div>
    </div>
  )
}
export default CreateMenu
