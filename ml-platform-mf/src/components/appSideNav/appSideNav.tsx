import {Location} from 'history'
import React, {useEffect, useState} from 'react'
import SideDrawer from '../sideDrawer/sideDrawer'
import {useAppDrawerStyles} from './appSideNavJSS'
import CreateMenu from './createMenu'

interface IProps {
  closeSideDrawer: () => void
  appContext?: string
  appDrawerToggle: boolean
  menu: unknown
  userPermissions: string[]
  location: Location<any>
  activeApp?: string
  isMobile?: boolean
  handleGameContextChange?: (game: string) => void
  handleAppContextChange?: (appContext: string) => void
  openSidenav: () => void
  sideNavLocalStorage: boolean
}

const AppSideNav = (props: IProps) => {
  const {menu, activeApp, location} = props
  const classes = useAppDrawerStyles()
  const [menuState, setMenuState] = useState({})

  const handleListToggle = (type: string) => {
    setMenuState({...menuState, [type]: !menuState[type]})
  }

  useEffect(() => {
    setMenuState({})
  }, [props.appContext])

  const drawer = (
    <div className={classes.appDrawerContainer}>
      <div
        className={`${classes.baseMenu} ${classes[`${props.appContext}Menu`]}`}
      >
        {menu !== null ? (
          <CreateMenu
            appContext={props.appContext}
            location={location}
            activeAppRoute={activeApp}
            menu={menu}
            handleListToggle={(type) => handleListToggle(type)}
            menuState={menuState}
            userPermissions={props.userPermissions}
            closeSideDrawer={props.closeSideDrawer}
          />
        ) : null}
      </div>
    </div>
  )

  return (
    <div className={classes.appDrawerContainer}>
      <SideDrawer
        closeSideDrawer={props.closeSideDrawer}
        isClosed={props.appDrawerToggle}
        isMobile={props.isMobile}
        openSidenav={props.openSidenav}
        sideNavLocalStorage={props.sideNavLocalStorage}
      >
        {drawer}
      </SideDrawer>
    </div>
  )
}

export default AppSideNav
