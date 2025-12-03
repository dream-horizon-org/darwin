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
      color: aliasTokens.neutral_text_color
    },
    rayParamsWrapper: {
      display: 'flex'
    },
    rayParamsInputComp: {
      width: '240px'
    },
    rayParamsInputWrapper: {
      marginLeft: '32px'
    },
    inputWrapper: {
      marginTop: '20px',
      display: 'flex',
      alignItems: 'center'
    },
    inputComp: {
      width: '380px'
    },
    infoWrapper: {
      color: aliasTokens.tertiary_text_color
    }
  })

export default styles
