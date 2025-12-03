import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
      // background: aliasTokens.secondary_background_color
    },
    header: {
      height: '72px',
      padding: '14px 29px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${aliasTokens.tertiary_background_color} `
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column-reverse',
      flex: 1,
      marginLeft: '20px',
      paddingRight: '4px',
      maxWidth: '336px'
    },
    headerTitle: {
      fontWeight: '700',
      fontSize: '16px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    headerSubTitle: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.tertiary_text_color,
      marginBottom: '4px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '300px',
      textTransform: 'capitalize'
    },
    headerVersions: {
      flex: '0 0 108px'
    },
    headerCopyCode: {
      marginLeft: '28px',
      flex: '0 0 124px',
      color: aliasTokens.cta_secondary_text_color,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      '& .textItem': {
        fontWeight: '700',
        fontSize: '14px',
        lineHeight: '20px',
        marginLeft: '8px'
      },
      '& .iconItem': {
        '&:before': {
          color: aliasTokens.cta_secondary_text_color
        }
      }
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      padding: '24px'
    },
    sampleTable: {
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      borderRadius: '4px'
    },
    tableHead: {
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      background: aliasTokens.tertiary_background_color,
      color: aliasTokens.neutral_text_color,
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
    },
    headColumn1: {
      fontWeight: '700',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      flex: 1,
      padding: '14px 16px'
    },
    headColumn2: {
      fontWeight: '700',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      flex: 1,
      padding: '14px 16px'
    },
    headColumn3: {
      fontWeight: '700',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      flex: 1,
      padding: '14px 16px'
    },
    tableContent: {
      background: aliasTokens.secondary_background_color,
      maxHeight: 'calc(100vh - 242px)',
      overflowY: 'auto'
    },
    tableRow: {
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      color: aliasTokens.neutral_text_color,
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
    },
    contentColumn1: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      flex: 1,
      padding: '14px 16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    contentColumn2: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      flex: 1,
      padding: '14px 16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    contentColumn3: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      flex: 1,
      padding: '14px 16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    noDataFound: {
      color: aliasTokens.cta_error_border_color,
      fontSize: '32px',
      display: 'flex',
      justifyContent: 'center',
      marginTop: '30%'
    },
    copyButtonWrapper: {
      '&> button': {
        height: '40px'
      }
    }
  })

export default styles
