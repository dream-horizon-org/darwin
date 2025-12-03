import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      padding: '0 16px',
      height: 'calc(100vh - 233px)',
      flex: 1,
      overflowY: 'auto',
      paddingBottom: '16px'
    },
    formFieldTop: {
      marginTop: '24px'
    },
    input: {
      width: '92%'
    },
    formFieldContainer: {
      marginTop: '16px'
    },
    autocompleteDropdown: {
      display: 'flex',
      width: '92%',
      '& > div': {
        width: '100%'
      }
    },
    formLabel: {
      color: aliasTokens.neutral_text_color,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px'
    },
    subText: {
      fontSize: '10px',
      marginLeft: '4px'
    },
    scheduleContainer: {
      display: 'flex',
      width: '92%',
      alignItems: 'center',
      gap: '6px'
    },
    scheduleInput: {
      width: '100%'
    },
    inputWithInfoMessage: {
      display: 'flex',
      alignItems: 'center',
      color: aliasTokens.tertiary_text_color
    },
    error: {
      color: '#e10000',
      fontSize: '12px'
    },
    cronExpression: {
      marginTop: '8px',
      color: '#DB9200',
      fontSize: '12px'
    },
    slackLabel: {
      marginLeft: '8px'
    },
    HAContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: aliasTokens.secondary_background_color,
      borderRadius: '8px',
      color: aliasTokens.neutral_text_color,
      fontSize: '14px',
      boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.30)',
      backdropFilter: 'blur(12px)',
      top: 0,
      zIndex: 2,
      marginTop: '16px',
      width: '92%',
      padding: '12px'
    },
    HATextNote: {
      color: aliasTokens.information_text_color
    },
    HAHeader: {
      fontWeight: 600,
      marginBottom: '-4px'
    },
    HACheckbox: {
      padding: 0,
      color: aliasTokens.blue_border_color_2,
      '&.Mui-checked': {
        color: aliasTokens.blue_border_color_2
      },
      '&.Mui-disabled': {
        color: aliasTokens.checkbox_disabled_border_color
      },
      '&.Mui-disabled.Mui-checked': {
        color: aliasTokens.checkbox_disabled_border_color
      }
    },
    checkbox: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      fontWeight: 400,
      marginBottom: '8px',
      padding: '0px',
      height: '10px',
      gap: '10px'
    },
    HAInfoMessage: {
      display: 'flex',
      alignItems: 'flex-end'
    },
    concurrencyQueue: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: '16px'
    },
    QueueText: {
      paddingLeft: '4px'
    },
    notificationIcon: {
      color: aliasTokens.duration_warning_text_color
    },
    newLabel: {
      display: 'flex',
      height: '20px',
      padding: '2px 4px',
      alignItems: 'center',
      borderRadius: '4px',
      backgroundColor: aliasTokens.success_background_color,
      fontSize: '10px',
      marginLeft: '8px'
    },
    eventsText: {
      marginTop: '16px',
      marginBottom: '16px',
      fontWeight: '400',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0px'
    },
    eventsCheckboxContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: '32px'
    },
    eventsCheckbox: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    eventsInfoIcon: {
      color: aliasTokens.events_info_purple_icon_color,
      marginRight: '8px'
    },
    eventsTextNote: {
      display: 'flex',
      alignItems: 'flex-start',
      color: aliasTokens.events_info_purple_icon_color,
      marginTop: '16px'
    },
    eventsTextContent: {
      display: 'flex',
      flexDirection: 'column'
    }
  })

export default styles
