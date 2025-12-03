import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    rightDialog: {
      top: '10%',
      // width: '40%',
      left: '60%'
    },
    closeButton: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    },
    dialogBottomContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '64px',
      justifyContent: 'flex-end',
      borderTop: `1px solid ${aliasTokens.inactive_border_color}`
    },
    dialogHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 'bold',
      fontSize: '14px',
      lineHeight: 1.71,
      minHeight: '56px'
    },
    headerClass: {
      fontSize: '14px',
      fontWeight: 'bold',
      height: '56px'
    },
    noPadding: {
      padding: '0'
    },
    paper: {
      width: 'auto',
      minWidth: '50%',
      maxHeight: '100%',
      overflow: 'hidden'
    },
    dialogContent: {
      height: '90%',
      overflowY: 'scroll'
    },
    dialogHeaderContent: {
      fontWeight: 'bold',
      fontSize: '18px'
    }
  })

export default styles
