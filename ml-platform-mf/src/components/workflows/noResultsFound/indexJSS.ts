import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    noResultsFoundContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      backgroundColor: aliasTokens.secondary_background_color
    },
    noResultsFoundText: {
      color: aliasTokens.error_border_color
    }
  })

export default styles
