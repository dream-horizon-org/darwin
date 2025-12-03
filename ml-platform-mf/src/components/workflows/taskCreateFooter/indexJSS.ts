import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      padding: '16px 24px',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(51, 51, 51, 0.60)',
      width: '100%',
      boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.30)',
      backdropFilter: 'blur(12px)'
    }
  })

export default styles
