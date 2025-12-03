import {createStyles} from '@mui/material'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    header: {
      display: 'flex',
      padding: '25px 29px'
    },
    title: {
      marginLeft: '21px',
      fontSize: '16px',
      fontWeight: 700
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 24px'
    },
    divider: {
      borderColor: aliasTokens.tertiary_background_color
    },
    closeIcon: {
      cursor: 'pointer'
    },
    footer: {
      marginTop: 'auto',
      height: '72px',
      padding: '16px 24px',
      background: 'rgba(51, 51, 51, 0.6)',
      display: 'flex',
      flexDirection: 'row-reverse'
    },
    footerButton: {}
  })

export default styles
