import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      marginTop: '36px',
      display: 'flex',
      flexDirection: 'column',
      alignSelf: 'flex-start'
    },
    heading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    left: {
      display: 'flex',
      alignItems: 'center'
    },
    title: {
      fontWeight: 700,
      fontSize: '14px'
    },
    total: {
      padding: '2px 8px',
      backgroundColor: aliasTokens.surface_background_color,
      marginLeft: '8px',
      color: aliasTokens.secondary_text_color,
      fontWeight: 700,
      fontSize: '12px',
      borderRadius: '2px'
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 700,
      fontSize: '14px',
      cursor: 'pointer'
    },
    arrowIcon: {
      width: '0.9rem',
      marginLeft: '8px'
    },
    list: {
      display: 'flex',
      marginTop: '16px',
      columnGap: '16px'
    },
    listItem: {
      '&:last-child': {
        columnGap: '0'
      }
    }
  })

export default styles
