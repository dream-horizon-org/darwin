import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: 'calc(100% + 32px)',
      alignSelf: 'flex-start',
      margin: '-16px'
    }
  })

export default styles
