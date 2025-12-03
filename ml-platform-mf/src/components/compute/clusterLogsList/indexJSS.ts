import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: '24px',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      borderRadius: '4px',
      height: 'calc(100vh - 320px)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: aliasTokens.tertiary_background_color,
      borderRadius: '4px 4px 0 0',
      padding: '6px 24px 6px 24px',
      fontSize: '12px',
      fontWeight: 400
    },
    headerRow: {
      display: 'flex',
      flex: 1
    },
    headerCol: {
      width: '300px',

      '&:last-of-type': {
        width: '100%'
      }
    },
    right: {
      display: 'flex',
      alignItems: 'center'
    },
    body: {
      fontSize: '12px',
      fontWeight: 400,
      overflowY: 'auto'
    },
    row: {
      display: 'flex',
      marginTop: '4px',

      '&:hover': {
        backgroundColor: aliasTokens.tertiary_background_color
      }
    },
    rowCol: {
      width: '295px',
      display: 'flex',
      alignItems: 'center',

      '&:first-of-type': {
        width: '330px'
      },

      '&:last-of-type': {
        width: '100%',
        display: 'block'
      }
    },
    rectangle: {
      width: '4px',
      height: '16px',
      background: aliasTokens.blue_border_color_2,
      marginRight: '8px',
      marginLeft: '4px',
      borderRadius: '2px'
    },
    link: {
      color: aliasTokens.cta_secondary_text_color,
      cursor: 'pointer',
      marginLeft: '8px'
    },
    dialogContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '800px',
      width: '1000px'
    },
    dialogContentLabel: {
      fontSize: '16px',
      fontWeight: 400,
      color: aliasTokens.neutral_text_color
    },
    editorContainer: {
      height: '100%',
      marginTop: '16px'
    },
    switchBase: {
      color: aliasTokens.tertiary_text_color,
      '&.Mui-checked': {
        color: aliasTokens.blue_border_color_2
      }
    },
    track: {
      backgroundColor: aliasTokens.surface_background_color,
      '&.Mui-checked': {
        backgroundColor: aliasTokens.switch_background_color
      }
    },
    loader: {
      display: 'flex',
      justifyContent: 'center',
      margin: '24px 0'
    },
    logDetailsLoader: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '200px 0'
    },
    recentLogsLoader: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '8px 0'
    },
    loaderText: {
      fontSize: '12px',
      fontWeight: 400,
      color: aliasTokens.tertiary_text_color,
      marginLeft: '8px'
    },
    levelCol: {
      width: '100px'
    },
    noLogs: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '500px',
      fontSize: '12px',
      fontWeight: 400,
      color: aliasTokens.error_text_color
    }
  })

export default styles
