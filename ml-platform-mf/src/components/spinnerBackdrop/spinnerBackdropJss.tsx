import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    backdrop: {
      height: '100%',
      width: 'calc(100% + 32px)',
      background: '#000000b0',
      position: 'absolute',
      zIndex: '5',
      margin: '-16px'
    },
    fullBodyOverlay: {
      position: 'relative',
      zIndex: 1301,
      left: '50%',
      top: 'calc(50% - 84px)'
    },
    center: {
      position: 'fixed',
      margin: '-30px'
    }
  })

export default styles
