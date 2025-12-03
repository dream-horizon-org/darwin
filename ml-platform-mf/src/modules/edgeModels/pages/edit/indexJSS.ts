import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      maxWidth: '100vw'
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  })

export default styles
