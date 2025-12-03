import {createStyles} from '@mui/material'
import {BackgroundVariant, Position} from 'reactflow'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {},
    datatable: {
      height: 'calc(100vh - 320px)'
    },
    statusColumn: {
      padding: '4px 8px',
      borderRadius: '4px'
    },
    failedStatus: {
      backgroundColor: aliasTokens.cta_failed_background_color
    },
    failedInactiveStatus: {
      backgroundColor: aliasTokens.cta_failed_inactive_background_color,
      color: aliasTokens.tertiary_text_color
    },
    successStatus: {
      backgroundColor: aliasTokens.cta_success_background_color
    },
    successInactiveStatus: {
      backgroundColor: aliasTokens.cta_success_inactive_background_color,
      color: aliasTokens.tertiary_text_color
    },
    uninstallPendingStatus: {
      backgroundColor: aliasTokens.pending_background_color
    },
    libraryName: {
      color: aliasTokens.cta_secondary_text_color,
      cursor: 'pointer'
    },
    loaderContainer: {
      margin: '24px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    retryIcon: {
      color: aliasTokens.cta_secondary_icon_color,
      cursor: 'pointer'
    },
    disabledRetryIcon: {
      color: aliasTokens.cta_disabled_tertiary_icon_color,
      cursor: 'not-allowed'
    }
  })

export default styles
