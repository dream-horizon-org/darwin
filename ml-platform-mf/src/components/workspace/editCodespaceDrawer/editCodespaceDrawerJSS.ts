import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: '360px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: aliasTokens.secondary_background_color
    },
    drawerWrapper: {
      borderRadius: '0px'
    },
    header: {
      height: '64px',
      padding: '25px 29px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${aliasTokens.tertiary_background_color} `
    },
    headerIcon: {},
    headerContent: {
      paddingLeft: '21px',
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color
    },
    content: {
      padding: '24px',
      flex: 1
    },
    fieldWrapper: {
      marginBottom: '24px'
    },
    footer: {
      height: '72px',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'row-reverse',
      background: 'rgba(51, 51, 51, 0.6)',
      alignItems: 'center'
    }
  })

export default styles
