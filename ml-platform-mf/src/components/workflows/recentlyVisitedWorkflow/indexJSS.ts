import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: '250px',
      backgroundColor: aliasTokens.secondary_background_color,
      padding: '12px',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    left: {
      fontSize: '14px',
      fontWeight: 400
    },
    right: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end'
    },
    time: {
      color: aliasTokens.tertiary_text_color,
      fontWeight: 400,
      fontSize: '8px',
      marginTop: '6px'
    }
  })

export default styles
