import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      height: 'calc(100vh - 120px)',
      overflow: 'auto'
    },
    loaderContainer: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: '#00000099',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    },
    title: {
      color: aliasTokens.neutral_text_color,
      fontWeight: 700,
      fontSize: '18px',
      lineHeight: '24px',
      letterSpacing: '0.01em',
      marginBottom: '24px'
    },
    formContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    clusterDeatilsWrapper: {
      display: 'flex',
      position: 'relative',
      width: 'calc(100% - 420px)'
    },
    actionBar: {
      display: 'flex',
      height: '80px',
      width: 'calc(100% + 24px + 24px)',
      background: 'rgba(51, 51, 51)',
      justifyContent: 'end',
      alignItems: 'center',
      padding: '20px 24px',
      zIndex: 2,
      position: 'sticky',
      left: 0,
      bottom: '-24px',
      marginLeft: '-24px'
    },
    actionBarBtnWrapper: {
      marginLeft: '12px'
    },
    stickyHeader: {
      position: 'sticky',
      top: '64px',
      zIndex: 10
    },
    nameTagsWrapper: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    },
    nameTagsContainerWrapper: {
      display: 'flex'
    },
    nameTagsContainer: {
      border: '1px solid #333333',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '16px'
    },

    footerContainer: {
      width: '100%',
      height: '56px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      columnGap: '16px',
      background: '#33333399',
      position: 'absolute',
      bottom: '0',
      right: '0',
      padding: '16.5px 24px'
    }
  })

export default styles
