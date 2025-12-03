import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '32px',
      marginTop: '12px',
      background: aliasTokens.neutral_background_color,
      padding: '24px'
    },
    nodeTypeWrapper: {
      width: '380px'
    },
    heading2: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.tertiary_text_color,
      marginTop: '24px',
      marginBottom: '12px'
    },
    headConfigWrapper: {
      display: 'flex',
      width: '410px',
      marginTop: '24px'
    },
    headConfigInputWrapper: {
      marginLeft: '8px',
      '&:first-child': {
        marginLeft: '0px',
        marginRight: '8px'
      }
    },
    memoryUnit: {
      marginLeft: '8px',
      lineHeight: '40px',
      fontWeight: '400',
      fontSize: '14px',
      color: aliasTokens.neutral_text_color
    },
    errorMsg: {
      color: '#e10000',
      fontSize: '12px'
    },
    radioContainer: {
      display: 'flex',
      gap: '16px'
    }
  })

export default styles
