import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    tabContainer: {
      display: 'grid',
      width: '300px',
      gridTemplateColumns: 'auto auto',
      gap: '2px',
      backgroundColor: aliasTokens.tertiary_background_color,
      // marginTop: '24px',
      marginLeft: '24px',
      borderRadius: '4px',
      padding: '2px'
    },
    tab: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 700,
      height: '28px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      color: aliasTokens.tertiary_text_color,
      borderRadius: '4px',
      '&:hover': {
        color: aliasTokens.neutral_text_color,
        backgroundColor: aliasTokens.cta_hover_tertiary_background_color
      },
      '&.active': {
        color: aliasTokens.neutral_text_color,
        backgroundColor: aliasTokens.cta_hover_tertiary_background_color
      }
    }
  })

export default styles
