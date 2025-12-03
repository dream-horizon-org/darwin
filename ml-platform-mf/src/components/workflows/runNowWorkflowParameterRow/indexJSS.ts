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
      cursor: 'pointer',
      color: aliasTokens.neutral_text_color
    },
    disabled: {
      color: aliasTokens.disabled_text_color
    }
  })

export default styles
