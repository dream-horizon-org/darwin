import {createStyles} from '@mui/material'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      marginBottom: '16px',
      '& > div': {
        marginLeft: '12px',
        cursor: 'pointer'
      },

      '& > div:first-of-type': {
        marginLeft: '0'
      }
    },
    filter: {
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color,
      fontSize: '14px',

      '&.MuiChip-root:focus': {
        backgroundColor: aliasTokens.cta_disabled_secondary_background_color
      }
    },
    activeFilter: {
      backgroundColor: aliasTokens.cta_primary_background_color,

      '&.MuiChip-root:focus': {
        backgroundColor: aliasTokens.cta_primary_background_color
      }
    }
  })

export default styles
