import createStyles from '@mui/styles/createStyles'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'
import {TypographyTokens} from '../../../typography'
const styles = () => {
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens
  return createStyles({
    rootDrawer: {
      '& .MuiBackdrop-root': {
        background: 'transparent'
      }
    },
    createDrawer: {
      minWidth: '400px',
      width: '400px',
      background: aliasTokens.bg0,
      // height: '100%',
      marginLeft: '48px',
      borderRadius: '0px'
    },
    extendedDrawer: {
      minWidth: '856px',
      width: '856px',
      // height: '100%',
      background: aliasTokens.bg0,
      marginLeft: '48px',
      borderRadius: '0px'
    },
    parentContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      overflow: 'hidden'
      // height: 'calc(100vh - 80px)'
    },
    container: {
      minWidth: '400px',
      width: '400px',
      padding: '0px 20px 0px 20px'
      // overflowY: 'auto'
    },
    extendedContainer: {
      // height: '100%',
      padding: '0px 20px 0px 20px',
      borderLeft: `1px solid ${aliasTokens.border1}`
    },
    headingTitle: {
      ...TypographyTokens.headingDisplayXXS_SemiBold
    },
    header: {
      height: '64px',
      padding: '20px 12px 12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: aliasTokens.bg0,
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    line: {
      width: '100%',
      // margin: '16px 0 0 0',
      border: 'none',
      height: '1px',
      flex: '0 0 1px',
      backgroundColor: aliasTokens.border1
    },
    lineageHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${aliasTokens.border1}`,
      marginBottom: '16px'
    },
    lineageTitle: {
      ...TypographyTokens.headingDisplayXXS_SemiBold,
      marginLeft: '8px'
    }
  })
}

export default styles
