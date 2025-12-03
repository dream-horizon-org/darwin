import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      height: '1px',
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`,
      margin: '16px 0'
    }
  })

export default styles
