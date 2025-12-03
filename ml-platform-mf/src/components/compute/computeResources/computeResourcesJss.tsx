import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      background: aliasTokens.secondary_background_color,
      borderRadius: '8px',
      padding: '24px',
      width: '396px',
      marginLeft: '24px',
      flex: '0 0 396px',
      height: 'fit-content',
      position: 'sticky',
      top: '180px'
    },
    title: {
      display: 'flex',
      color: aliasTokens.tertiary_text_color,
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '24px',
      alignItems: 'center',
      marginBottom: '8px',

      '& .name': {
        flex: 1,
        paddingLeft: '11px'
      }
    },
    line: {
      width: '100%',
      margin: '16px 0 0 0',
      border: 'none',
      height: '1px',
      flex: '0 0 1px',
      backgroundColor: aliasTokens.tertiary_background_color,
      marginTop: '24px',
      marginBottom: '24px'
    },
    detailsWrapper: {
      display: 'flex',
      marginTop: '8px'
    },
    resource: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      color: aliasTokens.tertiary_text_color,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',

      '& >div:nth-child(2)': {
        marginTop: '8px',
        color: aliasTokens.neutral_text_color,
        fontWeight: '700',
        fontSize: '24px',
        lineHeight: '28px'
      }
    },
    detailsBtn: {
      fontSize: '12px',
      color: aliasTokens.cta_secondary_text_color,
      display: 'flex',
      alignItems: 'center',
      marginTop: '32px',
      cursor: 'pointer'
    },
    advanceConfig: {
      marginTop: '16px'
    },
    advanceConfigWrapper: {
      marginTop: '24px'
    },
    advanceConfigTitle: {
      color: aliasTokens.tertiary_text_color,
      fontWeight: 700,
      fontSize: '14px'
    },
    memoryUnit: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '14px',
      fontWeight: 400
    },
    utilisedProgressBar: {
      marginTop: '12px',
      backgroundColor: aliasTokens.tertiary_background_color,

      '& .MuiLinearProgress-barColorPrimary': {
        backgroundColor: aliasTokens.success_border_color
      }
    },
    usageContainer: {
      display: 'flex',
      justifyContent: 'space-between',

      '& >div': {
        width: '45%'
      }
    },
    usageDetails: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    usageDescription: {
      fontSize: '14px',
      fontWeight: 400
    },
    estimatedCost: {
      display: 'flex',
      alignItems: 'center',
      '& span': {
        marginLeft: '6px'
      }
    },
    overallCluster: {
      marginTop: '8px'
    }
  })

export default styles
