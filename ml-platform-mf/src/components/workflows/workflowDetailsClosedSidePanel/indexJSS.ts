import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '10px',
      borderLeft: `1px solid ${aliasTokens.disabled_border_color}`,
      minHeight: 'calc(100vh - 270px)'
    },
    collapseIconContainer: {
      position: 'absolute',
      backgroundColor: aliasTokens.cta_disabled_primary_background_color,
      padding: '5px',
      borderRadius: '50%',
      marginLeft: '-10px',
      marginTop: '20px',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    },
    collapseIcon: {
      width: '20px'
    }
  })

export default styles
