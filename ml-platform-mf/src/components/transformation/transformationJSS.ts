import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginTop: '2rem',
      background: aliasTokens.secondary_background_color,
      padding: '1rem',
      borderRadius: '10px',
      border: `1px solid ${aliasTokens.disabled_border_color}`
    },
    heading: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    datahubLink: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: aliasTokens.secondary_icon_color
    },
    launchIcon: {
      marginLeft: '0.3rem',
      color: aliasTokens.secondary_icon_color
    },
    customCode: {
      marginLeft: '0.5rem'
    }
  })

export default styles
