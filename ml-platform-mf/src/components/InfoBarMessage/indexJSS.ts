import {createStyles} from '@mui/material'
import {BackgroundVariant, Position} from 'reactflow'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      borderRadius: '4px',
      padding: '12px',
      justifyContent: 'space-between',
      marginTop: '31px'
    },
    infoContainer: {
      backgroundColor: aliasTokens.information_background_color
    },
    errorContainer: {
      backgroundColor: aliasTokens.error_background_color
    },
    info: {
      display: 'flex',
      alignItems: 'center'
    },
    infoIcon: {
      color: aliasTokens.info_purple_icon_color,
      width: '24px',
      height: '24px',
      marginRight: '8px'
    },
    reportIcon: {
      color: aliasTokens.warning_red_icon_color,
      width: '24px',
      height: '24px',
      marginRight: '8px'
    },
    infoText: {
      flexWrap: 'wrap',
      fontSize: '14px'
    },
    closeContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    learnMoreText: {
      padding: '4px 8px',
      fontWeight: '700',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0px',
      cursor: 'pointer'
    },
    closeButton: {
      marginLeft: '8px',
      cursor: 'pointer'
    }
  })

export default styles
