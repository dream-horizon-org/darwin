import {createStyles} from '@material-ui/core'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'
import {TypographyTokens} from '../../../typography'
const styles = () => {
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens
  return createStyles({
    InfoBarContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: aliasTokens.bgInfo2,
      borderRadius: '8px',
      marginTop: '20px'
    },
    infoBarTextContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    infoBarText: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textInfo,
      marginLeft: '8px'
    },
    refreshIcon: {
      color: aliasTokens.iconBrand,
      cursor: 'pointer'
    },
    searchContainer: {
      margin: '12px 0px 12px 0px',
      width: '100%',
      '& .MuiInputBase-input': {
        color: aliasTokens.textPrimary
      }
    }
  })
}

export default styles
