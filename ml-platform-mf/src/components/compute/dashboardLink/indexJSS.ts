import {createStyles} from '@mui/material'
import {Background} from 'reactflow'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: aliasTokens.secondary_background_color,
      padding: '12px 16px',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      borderRadius: '4px',
      width: '100%',
      cursor: 'pointer'
    },
    top: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    left: {
      display: 'flex',
      alignItems: 'center'
    },
    dashboardIcon: {
      width: '32px',
      height: '32px'
    },
    titleContainer: {
      marginLeft: '12px'
    },
    titleContainerWithMargin: {
      marginTop: '8px',
      marginBottom: '8px'
    },
    dashboardTitle: {
      fontWeight: 400,
      fontSize: '14px'
    },
    dashboardWithTitle: {
      margin: 0
    },
    icon: {
      height: '24px',
      color: aliasTokens.cta_secondary_text_color
    },
    inActiveTitle: {
      color: aliasTokens.tertiary_text_color
    },
    inActiveIcon: {
      color: aliasTokens.disabled_icon_color
    },
    launchBtn: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      margin: 0,
      marginTop: '4px',
      color: aliasTokens.tertiary_text_color
    },
    dashboardStatus: {
      marginLeft: '8px'
    }
  })

export default styles
