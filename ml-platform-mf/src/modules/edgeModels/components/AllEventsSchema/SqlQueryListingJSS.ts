import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      maxWidth: '100vw'
    },
    querySection: {
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
    addQueryHeading: {
      display: 'flex',
      justifyContent: 'space-between',
      color: '#D9D9D9'
    },
    nextButton: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    queryListWrapper: {
      '&:first-child': {
        borderTopRightRadius: '2px',
        borderTopLeftRadius: '2px'
      },
      '&:last-child': {
        borderBottom: '1px solid #333',
        borderBottomRightRadius: '2px',
        borderBottomLeftRadius: '2px'
      }
    },
    queryList: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      WebkitAlignItems: 'center',
      border: '0px, 1px, 1px, 0px',
      borderColor: '#333',
      borderStyle: 'solid',
      borderBottom: 'none',
      paddingLeft: '16px',
      paddingRight: '16px',
      height: '48px',
      '&:first-child': {
        borderTopRightRadius: '8px',
        borderTopLeftRadius: '8px'
      },
      '&:last-child': {
        borderBottom: '1px solid #333',
        borderBottomRightRadius: '8px',
        borderBottomLeftRadius: '8px'
      }
    },
    deleteIcon: {
      cursor: 'pointer',
      color: 'white',
      marginLeft: '12px',
      fontSize: '20px'
    },
    buttonText: {
      textTransform: 'none',
      height: 28,
      fontWeight: 700
    }
  })

export default styles
