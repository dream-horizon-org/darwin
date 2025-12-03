import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      backgroundColor: aliasTokens.secondary_background_color,
      borderRadius: '4px',
      minWidth: '300px',
      maxWidth: '400px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px'
    },
    heading: {
      fontWeight: 400,
      fontSize: '14px'
    },
    tags: {
      '& > div': {
        marginTop: '12px',
        marginLeft: '8px',
        '&:first-of-type': {
          marginLeft: 0
        }
      },
      '& > span': {
        marginLeft: '8px'
      }
    },
    showMore: {
      color: aliasTokens.cta_tertiary_text_color,
      fontSize: '12px',
      fontWeight: 400
    },
    bottom: {
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(51, 51, 51, 0.4)',
      padding: '8px 12px',
      marginTop: '12px',
      fontWeight: 400,
      fontSize: '12px'
    },
    scheduleText: {
      color: aliasTokens.tertiary_text_color,
      marginLeft: '8px'
    },
    icon: {
      width: '1.2rem'
    },
    scheduleDescription: {
      marginLeft: '5px'
    }
  })

export default styles
