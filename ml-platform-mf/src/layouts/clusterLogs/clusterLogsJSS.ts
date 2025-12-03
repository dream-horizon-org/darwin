import {createStyles} from '@mui/material'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: '75%',
      display: 'flex',
      flexDirection: 'column'
    },
    refresh: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',

      '& > p': {
        color: aliasTokens.tertiary_text_color,
        fontSize: '14px'
      }
    },
    btnContainer: {
      marginLeft: '0.5rem'
    },
    drawer: {
      width: '45%',
      backgroundColor: aliasTokens.primary_background_color
    },
    drawerHeading: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: aliasTokens.secondary_background_color,
      padding: '25px'
    },
    drawerContent: {
      padding: '24px'
    },
    heading: {
      marginLeft: '25px',
      fontSize: '18px',
      fontWeight: 700
    },
    closeIcon: {
      fontSize: '18px',
      cursor: 'pointer'
    },
    loaderContainer: {
      marginTop: '24px'
    },
    noResultsFoundContainer: {
      display: 'flex',
      height: '500px',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    noResultsTextContainer: {
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      '& > p': {
        fontSize: '2rem',
        color: aliasTokens.error_border_color
      }
    }
  })

export default styles
