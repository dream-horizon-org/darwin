import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      padding: '16px',
      backgroundColor: aliasTokens.tertiary_background_color,
      fontSize: '14px',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '6px',
      gap: '10px'
    },
    snackbar: {
      marginLeft: '80px'
    },
    closeIcon: {
      fontSize: '20px',
      cursor: 'pointer'
    }
  })

export default styles
