import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
      borderRadius: '4px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: aliasTokens.cta_disabled_secondary_background_color
      }
    },
    active: {
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color
    },
    userIcon: {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: aliasTokens.secondary_text_color,
      borderRadius: '50%',
      color: aliasTokens.cta_hover_secondary_background_color,
      fontSize: '12px',
      flex: '0 0 20px'
    },
    codespaceName: {
      fontSize: '12px',
      color: aliasTokens.neutral_text_color,
      marginLeft: '10px'
    },
    left: {
      display: 'flex'
    },
    rightIcon: {
      fontSize: '16px'
    },
    iconButton: {
      color: aliasTokens.secondary_text_color
    },
    disabledIcon: {
      color: aliasTokens.disabled_icon_color
    }
  })

export default styles
