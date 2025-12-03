import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      position: 'fixed',
      width: 'calc(100% - 48px)',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: aliasTokens.secondary_background_color,
      zIndex: 2,
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
    },
    left: {
      display: 'flex',
      alignItems: 'center'
    },
    right: {
      display: 'flex',
      alignItems: 'center'
    },
    workflowTitle: {
      marginLeft: '28px',
      marginRight: '24px',
      fontSize: '18px',
      color: aliasTokens.tertiary_text_color
    },
    workflowDescription: {
      marginLeft: '28px',
      fontSize: '18px'
    },
    seperator: {
      height: '20px',
      width: '1px',
      backgroundColor: aliasTokens.neutral_text_color
    },
    disabledSeperator: {
      height: '39px',
      width: '1px',
      backgroundColor: aliasTokens.tertiary_background_color
    },
    link: {
      marginLeft: '24px',
      fontSize: '12px',
      color: aliasTokens.cta_secondary_text_color,
      cursor: 'pointer'
    },
    arrowIcon: {
      cursor: 'pointer',
      color: aliasTokens.tertiary_text_color,
      width: '24px',
      height: '24px'
    },
    scheduleContainer: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      padding: '8px',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      borderRadius: '4px',
      marginRight: '12px'
    },
    addScheduleIcon: {
      color: aliasTokens.info_purple_icon_color
    },
    addScheduleText: {
      marginLeft: '8px'
    },
    btnContainer: {
      marginLeft: '12px'
    }
  })

export default styles
