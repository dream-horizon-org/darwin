import {createUseStyles} from 'react-jss'
import {aliasTokens} from '../../theme.contants'
import {themeConfig} from './theme'

const appDrawerStyles = {
  appDrawerContainer: {
    height: '100%',
    marginTop: 48,
    backgroundColor: aliasTokens.secondary_background_color,
    color: aliasTokens.neutral_text_color
  },
  drawerPaper: {
    width: '242px',
    overflowY: 'hidden'
  },
  drawerHeader: {
    padding: '15px 25px'
  },
  drawerListContainer: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    fontFamily: themeConfig.fontFamily,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1'
  },
  drawerList: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '100%',
    fontFamily: themeConfig.fontFamily,
    display: 'flex',
    flexDirection: 'column'
  },
  drawerListBottom: {
    height: 'fit-content',
    fontFamily: themeConfig.fontFamily,
    display: 'flex',
    flexDirection: 'column'
  },
  menuToggleBtn: {
    marginTop: 'auto',
    width: '32px',
    height: '32px',
    marginLeft: 'auto',
    background: aliasTokens.hover_secondary_color,
    color: 'white',
    borderRadius: '16px 0px 0px 16px',
    marginBottom: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '& >span': {
      fontSize: '20px'
    }
  },
  noTextDecor: {
    textDecoration: 'none'
  },
  route: {
    display: 'flex',
    padding: '8px 0px 8px 24px',
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
    padding: '8px 8px 8px 14px',
    listStyleType: 'none',
    fontSize: 14,
    boxSizing: 'border-box',
    height: 48,
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&:hover': {
      background: aliasTokens.tertiary_background_color
    },
    '& .iconContainer': {
      fontSize: '20px'
    },
    '& .title': {
      marginLeft: '28px'
    }
  },
  selectedMenuItem: {
    paddingLeft: 10,
    background: aliasTokens.cta_hover_secondary_background_color,
    borderLeft: `4px solid #0074E8`
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
    height: 'calc(100% - 47px)'
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
