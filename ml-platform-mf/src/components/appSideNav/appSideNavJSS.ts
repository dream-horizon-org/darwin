import {createUseStyles} from 'react-jss'
import {themeConfig} from './theme'

const appDrawerStyles = {
  appDrawerContainer: {
    height: '100%',
    marginTop: 64,
    backgroundColor: themeConfig.sideBarBackground,
    color: themeConfig.sidebarText
  },
  drawerPaper: {
    width: '242px',
    overflowY: 'hidden'
  },
  drawerHeader: {
    padding: '15px 25px'
  },
  drawerList: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%',
    fontFamily: themeConfig.fontFamily
  },
  noTextDecor: {
    textDecoration: 'none'
  },
  route: {
    display: 'flex',
    padding: '8px 0px 8px 44px',
    height: 40,
    alignItems: 'center',
    fontSize: 14,
    boxSizing: 'border-box',
    listStyleType: 'none',
    '&:hover': {
      paddingLeft: 40,
      color: themeConfig.sidebarHoverText,
      background: themeConfig.sidebarHoverBackground
    }
  },
  profileContainer: {
    display: 'flex'
  },
  mainMenuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 8px 8px 24px',
    listStyleType: 'none',
    fontSize: 14,
    boxSizing: 'border-box',
    height: 40,
    alignItems: 'center',
    '&:hover': {
      paddingLeft: 20,
      color: themeConfig.sidebarHoverText,
      background: themeConfig.sidebarHoverBackground
    }
  },
  selectedMenuItem: {
    paddingLeft: 20,
    background: themeConfig.sidebarHoverBackground,
    color: themeConfig.sidebarHoverText,
    borderLeft: `4px solid ${themeConfig.borderColor}`
  },
  selectedRoute: {
    paddingLeft: 40
  },
  menu: {
    maxHeight: '0px',
    overflow: 'hidden',
    transition: 'max-height .4s ease-out'
  },
  collapseMenu: {
    maxHeight: '1000px',
    transition: 'max-height .4s ease-in'
  },
  leftIcon: {
    width: 20
  },
  menuText: {
    paddingLeft: 8
  },
  arrowIcon: {
    width: 20,
    marginRight: 20
  },
  headerContainer: {
    position: 'fixed',
    width: 240,
    zIndex: 10000
  },
  fancodeMenu: {
    width: '100%',
    height: 'calc(100% - 125px)',
    background: themeConfig.sideBarBackground
  },
  fantasyMenu: {
    width: '100%',
    height: 'calc(100% - 125px)',
    background: themeConfig.sideBarBackground
  },
  customerSupportMenu: {
    width: '100%',
    height: 'calc(100% - 90px)',
    background: themeConfig.sideBarBackground
  },
  abdMenu: {
    width: '100%',
    height: 'calc(100% - 90px)',
    background: themeConfig.sideBarBackground
  },
  baseMenu: {
    width: '100%',
    height: 'calc(100% - 47px)',
    background: themeConfig.sideBarBackground
  },
  marketingMenu: {
    width: '100%',
    height: 'calc(100% - 86px)',
    background: themeConfig.sideBarBackground
  },
  listContainer: {
    background: themeConfig.headerBackground
  },
  rotate: {
    transform: 'rotate(180deg)',
    transition: 'all 0.2s linear'
  },
  reverse: {
    transform: 'rotate(0deg)',
    transition: 'all 0.2s linear'
  },
  removeTopBorder: {
    borderTop: 'none'
  }
}
export const useAppDrawerStyles = createUseStyles(appDrawerStyles)
