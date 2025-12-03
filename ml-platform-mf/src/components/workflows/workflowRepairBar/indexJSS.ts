import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: aliasTokens.information_background_color,
      borderRadius: '4px'
    },
    info: {
      display: 'flex',
      alignItems: 'center'
    },
    infoIcon: {
      color: aliasTokens.info_purple_icon_color,
      width: '24px',
      height: '24px',
      marginRight: '8px'
    },
    textContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: '1 0 0',
      padding: '12px',
      fontSize: '14px',
      lineHeight: '20px'
    },
    repairText: {
      fontWeight: '700'
    },
    button: {
      marginLeft: 'auto',
      backgroundColor: 'transparent',
      color: aliasTokens.neutral_text_color,
      display: 'flex',
      padding: '4px 16px',
      borderRadius: '4px',
      border: `1px solid ${aliasTokens.neutral_text_color}`,
      fontWeight: '700'
    },
    repairButton: {
      display: 'flex',
      alignItems: 'center',
      '& .MuiButton-root': {
        color: aliasTokens.neutral_text_color,
        border: `1px solid ${aliasTokens.neutral_text_color}`
      }
    },
    closeButton: {
      marginLeft: '8px',
      cursor: 'pointer'
    }
  })

export default styles
