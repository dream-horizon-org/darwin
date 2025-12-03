import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    root: {
      marginTop: '2rem'
    },
    formControl: {
      marginTop: '2rem',
      '&:first-of-type': {
        marginTop: '0'
      }
    },
    error: {
      color: aliasTokens.validation_error_text_color,
      fontSize: '12px',
      marginTop: '0.2rem'
    }
  })

export default styles
