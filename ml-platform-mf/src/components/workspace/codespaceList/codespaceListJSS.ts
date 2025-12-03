import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      width: '100%'
    },
    header: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerName: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 600,
      textTransform: 'uppercase'
    },
    icon: {
      color: aliasTokens.cta_secondary_icon_color,
      cursor: 'pointer'
    },
    codespaceListItem: {
      marginTop: '15px',
      height: '500px',
      overflowY: 'auto'
    },
    spinner: {
      marginTop: '50%'
    },
    codespaceNotFound: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '40%'
    }
  })

export default styles
