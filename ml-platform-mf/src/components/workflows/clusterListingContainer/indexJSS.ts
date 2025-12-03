import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      marginTop: '16px'
    },
    list: {
      marginTop: '16px'
    },
    listItem: {
      marginTop: '4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '8px',
      borderRadius: '4px',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      cursor: 'pointer',

      '&: first-of-type': {
        marginTop: '0'
      }
    },
    left: {
      display: 'flex',
      flexDirection: 'column'
    },
    clusterName: {
      fontSize: '14px',
      fontWeight: 400
    },
    resources: {
      fontSize: '12px',
      fontWeight: 400,
      color: aliasTokens.disabled_text_color
    },
    right: {
      display: 'flex',
      gap: '8px'
    },
    icon: {
      fontSize: '16px'
    },
    loader: {
      display: 'flex',
      justifyContent: 'center',
      margin: '10px 0'
    },
    actionIcon: {
      width: '16px'
    },
    actionName: {
      fontSize: '14px',
      fontWeight: 400,
      marginLeft: '8px'
    }
  })

export default styles
