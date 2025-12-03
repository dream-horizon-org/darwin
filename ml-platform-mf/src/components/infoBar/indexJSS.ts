import {createStyles} from '@mui/material'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '8px 12px',
      fontSize: '14px'
    },
    success: {
      backgroundColor: aliasTokens.success_background_color
    },
    warning: {
      backgroundColor: aliasTokens.warning_background_color
    },
    error: {
      backgroundColor: aliasTokens.error_background_color
    },
    left: {
      display: 'flex',
      alignItems: 'center'
    },
    right: {
      display: 'flex',
      alignItems: 'center'
    },
    msg: {
      marginLeft: '8px'
    },
    pointer: {
      cursor: 'pointer'
    }
  })

export default styles
