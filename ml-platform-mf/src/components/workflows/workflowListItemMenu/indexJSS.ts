import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    moreIcon: {
      cursor: 'pointer'
    },
    menuIcon: {
      marginTop: '7px',
      cursor: 'pointer'
    },
    actionIcon: {
      width: '16px'
    },
    actionName: {
      fontSize: '14px',
      fontWeight: 400,
      marginLeft: '8px'
    }
  })

export default styles
