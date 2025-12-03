import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    root: {
      display: 'flex',
      marginTop: '1rem'
    },
    chip: {
      backgroundColor: aliasTokens.hover_primary_color,
      marginLeft: '0.5rem',
      '&:first-child': {
        marginLeft: '0'
      }
    },
    clearFilterBtn: {
      color: aliasTokens.hover_primary_color
    }
  })

export default styles
