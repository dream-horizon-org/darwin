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
      maxWidth: '488px'
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
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 24px 0px 24px'
    },
    doubleInputWrapper: {
      display: 'flex'
    },
    doubleInput: {
      flex: 1,
      marginRight: '8px',
      '&:nth-child(2)': {
        marginRight: '0px',
        marginLeft: '8px'
      }
    },
    singleInputWrapper: {
      marginTop: '20px'
    },
    singleInput: {},
    tableWrapper: {
      display: 'flex',
      flexDirection: 'column',
      background: aliasTokens.secondary_background_color,
      marginTop: '20px',
      borderRadius: '4px',
      maxHeight: 'calc(100vh - 242px)',
      overflow: 'hidden'
    },
    tableHeader: {
      height: '48px',
      fontWeight: '700',
      fontSize: '14px',
      lineHeight: '20px',
      padding: '14px 16px',
      background: aliasTokens.cta_disabled_primary_text_color,
      color: aliasTokens.neutral_text_color
    },
    tableContentWrapper: {
      overflowY: 'auto'
    },
    tableContent: {
      cursor: 'pointer',
      height: '48px',
      display: 'flex',
      borderBottom: `1px solid ${aliasTokens.cta_disabled_primary_text_color}`,
      borderRight: `1px solid ${aliasTokens.cta_disabled_primary_text_color}`,
      borderLeft: `1px solid ${aliasTokens.cta_disabled_primary_text_color}`,
      '&:hover': {
        background: aliasTokens.cta_disabled_secondary_background_color
      }
    },
    tableLoader: {
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: `1px solid ${aliasTokens.cta_disabled_primary_text_color}`,
      borderRight: `1px solid ${aliasTokens.cta_disabled_primary_text_color}`,
      borderLeft: `1px solid ${aliasTokens.cta_disabled_primary_text_color}`,
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      padding: '14px 14px 14px 16px'
    },
    tableData: {
      display: 'flex',
      alignItems: 'center',
      flex: '1',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      '& .itemContent': {
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '20px',
        padding: '14px 14px 14px 16px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },
      '& .itemIcon': {
        fontSize: '12px',
        cursor: 'pointer',
        '&:before': {
          color: aliasTokens.secondary_icon_color
        }
      }
    },
    tableAction: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: aliasTokens.primary_text_color,
      fontSize: '24px',
      padding: '12px',
      cursor: 'pointer'
    },
    noDataFound: {
      color: aliasTokens.cta_error_border_color,
      fontSize: '32px',
      display: 'flex',
      justifyContent: 'center',
      marginTop: '30%'
    },
    noRowsInTable: {
      display: 'flex',
      justifyContent: 'center',
      margin: '30px 0'
    }
  })

export default styles
