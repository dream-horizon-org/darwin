import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {},
    shortcutContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '361px',
      margin: '24px 0'
    },
    shortcut: {
      color: aliasTokens.base_text_color,
      fontSize: '14px',
      fontWeight: 400,
      padding: '4px 8px',
      border: `1px solid ${aliasTokens.neutral_text_color}`,
      borderRadius: '4px'
    },
    shortcutDescription: {}
  })

export default styles
