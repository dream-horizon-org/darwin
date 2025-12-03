import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    iconContainer: {
      marginLeft: '12px',
      fontSize: '14px',
      color: 'inherit',
      '&:before': {
        color: 'inherit !important'
      }
    },
    genericToolTip: {
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',

      /* Text/color_neutral_20 */
      color: aliasTokens.neutral_text_color
    },
    genericToolTipLink: {
      color: `${aliasTokens.cta_secondary_text_color} !important`
    },
    flex: {
      display: 'flex'
    },
    ml16: {
      marginLeft: '16px'
    },
    mt8: {
      marginTop: '8px'
    },
    label: {
      color: aliasTokens.tertiary_text_color
    }
  })

export default styles
