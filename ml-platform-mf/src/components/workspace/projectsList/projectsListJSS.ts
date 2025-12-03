import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    projectsList: {
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      width: '100%'
    },
    header: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerName: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 600,
      textTransform: 'uppercase'
    },
    icon: {
      color: aliasTokens.cta_secondary_icon_color,
      cursor: 'pointer',
      marginLeft: '12px',
      '&:first-of-type': {
        marginLeft: 0
      }
    },
    projectList: {
      marginTop: '15px',
      height: '500px',
      overflowY: 'auto'
    },
    projectNotFound: {
      height: '200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: aliasTokens.secondary_text_color,
      fontSize: '18px',
      fontWeight: 700
    },
    mainText: {
      margin: '8px 0 4px 0'
    },
    subText: {
      color: aliasTokens.tertiary_text_color,
      fontWeight: 400,
      fontSize: '14px',
      margin: 0
    },
    spinner: {
      marginTop: '50%'
    }
  })

export default styles
