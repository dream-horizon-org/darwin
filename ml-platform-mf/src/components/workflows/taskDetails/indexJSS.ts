import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '0 22px',
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
      marginLeft: '-32px',
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
    taskDetailsContainer: {
      display: 'flex',
      gap: '24px'
    },
    taskDetail: {
      marginTop: '16px',
      flex: 1
    },
    taskDetailTitle: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '14px',
      fontWeight: 400,
      display: 'flex',
      justifyContent: 'space-between'
    },
    taskDetailsDescription: {
      fontSize: '14px',
      fontWeight: 400,
      marginTop: '4px',
      overflowWrap: 'anywhere'
    },
    line: {
      width: '100%',
      margin: '16px 0 0 0',
      border: 'none',
      height: '1px',
      flex: '0 0 1px',
      backgroundColor: aliasTokens.tertiary_background_color
    },
    left: {
      display: 'flex'
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
    loaderContainer: {
      height: 'calc(100vh - 380px)'
    },
    pathLink: {
      display: 'flex',
      flexDirection: 'row',
      textDecoration: 'underline',
      fontSize: '14px',
      fontWeight: 400,
      marginTop: '4px',
      overflowWrap: 'anywhere',
      cursor: 'pointer'
    },
    dependsOnChip: {
      marginLeft: '4px',
      '&:first-of-type': {
        marginLeft: 0
      }
    },
    dependencyContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '12px'
    },
    triggerConditionText: {
      fontFamily: 'Roboto',
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0px',
      marginLeft: '4px'
    },
    notificationIcon: {
      width: '20px',
      height: '20px'
    },
    formFieldSubText: {
      fontWeight: 400,
      fontSize: '14px',
      marginLeft: '12px'
    },
    eventsText: {
      marginBottom: '16px',
      fontWeight: '400',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0px',
      display: 'flex',
      // alignItems: 'center',
      flexDirection: 'column'
    },
    formFieldContainer: {
      marginTop: '16px'
    },
    slackLabel: {
      marginLeft: '8px'
    },
    notificationPreference: {
      marginTop: '4px',
      marginBottom: '-16px',
      fontSize: '14px'
    }
  })

export default styles
