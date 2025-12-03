import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    success: {
      backgroundColor: aliasTokens.success_background_color,
      border: aliasTokens.success_background_color,
      borderRadius: '2rem'
    },
    error: {
      backgroundColor: aliasTokens.cta_error_background_color,
      border: aliasTokens.cta_error_background_color,
      borderRadius: '2rem'
    }
  })

export default styles
