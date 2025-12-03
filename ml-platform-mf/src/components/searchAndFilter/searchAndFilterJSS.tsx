import createStyles from '@mui/styles/createStyles'

import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    searchAndFilter: {
      display: 'flex',
      marginBottom: '1rem',
      flexDirection: 'column'
    },
    searchAndFilterBox: {
      display: 'flex'
    },
    button: {
      padding: '0',
      margin: '0'
    },
    filterBtn: {
      marginLeft: '1rem'
    },
    createFeatureGroupBtn: {
      marginLeft: '1rem',
      width: '15%'
    },
    customTextField: {
      '& input::placeholder': {
        fontSize: '14px'
      }
    }
  })

export default styles
