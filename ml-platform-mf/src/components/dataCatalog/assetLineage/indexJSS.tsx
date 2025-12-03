import {createStyles} from '@mui/material/styles'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'
import {TypographyTokens} from '../../../typography'

const styles = () => {
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens

  return createStyles({
    container: {
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      marginBottom: '16px',
      borderBottom: `1px solid ${aliasTokens.border1}`,
      paddingBottom: '12px'
    },
    title: {
      ...TypographyTokens.headingDisplayXS_SemiBold,
      color: aliasTokens.textPrimary,
      marginBottom: '4px'
    },
    subtitle: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textSecondary,
      wordBreak: 'break-all'
    },
    content: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    },
    loadingText: {
      marginTop: '12px',
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textSecondary
    },
    errorContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    },
    errorText: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textError
    },
    emptyContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    },
    emptyText: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textSecondary,
      textAlign: 'center'
    },
    graphContainer: {
      padding: '12px 0'
    },
    sectionTitle: {
      ...TypographyTokens.bodyUiLabelMedium_Medium,
      color: aliasTokens.textSecondary,
      marginBottom: '12px'
    },
    graphContent: {
      backgroundColor: aliasTokens.bg1,
      border: `1px solid ${aliasTokens.border1}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    },
    edgeItem: {
      padding: '8px 0',
      borderBottom: `1px solid ${aliasTokens.border1}`,
      '&:last-child': {
        borderBottom: 'none'
      }
    },
    nodeText: {
      ...TypographyTokens.bodyUiLabelSmall_Medium,
      color: aliasTokens.textPrimary,
      fontFamily: 'monospace'
    },
    fieldsText: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textSecondary,
      marginTop: '4px',
      fontFamily: 'monospace',
      wordBreak: 'break-all'
    },
    assetsInfoContainer: {
      marginTop: '16px'
    },
    assetsInfoContent: {
      backgroundColor: aliasTokens.bg1,
      border: `1px solid ${aliasTokens.border1}`,
      borderRadius: '8px',
      padding: '16px',
      maxHeight: '300px',
      overflow: 'auto'
    },
    assetsInfoText: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: aliasTokens.textPrimary,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all'
    }
  })
}

export default styles
