import createStyles from '@mui/styles/createStyles'
import {typographyComponentTokens} from '../../MsdTheme'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    img: {
      boxSizing: 'border-box'
    },
    appText: {
      paddingTop: 16,
      color: typographyComponentTokens.default_text_color
    }
  })

export default styles
