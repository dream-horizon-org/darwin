import {createStyles} from '@mui/styles'
import config from 'config'
// import {sidebarComponentToken} from '../../modules/app-drawer/AppDrawerJss'
import {typographyComponentTokens} from '../MsdTheme'
import {aliasTokens, themeConfig} from '../theme.contants'

const appbarComponentToken = {
  appbar_background_color: aliasTokens.secondary_background_color,
  appbar_text_color: aliasTokens.primary_text_color
}
const styles = (theme) =>
  createStyles({
    appLoadingOverlay: {
      opacity: 0.4,
      pointerEvents: 'none',
      flexGrow: 1,
      minHeight: '100%',
      zIndex: 1,
      position: 'relative',
      display: 'flex',
      width: '100%',
      fontFamily: themeConfig.fontFamily
    },
    gameContext: {
      height: 36,
      alignItems: 'center',
      // color: sidebarComponentToken.sidebar_menu_item_text_color,
      '&:before': {
        height: 0
      },
      '&:after': {
        height: 0
      }
    },
    gameContextContainer: {
      marginLeft: 16,
      width: 200
    },
    root: {
      flexGrow: 1,
      minHeight: '100%',
      zIndex: 1,
      position: 'relative',
      display: 'flex',
      width: '100%',
      fontFamily: themeConfig.fontFamily
    },
    appHeader: {
      width: '100%',
      height: 64,
      position: 'fixed',
      zIndex: 5
    },
    appDrawer: {
      position: 'fixed',
      maxWidth: '240px',
      zIndex: 4
    },
    backdrop: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: '#000000b0',
      top: '0',
      left: '0',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      zIndex: 2,
      maxWidth: '100%'
    },
    content: {
      display: 'flex',
      transition: 'all 0.3s ease-in-out',
      backgroundColor: aliasTokens.primary_background_color,
      color: typographyComponentTokens.default_text_color,
      [theme.breakpoints.up('xs')]: {
        width: '100%'
      },
      [theme.breakpoints.up('md')]: {
        minWidth: config.uiConfig.contentMaxWidth
      }
    },
    contentWithAppBar: {
      marginTop: 48,
      marginLeft: '48px'
    },
    contentWithSidebar: {
      // marginLeft: '240px'
    },
    paddingContent: {
      padding: theme.spacing(2)
    },
    loginContent: {
      backgroundImage: `url(${config.cfMsdAssetUrl}/images/Compressed_Login_Background_MSD.webp), url(${config.cfMsdAssetUrl}/images/msd_background.png)`,
      backgroundSize: 'cover',
      flexGrow: 1,
      display: 'flex',
      [theme.breakpoints.down('xl')]: {
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundImage: `url(${config.cfMsdAssetUrl}/images/Mobile_login_compressed_background.webp) ,url(${config.cfMsdAssetUrl}/images/login_bg_mobile.png)`
      }
    },
    dropdownContainer: {
      display: 'flex'
    }
  })

export default styles
