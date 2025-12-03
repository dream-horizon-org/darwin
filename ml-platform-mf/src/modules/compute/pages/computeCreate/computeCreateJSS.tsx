import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      // width: '1330px'
      width: '100%',
      // width: 'calc(100% - 272px)',
      marginBottom: '80px'
    },
    title: {
      color: aliasTokens.neutral_text_color,
      fontWeight: 700,
      fontSize: '18px',
      lineHeight: '24px',
      letterSpacing: '0.01em',
      marginTop: '31px',
      marginBottom: '24px'
    },
    formContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    clusterDeatilsWrapper: {
      display: 'flex',
      position: 'relative'
    },
    actionBar: {
      display: 'flex',
      height: '80px',
      width: '100%',
      background: 'rgba(51, 51, 51)',
      justifyContent: 'end',
      alignItems: 'center',
      // margin: 'auto -16px -16px -16px',
      padding: '20px 24px',
      zIndex: 3,
      position: 'fixed',
      left: 0,
      bottom: 0
    },
    actionBarBtnWrapper: {
      marginLeft: '12px'
    },
    stickyHeader: {
      position: 'sticky',
      top: '64px',
      zIndex: 10
    }
  })

export default styles
