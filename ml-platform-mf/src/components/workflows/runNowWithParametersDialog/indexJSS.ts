import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    dialogContainer: {
      height: '400px',
      width: '600px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    },
    textDetails: {
      color: aliasTokens.tertiary_text_color
    },
    closeButton: {
      marginTop: 'auto',
      alignSelf: 'flex-end'
    },
    input: {
      maxHeight: '300px',
      overflowY: 'auto',
      padding: '8px'
    },
    formLabel: {
      color: aliasTokens.neutral_text_color,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px',
      marginTop: '24px'
    },
    addIcon: {
      marginTop: '8px'
    }
  })

export default styles
