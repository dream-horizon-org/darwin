import {createStyles} from '@mui/material'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'
import {TypographyTokens} from '../../../typography'

const styles = () => {
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens
  return createStyles({
    root: {
      flexGrow: 1
      // padding: '20px'
    },
    assetListingContainer: {
      height: 'calc(100vh - 205px)',
      overflowY: 'auto',
      paddingBottom: '24px'
    },
    line: {
      width: '100%',
      margin: '16px 0 0 0',
      border: 'none',
      height: '1px',
      flex: '0 0 1px',
      backgroundColor: aliasTokens.border1
    }
  })
}

export default styles
