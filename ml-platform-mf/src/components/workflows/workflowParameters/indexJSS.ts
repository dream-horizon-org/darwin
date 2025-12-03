import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    formFieldContainer: {
      marginTop: '16px'
    },
    formLabel: {
      color: aliasTokens.neutral_text_color,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px'
    },
    subText: {
      fontSize: '10px',
      marginLeft: '4px'
    },
    input: {
      width: '92%'
    },
    addIcon: {
      marginTop: '8px'
    }
  })

export default styles
