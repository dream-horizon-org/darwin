import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      height: 'calc(100vh - 233px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 16px',
      flex: 1,
      overflowY: 'auto',
      paddingBottom: '16px'
    },
    formFieldTop: {
      marginTop: '24px'
    },
    formFieldContainer: {
      marginTop: '16px'
    },
    formLabel: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center'
    },
    taskParametersLabel: {
      color: aliasTokens.primary_text_color,
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      marginTop: '16px'
    },
    formField: {
      marginTop: '8px'
    },
    radioInput: {
      marginLeft: '8px'
    },
    radioContainer: {
      display: 'flex'
    },
    input: {
      width: '92%',

      '& > div': {
        width: '100%'
      },
      '& > div > div.MuiOutlinedInput-root': {
        height: '40px'
      }
    },
    inputWithInfoMessage: {
      display: 'flex',
      alignItems: 'center',
      color: aliasTokens.tertiary_text_color
    },
    timeoutInputWithInfoMessage: {
      display: 'flex',
      alignItems: 'center',
      color: aliasTokens.tertiary_text_color,
      width: '70%'
    },
    autocompleteDropdown: {
      display: 'flex',
      width: '100%',
      '& > div': {
        width: '100%'
      }
    },
    dynamicUpdateFiles: {
      fontSize: '14px',
      marginLeft: '8px'
    },
    parametersContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginTop: '8px',
      '&:first-of-type': {
        marginTop: 0
      }
    },
    closeIcon: {
      fontSize: '16px',
      cursor: 'pointer'
    },
    disabled: {
      color: aliasTokens.disabled_text_color
    },
    addIcon: {
      marginTop: '8px'
    },
    formFieldSubText: {
      fontWeight: 400,
      fontSize: '14px',
      marginLeft: '12px'
    },
    runConditionHeader: {
      fontFamily: 'Roboto',
      fontWeight: '700',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0px',
      marginBottom: '8px'
    },
    notificationIcon: {
      width: '20px',
      height: '20px'
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
      marginBottom: '16px',
      fontWeight: '400',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0px',
      display: 'flex',
      alignItems: 'center'
    },
    eventsCheckboxContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: '32px'
    },
    eventsCheckbox: {
      display: 'flex',
      flexDirection: 'row',
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
    },
    slackLabel: {
      marginLeft: '8px'
    },
    slackText: {
      marginBottom: '8px'
    },
    subText: {
      fontSize: '10px',
      marginLeft: '4px'
    },
    runIfDependencies: {
      marginTop: '12px',
      marginBottom: '4px'
    },
    dependsOnDropdown: {
      marginBottom: '8px'
    },
    typeAndSourceContainer: {
      width: '100%',
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      columnGap: '12px'
    },

    typeAndSourceInputContainer: {
      flex: 1,
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },

    librariesContainer: {
      display: 'flex',
      gap: '16px',
      flexDirection: 'column'
    },
    libraryContainer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'space-between'
    },
    libraryName: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      wordBreak: 'break-all'
    }
  })

export default styles
