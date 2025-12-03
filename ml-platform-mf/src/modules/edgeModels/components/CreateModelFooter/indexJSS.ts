import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    actionBar: {
      display: 'flex',
      height: '80px',
      width: '100%',
      background: 'rgba(51, 51, 51)',
      alignItems: 'center',
      // margin: 'auto -16px -16px -16px',
      padding: '20px 24px',
      zIndex: 3,
      position: 'fixed',
      left: 0,
      bottom: 0,
      justifyContent: 'space-between'
    },
    errorContainer: {
      marginLeft: '48px',
      color: 'red',
      width: '80%'
    },
    submitAndCancelContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '20%'
    },
    actionBarBtnWrapper: {
      marginLeft: '12px'
    },
    circleLoader: {
      flex: 'none'
    },
    submitButton: {
      textTransform: 'none',
      fontStyle: 'normal',
      fontWeight: 700,
      '&:disabled': {
        backgroundColor: '#333333',
        color: '#4D4D4D',
        borderColor: '#333333'
      }
    },
    cancelButton: {
      textTransform: 'none',
      fontWeight: 700
    }
  })

export default styles
