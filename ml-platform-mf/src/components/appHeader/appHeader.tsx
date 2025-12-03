import config from 'config'
import React, {useCallback, useState} from 'react'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import {
  ActionableIconButtonVariants,
  IconButton,
  IconButtonSizes,
  IconButtonVariants
} from '../../bit-components/icon-button/index'
import {Icons} from '../../bit-components/icon/index'
import {headerStaticLinks} from '../../constants'
import CircleLoader from '../../modules/login/circleLoader'
import DarwinLogo from '../../modules/login/darwinLogo'
import {useStyles} from './appHeaderJSS'
const LogoutIcon = require('./logout.svg')
const ShieldIcon = require('./shieldIcon.svg')

const MenuIcon = `${config.cfMsdAssetUrl}/icons/menu-icon.svg`

export const HEADER_BUTTON_IDENTIFIER = 'headerMenuButton'

const TITLE_BY_LOCATION = {userDetails: 'User Details'}

export const clearStorage = () => {
  localStorage.removeItem('x-refresh-token')
  localStorage.removeItem('x-access-token')
  localStorage.removeItem('x-user-details')
  localStorage.removeItem('x-permissions')
  localStorage.removeItem('intalkLoggedIn')
}

const AppHeader = (props: {
  userPermissions: string[]
  isMobile?: boolean
  handleMenuOpen: () => void
  handleMenuClose: () => void
  hideMenuIcon?: boolean
  isValidUrl: boolean
  appDrawerToggle: boolean
}) => {
  const classes = useStyles()
  const history = useHistory()

  const handleLogout = () => {
    setLoading(true)
    clearStorage()
    window.location.href = `/login`
    setLoading(false)
  }

  const handleLogoClick = () => {
    if (props.isValidUrl) history.push(`/dashboard`)
  }
  const [loading, setLoading] = useState(false)

  return (
    <div className={classes.header}>
      <div className={classes.headerLeft}>
        <div className={classes.menuIcon} id='headerMenuButton'>
          {props.appDrawerToggle && (
            <IconButton
              leadingIcon={Icons.ICON_MENU}
              actionable={true}
              size={IconButtonSizes.SMALL}
              actionableVariants={
                ActionableIconButtonVariants.ACTIONABLE_SECONDARY
              }
              onClick={props.handleMenuOpen}
            />
          )}
          {!props.appDrawerToggle && (
            <IconButton
              leadingIcon={Icons.ICON_CLOSE}
              actionable={true}
              size={IconButtonSizes.SMALL}
              actionableVariants={
                ActionableIconButtonVariants.ACTIONABLE_SECONDARY
              }
              onClick={props.handleMenuClose}
            />
          )}
        </div>
        <div className={classes.logo}>
          <DarwinLogo onClick={handleLogoClick} />
        </div>
      </div>
      <div className={classes.iconContainer}>
        {headerStaticLinks.map((item) => (
          <Link
            className={classes.headerStaticLink}
            to={{pathname: item.link}}
            target={item.target}
          >
            {item.name}
          </Link>
        ))}
        {/* <div className={classes.logoutIcon}>
          {loading ? (
            <CircleLoader />
          ) : (
            <img
              src={LogoutIcon}
              alt=''
              width={24}
              height={64}
              onClick={handleLogout}
            />
          )}
        </div> */}
      </div>
    </div>
  )
}

export default AppHeader
