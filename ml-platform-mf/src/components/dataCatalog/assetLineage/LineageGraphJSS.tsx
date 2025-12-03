import {createStyles} from '@mui/material/styles'
import {useBitThemeContext} from '../../../bit-components/bit-theme-wrapper/index'
import {darkThemeTokens, lightThemeTokens} from '../../../newThemeConstants'
import {TypographyTokens} from '../../../typography'

const lineageGraphStyles = () => {
  const {theme} = useBitThemeContext()
  const aliasTokens = theme === 'dark' ? darkThemeTokens : lightThemeTokens

  return createStyles({
    graphContainer: {
      width: '100%',
      height: '100%',
      minHeight: '500px',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: aliasTokens.bg0
    },
    graphWrapper: {
      width: '100%',
      height: '100%',
      position: 'relative',
      paddingBottom: '60px' // Ensure space for controls
    },
    emptyContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px',
      border: `1px solid ${aliasTokens.border1}`,
      borderRadius: '8px',
      backgroundColor: aliasTokens.bg1
    },
    emptyText: {
      ...TypographyTokens.bodyUiLabelMedium_Regular,
      color: aliasTokens.textSecondary,
      textAlign: 'center'
    },
    nodeTitle: {
      ...TypographyTokens.bodyUiLabelMedium_Medium,
      color: '#1a1a1a',
      marginBottom: '4px',
      wordBreak: 'break-word',
      fontSize: '14px',
      fontWeight: 600
    },
    nodeMetadata: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: '#666666',
      wordBreak: 'break-word',
      fontSize: '11px'
    },
    fieldItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 8px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#ffffff',
      '&:last-child': {
        borderBottom: 'none'
      },
      '&:hover': {
        backgroundColor: '#f5f5f5'
      },
      '&:nth-child(even)': {
        backgroundColor: '#fafafa'
      }
    },
    fieldName: {
      ...TypographyTokens.bodyUiLabelSmall_Medium,
      color: '#2c3e50',
      fontSize: '12px',
      fontWeight: 600,
      flex: 1,
      minWidth: 0,
      marginRight: '12px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },
    fieldType: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: '#ffffff',
      fontSize: '11px',
      fontFamily: 'monospace',
      backgroundColor: '#2196f3',
      padding: '3px 8px',
      borderRadius: '6px',
      flexShrink: 0,
      fontWeight: 600,
      border: '1px solid #1976d2',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      minWidth: 'fit-content'
    },
    moreFields: {
      ...TypographyTokens.bodyUiLabelSmall_Regular,
      color: '#888888',
      fontStyle: 'italic',
      textAlign: 'center',
      padding: '6px 0 2px 0',
      fontSize: '10px',
      borderTop: `1px solid #e0e0e0`,
      marginTop: '4px'
    },
    edgeLabel: {
      cursor: 'pointer',
      '&:hover': {
        opacity: 0.8
      }
    }
  })
}

export default lineageGraphStyles
