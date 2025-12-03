import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      maxWidth: '100vw'
    },
    searchRow: {
      display: 'flex',
      marginBottom: '24px'
    },
    searchContainer: {
      display: 'flex',
      flex: 1
    },
    btnContainer: {
      marginLeft: '12px'
    },
    backButton: {
      marginRight: '24px',
      cursor: 'pointer'
    },
    eventSelectionHeader: {
      display: 'flex',
      color: '#D9D9D9',
      alignItems: 'center',
      marginBottom: 24
    },
    searchBarSection: {maxWidth: '327px', display: 'flex', flex: '1 1 327px'},
    footerContainer: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between'
    },
    footerLeft: {
      alignItems: 'center',
      color: '#D9D9D9',
      fontSize: '14px',
      display: 'flex'
    },
    textField: {
      width: 188,
      maxWidth: 300,
      height: '28px',
      '& .MuiOutlinedInput-input': {
        height: '20px',
        padding: '4px 8px',
        fontSize: '14px',
        color: '#8F8F8F'
      }
    },
    buttonText: {
      textTransform: 'none',
      height: 28,
      fontWeight: 700
    },
    labelText: {
      color: '#8F8F8F',
      fontSize: 14,
      fontWeight: 400
    },
    expiryLabelText: {
      color: '#8F8F8F',
      fontSize: 14,
      fontWeight: 400,
      marginLeft: 12
    },
    errorContainer: {
      marginTop: '8px',
      marginLeft: '48px',
      color: 'red',
      width: '80%'
    },
    eventNameSpan: {
      fontWeight: 700,
      fontSize: 16
    }
  })

export default styles
