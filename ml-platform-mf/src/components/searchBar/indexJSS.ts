import {createStyles} from '@mui/material'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    root: {
      borderColor: 'red',
      '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
          borderColor: aliasTokens.cta_disabled_tertiary_icon_color
        },
        '&.Mui-focused fieldset': {
          borderColor: aliasTokens.blue_border_color
        }
      }
    },
    divider: {
      backgroundColor: '#333333',
      height: '20px',
      width: '1px',
      margin: '4px 8px'
    },
    searchIcon: {
      color: aliasTokens.cta_disabled_tertiary_icon_color
    },
    closeIcon: {
      color: aliasTokens.cta_disabled_tertiary_icon_color,
      cursor: 'pointer'
    }
  })

export default styles
