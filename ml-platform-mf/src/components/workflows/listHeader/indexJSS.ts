import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      width: 'calc(100% + 32px)',
      alignItems: 'center',
      alignSelf: 'flex-start',
      padding: '20px 24px',
      background: aliasTokens.secondary_background_color,
      margin: '-16px',
      position: 'sticky',
      top: '48px',
      zIndex: 2
    },
    left: {
      fontWeight: 700,
      fontSize: '24px',
      color: aliasTokens.neutral_text_color
    },
    right: {
      display: 'flex'
    },
    action: {
      marginLeft: '12px'
    },
    searchContainer: {
      width: '305px'
    }
  })

export default styles
