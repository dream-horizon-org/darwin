import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '340px',
      padding: '0 0 0 16px',
      borderLeft: `1px solid ${aliasTokens.disabled_border_color}`,
      height: 'calc(100vh - 188px)',
      flex: '0 0 25%',
      overflowY: 'auto'
    },
    collapseIconContainer: {
      position: 'absolute',
      backgroundColor: aliasTokens.cta_disabled_primary_background_color,
      padding: '5px',
      borderRadius: '50%',
      marginLeft: '-26px',
      marginTop: '20px',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    },
    collapseIcon: {
      width: '20px'
    },
    title: {
      color: aliasTokens.neutral_text_color,
      fontSize: '18px',
      fontWeight: 700,
      marginTop: '24px',
      marginBottom: '4px'
    },
    workflowDetail: {
      marginTop: '16px'
    },
    workflowDetailTitle: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '14px',
      fontWeight: 400,
      display: 'flex',
      justifyContent: 'space-between'
    },

    workflowDetailsDescription: {
      fontSize: '14px',
      fontWeight: 400,
      marginTop: '4px'
    },
    underline: {
      textDecoration: 'underline'
    },
    line: {
      width: '100%',
      margin: '16px 0 0 0',
      border: 'none',
      height: '1px',
      flex: '0 0 1px',
      backgroundColor: aliasTokens.tertiary_background_color
    },
    clusterContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1D1D1D',
      padding: '12px 10px',
      borderRadius: '10px',
      marginTop: '16px',
      minWidth: '300px'
    },
    clusterTitleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    left: {
      display: 'flex'
    },
    right: {
      fontSize: '14px',
      fontWeight: 400,
      color: aliasTokens.primary_text_color,
      cursor: 'pointer'
    },
    clusterTitle: {
      color: aliasTokens.secondary_text_color,
      fontSize: '14px',
      fontWeight: 400,
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    openInNewTabIcon: {
      marginLeft: '4px',
      width: '16px',
      cursor: 'pointer'
    },
    tag: {
      marginLeft: '12px'
    },
    clusterInfo: {
      marginTop: '6px',
      color: aliasTokens.tertiary_text_color,
      fontSize: '14px',
      fontWeight: 400
    },
    dashboards: {
      display: 'flex',
      marginTop: '18px'
    },
    dashboard: {
      display: 'flex',
      fontSize: '14px',
      fontWeight: 400,
      textDecoration: 'underline',
      marginLeft: '20px',
      alignItems: 'center',
      cursor: 'pointer',

      '&:first-of-type': {
        marginLeft: 0
      }
    },
    slackNotificationContainer: {
      display: 'flex'
    },
    slackLabel: {
      marginLeft: '8px'
    },
    notification_key: {
      marginBottom: '4px'
    }
  })

export default styles
