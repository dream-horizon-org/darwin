import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    backdrop: {
      display: 'flex',
      height: 'calc(100vh - 48px)',
      width: 'calc(100vw - 48px)',
      background: '#000000b0',
      top: '48px',
      left: '48px',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      zIndex: '2'
    }
  })

export default styles
