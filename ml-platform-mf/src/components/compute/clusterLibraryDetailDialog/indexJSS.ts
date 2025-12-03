import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    dialogContainer: {
      height: '400px',
      width: '600px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    },
    libraryDetails: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '28px',
      gap: '8px'
    },
    textDetails: {
      color: aliasTokens.neutral_text_color
    },
    failedStatus: {
      backgroundColor: aliasTokens.cta_failed_background_color
    },
    successStatus: {
      backgroundColor: aliasTokens.cta_success_background_color
    },
    uninstallPendingStatus: {
      backgroundColor: aliasTokens.pending_background_color
    },
    statusText: {
      padding: '4px 12px',
      borderRadius: '4px',
      width: 'fit-content'
    },
    closeButton: {
      marginTop: 'auto',
      alignSelf: 'flex-end'
    },
    loaderContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    },
    messageContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: aliasTokens.tertiary_background_color,
      padding: '12px',
      borderRadius: '4px',
      gap: '20px',
      height: '184px',
      overflow: 'auto'
    },
    errorHeading: {
      fontFamily: 'Roboto',
      fontWeight: '400',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0px'
    },
    errorDetails: {
      fontFamily: 'Roboto',
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: aliasTokens.neutral_text_color
    },
    errorDetailsContainer: {
      display: 'flex',
      flexDirection: 'column'
    }
  })

export default styles
