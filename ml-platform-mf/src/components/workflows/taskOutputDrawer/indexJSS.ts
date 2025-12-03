import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      '& .react-flow__node': {
        padding: 0
      }
    },
    nodeContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: aliasTokens.surface_background_color,
      color: aliasTokens.primary_text_color,
      padding: '8px 12px',
      fontSize: '14px',
      fontWeight: 400,
      borderRadius: '8px'
    },
    successNode: {
      border: `1px solid ${aliasTokens.cta_success_border_color_2}`
    },
    errorNode: {
      border: `1px solid ${aliasTokens.cta_error_border_color_2}`
    },
    skippedNode: {
      border: `1px solid ${aliasTokens.cta_skipped_border_color}`
    },
    nodeTitleContainer: {
      padding: '8px',
      backgroundColor: '#000000',
      borderRadius: '4px'
    },
    description: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      marginTop: '5px'
    },
    descriptionText: {
      marginLeft: '4px',
      color: aliasTokens.tertiary_text_color
    },

    taskDetailsContainer: {
      display: 'grid',
      width: '100%',
      gridTemplateColumns: '75% 25%'
    },
    taskoutput: {
      display: 'flex',
      flexDirection: 'column'
      // flex: '0 0 75%'
    },
    taskoutputTitleContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
      padding: '16px',
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
    },
    taskoutputTitle: {
      fontSize: '16px',
      fontWeight: 700
    },
    errorContainer: {
      margin: '24px',
      marginBottom: 0,
      maxHeight: '200px',
      overflowY: 'auto',

      '& .bannerRightContent': {
        '& button:first-of-type': {
          border: '1px solid white'
        }
      },
      '& .bannerContent': {
        '& p': {
          wordBreak: 'break-word'
        }
      }
    },
    taskoutputContent: {
      margin: '24px',
      borderRadius: '8px',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      maxHeight: 'calc(100vh - 195px)',
      overflowY: 'auto',
      fontSize: '12px',
      fontStyle: 'italic',
      backgroundColor: aliasTokens.tertiary_background_color,
      wordBreak: 'break-all',
      height: '100%'
    },
    htmlTaskOutput: {
      backgroundColor: '#ffffff'
    },
    taskDetailsSidePanel: {
      display: 'flex',
      flexDirection: 'column',
      borderLeft: `1px solid ${aliasTokens.disabled_border_color}`,
      padding: '20px 24px',
      height: 'calc(100vh - 66px)',
      overflowY: 'auto'
      // flex: '0 0 25%'
    },
    collapseIconContainer: {
      position: 'absolute',
      backgroundColor: aliasTokens.cta_disabled_primary_background_color,
      padding: '5px',
      borderRadius: '50%',
      marginLeft: '-33px',
      marginTop: '0px',
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
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center'
    },
    titleName: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    workflowDetail: {
      marginTop: '16px'
    },
    workflowDetailTitle: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '14px',
      fontWeight: 400
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
      borderRadius: '10px'
    },
    clusterTitleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    left: {
      display: 'flex'
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
    tabLoad: {
      display: 'flex',
      flexDirection: 'row'
    },
    refreshIcon: {
      color: aliasTokens.cta_secondary_text_color,
      marginRight: '10px',
      cursor: 'pointer'
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
      cursor: 'pointer',

      '&:first-of-type': {
        marginLeft: 0
      }
    },
    runStatus: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      color: aliasTokens.base_text_color,
      padding: '4px 8px',
      borderRadius: '4px',
      marginLeft: '16px',
      backgroundColor: aliasTokens.cta_success_background_color,
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&.failed': {
        backgroundColor: aliasTokens.cta_failed_background_color
      },
      '&.running': {
        backgroundColor: aliasTokens.information_background_color
      },
      '&.upstreamFailed': {
        backgroundColor: '#916412'
      },
      '&.skipped': {
        backgroundColor: aliasTokens.cta_skipped_border_color
      }
    },
    runTrigger: {
      fontSize: '12px',
      borderRadius: '4px',
      marginLeft: '16px',
      fontWeight: 400,
      backgroundColor: aliasTokens.information_background_color,
      color: aliasTokens.neutral_text_color,
      padding: '4px 8px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    taskDetailsContainerSection: {
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
    taskDetailsDescription: {
      fontSize: '14px',
      fontWeight: 400,
      marginTop: '4px',
      overflowWrap: 'anywhere'
    },
    tabContainer: {
      display: 'grid',
      width: '300px',
      gridTemplateColumns: 'auto auto',
      gap: '2px',
      backgroundColor: aliasTokens.tertiary_background_color,
      borderRadius: '4px',
      padding: '2px'
    },
    tab: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 700,
      height: '28px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      color: aliasTokens.tertiary_text_color,
      borderRadius: '4px',
      '&:hover': {
        color: aliasTokens.neutral_text_color,
        backgroundColor: aliasTokens.cta_hover_tertiary_background_color
      },
      '&.active': {
        color: aliasTokens.neutral_text_color,
        backgroundColor: aliasTokens.cta_hover_tertiary_background_color
      }
    },
    progressBarContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '70%'
    },
    progressBarFilled: {
      backgroundColor: aliasTokens.tertiary_background_color,
      width: '20%',
      '& .MuiLinearProgress-barColorPrimary': {
        backgroundColor: aliasTokens.cta_secondary_text_color
      }
    },
    progressText: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginLeft: '10px'
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
    eventsText: {
      marginBottom: '16px',
      fontWeight: '400',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0px',
      display: 'flex',
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
