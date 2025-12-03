import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      width: 'calc(100% + 32px)',
      justifyContent: 'space-between',
      alignSelf: 'flex-start',
      backgroundColor: aliasTokens.secondary_background_color,
      margin: '-16px -16px 0px -16px'
    },
    left: {
      display: 'flex',
      height: '100%'
    },
    backIconContainer: {
      padding: '44px 24px 44px 36px',
      borderRight: `1px solid ${aliasTokens.disabled_border_color}`
    },
    workflowBasicInfo: {
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 32px'
    },
    workflowNameAndDescription: {
      display: 'flex',
      alignItems: 'center'
    },
    workflowName: {
      fontSize: '16px',
      fontWeight: 700,
      margin: 0
    },
    workfowDescription: {
      marginLeft: '16px',
      color: aliasTokens.tertiary_text_color,
      fontWeight: 400,
      fontSize: '14px'
    },
    tagsContainer: {
      display: 'flex',
      marginTop: '8px'
    },
    tag: {
      marginLeft: '8px',
      '&:first-of-type': {
        marginLeft: 0
      }
    },
    right: {
      display: 'flex',
      padding: '18px 24px 0 24px'
    },
    runDetails: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      borderRadius: '5px',
      fontSize: '14px',
      fontWeight: 400
    },
    buttonContainer: {
      display: 'flex',
      flex: '0 0 150px',
      marginLeft: '28px',
      '& > button': {
        width: '100%'
      },
      alignItems: 'flex-start'
    },
    primaryButtonContainer: {
      '& > button': {
        borderTopRightRadius: '0',
        borderBottomRightRadius: '0',
        '&:disabled': {
          color: 'red'
        }
      }
    },
    secondaryButtonContainer: {
      '& > button': {
        borderTopLeftRadius: '0',
        borderBottomLeftRadius: '0',
        borderLeft: `1px solid ${aliasTokens.ds_chip_active_hover_background_color}`,
        '&:disabled': {
          background: '#333333 !important',
          borderLeft: `1px solid ${aliasTokens.disabled_border_color}`,
          '& .icon': {
            '&:before': {
              color: '#4d4d4d !important'
            }
          }
        }
      }
    },
    runNowButtons: {
      display: 'flex',
      flexDirection: 'row'
    },
    statusContainer: {
      padding: '6px 0',
      marginTop: '7px'
    },
    seprator: {
      margin: '0 12px',
      width: '1px',
      height: '40px',
      backgroundColor: aliasTokens.disabled_border_color
    },
    runDetailsContainer: {
      display: 'flex',
      flexDirection: 'column'
    },
    timeIcon: {
      width: '24px',
      color: aliasTokens.info_purple_icon_color
    },
    editIcon: {
      width: '20px',
      marginLeft: '8px',
      cursor: 'pointer'
    },
    nextRunDetails: {
      fontSize: '14px',
      fontWeight: 400,
      alignSelf: 'flex-end',
      padding: '10px 0'
    },
    runTime: {
      marginLeft: '8px',
      width: '100%'
    },
    pauseIcon: {
      marginLeft: '12px'
    },
    resumeIcon: {
      marginLeft: '12px'
    },
    actions: {
      display: 'flex',
      marginLeft: '16px'
    },
    menuIcon: {
      marginTop: '8px',
      cursor: 'pointer'
    },
    actionIcon: {
      width: '16px'
    },
    backIcon: {
      cursor: 'pointer'
    }
  })

export default styles
