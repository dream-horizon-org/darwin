import {createStyles} from '@mui/material/styles'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'
import {TypographyTokens} from '../../../typography'

const lineageModalStyles = () => {
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens

  return createStyles({
    modal: {
      '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }
    },
    modalPaper: {
      width: '80vw',
      height: '80vh',
      maxWidth: '80vw',
      maxHeight: '80vh',
      backgroundColor: aliasTokens.bg0,
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    modalHeader: {
      padding: '24px 24px 16px 24px',
      borderBottom: `1px solid ${aliasTokens.border1}`,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      flexShrink: 0
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0
    },
    modalTitle: {
      ...TypographyTokens.headingDisplayXS_SemiBold,
      color: aliasTokens.textPrimary,
      marginBottom: '4px'
    },
    modalSubtitle: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textSecondary,
      wordBreak: 'break-all'
    },
    modalContent: {
      padding: '16px',
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      '&:first-child': {
        paddingTop: '16px'
      }
    }
  })
}

export default lineageModalStyles
