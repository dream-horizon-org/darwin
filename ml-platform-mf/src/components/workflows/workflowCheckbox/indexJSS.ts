import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    checkbox: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      fontWeight: 400,
      marginBottom: '8px',
      padding: '0px',
      height: '10px',
      gap: '10px'
    },
    labelText: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '16px',
      letterSpacing: '0px'
    },
    selectCheckbox: {
      padding: 0,
      color: aliasTokens.default_border_color,
      '&.Mui-checked': {
        color: aliasTokens.blue_border_color_2
      },
      '&.Mui-disabled': {
        color: aliasTokens.checkbox_disabled_border_color
      },
      '&.Mui-disabled.Mui-checked': {
        color: aliasTokens.checkbox_disabled_border_color
      }
    }
  })

export default styles
