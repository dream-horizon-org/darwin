import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    errorBoundary: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'calc(100vh + 8px)',
      width: 'calc(100vw + 8px)',
      top: '-8px',
      left: '-8px',
      position: 'absolute',
      backgroundColor: '#121212',
      color: '#ffffff',
      textAlign: 'center'
    },
    errorContent: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '600px',
      padding: '20px',
      border: '1px solid #444',
      borderRadius: '10px',
      backgroundColor: '#1e1e1e',

      '& h1': {
        fontSize: '2.5rem',
        marginBottom: '1rem'
      },

      '& p': {
        fontSize: '1.2rem',
        marginBottom: '2rem'
      }
    },
    errorGif: {
      width: '100%',
      maxWidth: '300px',
      marginTop: '2rem',
      alignSelf: 'center',
      marginBottom: '30px'
    }
  })

export default styles
