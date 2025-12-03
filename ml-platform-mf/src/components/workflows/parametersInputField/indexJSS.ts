import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    parametersContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginTop: '8px',
      '&:first-of-type': {
        marginTop: 0
      }
    },
    closeIcon: {
      fontSize: '16px',
      cursor: 'pointer'
    },
    disabled: {
      color: aliasTokens.disabled_text_color
    },
    errorMessage: {
      color: aliasTokens.error_text_color,
      fontSize: '12px',
      margin: '4px 0'
    }
  })

export default styles
