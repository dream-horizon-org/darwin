import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    headerContainer: {
      display: 'flex',
      padding: '16px 12.5px',
      backgroundColor: aliasTokens.secondary_background_color,
      color: aliasTokens.neutral_text_color,
      fontSize: '16px',
      fontWeight: 700,
      boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.30)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: '116px',
      zIndex: 2
    },
    taskDetailsHeader: {
      marginLeft: '24px'
    },
    closeIcon: {
      cursor: 'pointer'
    }
  })

export default styles
