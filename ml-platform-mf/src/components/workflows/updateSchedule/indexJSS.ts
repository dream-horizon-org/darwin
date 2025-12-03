import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    drawerContainer: {},
    header: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`,
      padding: '16px'
    },
    heading: {
      fontSize: '16px',
      fontWeight: 700,
      color: aliasTokens.neutral_text_color,
      marginLeft: '16px'
    },
    closeIcon: {
      fontSize: '40px',
      padding: '8px',
      cursor: 'pointer'
    },
    form: {
      marginTop: '16px',
      padding: '16px',
      height: 'calc(100vh - 149px)'
    },
    scheduleContainer: {
      display: 'flex',
      gap: '4px',
      marginTop: '8px'
    },
    scheduleInput: {
      width: '100%'
    },
    cronExpression: {
      marginTop: '8px',
      color: '#DB9200',
      fontSize: '12px'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '16px 24px',
      backgroundColor: 'rgba(51, 51, 51, 0.60)'
    }
  })

export default styles
