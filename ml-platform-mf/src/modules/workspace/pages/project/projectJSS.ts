import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: 'calc(100% + 32px)',
      paddingRight: '48px',
      display: 'flex',
      flexDirection: 'column',
      margin: '-16px',
      position: 'relative'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '8px',
      height: '48px'
    },
    left: {
      display: 'flex',
      alignItems: 'center'
    },
    right: {
      display: 'flex',
      alignItems: 'center'
    },
    heading: {
      color: aliasTokens.secondary_text_color,
      fontSize: '16px',
      fontWeight: 700
    },
    githubLink: {
      display: 'flex',
      marginLeft: '17.68px',
      alignItems: 'center',
      cursor: 'pointer',
      color: aliasTokens.tertiary_text_color,

      '& > .MuiSvgIcon-root': {
        height: '1.1rem',
        width: '1.1rem'
      },

      '& > span': {
        marginLeft: '9.67px',
        fontWeight: 700
      },

      '& > .newTabIcon': {
        marginLeft: '10px'
      }
    },
    newTabIcon: {
      '&:before': {
        color: `${aliasTokens.cta_tertiary_icon_color} !important`
      }
    },
    lastSavedTimeContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    cloudIcon: {
      '&:before': {
        fontSize: '18px',
        color: `${aliasTokens.cta_disabled_tertiary_text_color} !important`
      }
    },
    lastSavedTime: {
      marginLeft: '8.56px',
      fontSize: '14px',
      color: aliasTokens.cta_disabled_tertiary_text_color
    },
    jupyterLabContainer: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      '& >iframe': {
        border: 'none',
        flex: 1
      }
    },
    errorOverlay: {
      position: 'fixed',
      height: '100%',
      width: '100%',
      background: '#ff000052'
    },
    search: {
      padding: '6px 16px'
    },
    codespaceTitle: {
      padding: '6px 16px',
      fontSize: '12px',
      fontWeight: 400,
      color: aliasTokens.tertiary_text_color
    },
    linkIcon: {
      color: aliasTokens.cta_tertiary_text_color
    },
    linkText: {
      color: aliasTokens.cta_tertiary_text_color,
      fontSize: '14px'
    },
    description: {
      display: 'flex',
      color: aliasTokens.cta_disabled_primary_background_color,
      alignItems: 'center'
    },
    descriptionText: {
      fontSize: '10px'
    },
    projectName: {
      fontSize: '14px',
      color: aliasTokens.secondary_text_color
    },
    selectedCodespace: {
      fontSize: '12px',
      color: aliasTokens.cta_disabled_primary_background_color
    },
    codespaceName: {
      fontSize: '14px'
    },
    projectSpinner: {
      display: 'flex',
      margin: '3rem 0 3rem'
    },
    menuItem: {
      '&:hover': {
        backgroundColor: aliasTokens.secondary_background_color
      }
    },
    openedProject: {
      background: aliasTokens.secondary_background_color
    },
    selectedProject: {
      backgroundColor: `${aliasTokens.surface_background_color} !important`
    },
    projectNotFound: {
      height: '200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: aliasTokens.secondary_text_color,
      fontSize: '18px',
      fontWeight: 700
    },
    mainText: {
      margin: '8px 0 4px 0'
    },
    subText: {
      color: aliasTokens.tertiary_text_color,
      fontWeight: 400,
      fontSize: '14px',
      margin: 0
    },
    disablePointerEvents: {
      pointerEvents: 'none'
    },
    projectListContainer: {
      maxHeight: '200px',
      overflowY: 'scroll'
    },
    fullScreenIcon: {
      marginLeft: '24px',
      cursor: 'pointer'
    },
    VSCodeIcon: {
      width: '24px',
      Height: '24px',
      cursor: 'pointer'
    }
  })

export default styles
