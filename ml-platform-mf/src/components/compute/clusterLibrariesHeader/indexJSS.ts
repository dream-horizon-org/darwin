import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    searchContainer: {
      width: '305px'
    },
    left: {
      width: '348px',
      display: 'flex',
      '& > div': {
        width: '100%'
      }
    },
    right: {
      width: '50%',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px'
    }
  })

export default styles
