import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    dropdownBtn: {
      color: aliasTokens.primary_text_color,
      textTransform: 'none',
      fontWeight: 400
    },
    menuItem: {
      fontSize: '12px'
    }
  })

export default styles
