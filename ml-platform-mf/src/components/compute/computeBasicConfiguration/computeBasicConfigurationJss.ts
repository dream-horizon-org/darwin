import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    },
    heading1: {
      fontWeight: '700',
      fontSize: '16px',
      lineHeight: '24px',
      color: aliasTokens.neutral_text_color,
      marginTop: '48px',
      '&:first-child': {
        marginTop: '0px',
        marginBottom: '20px'
      }
    },
    heading2: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.tertiary_text_color,
      marginTop: '14px'
    },
    inputWrapper: {
      // marginTop: '20px',
      width: '360px'
    },
    templateInputWrapper: {
      display: 'flex',
      alignItems: 'center'
    },
    headConfigWrapper: {
      display: 'flex',
      width: '410px'
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
    smallInputWrapper: {
      marginTop: '20px',
      width: '360px',
      display: 'flex',
      '& >span': {
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '40px',
        marginLeft: '24px',
        color: aliasTokens.neutral_text_color
      }
    },
    addBtnWrapper: {
      marginTop: '16px'
    },
    inputComp: {
      width: '768px',
      height: '127px',
      marginTop: '16px',
      marginBottom: '-20px'
    }
  })

export default styles
