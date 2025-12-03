import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      borderRadius: '8px',
      flex: 1,
      marginBottom: '40px'
    },
    tabsWrapper: {
      display: 'flex',
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`,
      padding: '24px',
      '& >label': {
        marginRight: '42px',
        '&:last-child': {
          marginRight: '0px'
        }
      }
    },
    detailsWrapper: {
      padding: '24px'
    }
  })

export default styles
