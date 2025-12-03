import {Location} from 'history'
import React, {useEffect, useState} from 'react'
import SideDrawer from '../sideDrawer/sideDrawer'
import {useAppDrawerStyles} from './appSideNavbarJSS'
import CreateMenu from './createMenu'

interface IProps {
  appContext?: string
  appDrawerToggle: boolean
  menu: unknown
  userPermissions: string[]
  location: Location<any>
  activeApp?: string
  isMobile?: boolean
  handleGameContextChange?: (game: string) => void
  handleAppContextChange?: (appContext: string) => void
  sideNavLocalStorage: boolean
  handleMenuOpen: () => void
  handleMenuClose: () => void
}

const AppSideNavbar = (props: IProps) => {
  const {menu, activeApp, location, handleMenuOpen, handleMenuClose} = props
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
            handleMenuClose={handleMenuClose}
          />
        ) : null}
      </div>
    </div>
  )

  return (
    <div className={classes.appDrawerContainer}>
      <SideDrawer
        closeSideDrawer={handleMenuClose}
        // closeSideDrawer={props.closeSideDrawer}
        isClosed={props.appDrawerToggle}
        isMobile={props.isMobile}
        sideNavLocalStorage={props.sideNavLocalStorage}
      >
        {drawer}
      </SideDrawer>
    </div>
  )
}

export default AppSideNavbar
