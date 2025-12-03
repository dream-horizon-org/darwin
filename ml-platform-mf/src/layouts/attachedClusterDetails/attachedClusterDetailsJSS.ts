import {createStyles} from '@mui/material'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      display: 'flex',
      padding: '25px 29px'
    },
    title: {
      marginLeft: '21px',
      fontSize: '16px',
      fontWeight: 700
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 24px'
    },
    clusterDetails: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    clusterDetailsLeft: {
      display: 'flex',
      alignItems: 'center'
    },
    clusterDetailsRight: {
      cursor: 'pointer',
      padding: '8px',

      '&:hover': {
        backgroundColor: 'rgba(0, 87, 175, 0.2)',
        borderRadius: '50%'
      }
    },
    clusterName: {
      fontSize: '16px',
      fontWeight: 700,
      maxWidth: '210px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      '-webkit-line-clamp': 3,
      '-webkit-box-orient': 'vertical'
    },
    tag: {
      marginLeft: '8px',
      padding: '4px 8px',
      backgroundColor: aliasTokens.success_background_color,
      borderRadius: '4px',
      fontSize: '12px'
    },
    creatingTag: {
      marginLeft: '8px',
      padding: '4px 8px',
      backgroundColor: aliasTokens.information_background_color,
      borderRadius: '4px',
      fontSize: '12px'
    },
    inactiveTag: {
      marginLeft: '8px',
      padding: '4px 8px',
      backgroundColor: aliasTokens.warning_background_color,
      borderRadius: '4px',
      fontSize: '12px'
    },
    clusterCoresAndMemory: {
      marginTop: '8px',
      fontSize: '16px',
      fontWeight: 400,
      color: aliasTokens.tertiary_text_color
    },
    clusterDetailsLink: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '14px',
      fontSize: '14px',
      fontWeight: 400,
      color: aliasTokens.secondary_icon_color,
      cursor: 'pointer'
    },
    openInNewIcon: {
      marginLeft: '8px',
      height: '16px',
      width: '16px'
    },
    clusterUsageContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: '24px'
    },
    clusterUsageHeader: {
      display: 'flex',
      alignItems: 'center'
    },
    clusterUsageTitle: {
      marginLeft: '12px',
      fontWeight: 700,
      fontSize: '16px'
    },
    coresUtilisedStats: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '26px',
      fontSize: '16px',
      fontWeight: 400
    },
    utilisedBold: {
      fontWeight: 700
    },
    utilisedProgressBar: {
      marginTop: '12px',
      backgroundColor: aliasTokens.tertiary_background_color,

      '& .MuiLinearProgress-barColorPrimary': {
        backgroundColor: aliasTokens.success_border_color
      }
    },
    note: {
      marginTop: '20px',
      fontSize: '12px',
      fontWeight: 400,
      color: aliasTokens.tertiary_text_color
    },
    noteLabel: {
      fontWeight: 700,
      fontSize: '14px'
    },
    usageDashboardContainer: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '32px'
    },
    usageDashboardContainerNoTop: {
      display: 'flex',
      flexDirection: 'column'
    },
    usageDashboardHeading: {
      fontWeight: 700,
      fontSize: '14px'
    },
    usageDashboardLinks: {
      display: 'flex',
      marginTop: '14px'
    },
    usageDashboardLink: {
      display: 'flex',
      alignItems: 'center',
      color: aliasTokens.secondary_icon_color,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '400',
      marginLeft: '22px',

      '&:first-of-type': {
        marginLeft: '0'
      }
    },
    divider: {
      borderColor: aliasTokens.tertiary_background_color
    },
    linkColor: {
      color: aliasTokens.secondary_icon_color
    },
    detailsMargin: {
      margin: '0 24px'
    },
    closeIcon: {
      cursor: 'pointer'
    },
    actionIcon: {
      width: '16px'
    },
    disabledIcon: {
      color: aliasTokens.disabled_icon_color,
      cursor: 'not-allowed'
    },
    creatingClusterLoader: {
      backgroundColor: aliasTokens.cta_secondary_text_color,
      marginTop: '20px'
    }
  })

export default styles
