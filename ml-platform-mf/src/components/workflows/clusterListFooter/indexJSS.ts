import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      height: '60px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'absolute',
      bottom: '0',
      right: '0',
      background: '#33333399',
      backdropFilter: 'blur(120px)',
      padding: '0px 24px'
    }
  })

export default styles
