import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'
const styles = () =>
  createStyles({
    container: {
      display: 'flex'
    },
    header: {
      width: '100%',
      flex: '0 0 75%',
      overflow: 'auto'
    },
    filterTabs: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '24px'
    },
    dateFilter: {
      minWidth: '226px',
      marginRight: '20px'
    },
    filterByTitle: {
      fontSize: '12px',
      lineHeight: '20px',
      color: aliasTokens.tertiary_text_color,
      marginLeft: 'auto'
    },
    filterDropdown: {
      display: 'flex',
      alignItems: 'center'
    },
    filterByDropdown: {
      marginLeft: '8px',
      marginRight: '24px'
    },
    mainContent: {
      marginTop: '24px'
    }
  })

export default styles
