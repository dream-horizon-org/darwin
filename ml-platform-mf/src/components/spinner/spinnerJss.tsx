import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    fullBodyOverlay: {
      position: 'relative',
      zIndex: 1301,
      left: '50%',
      top: '50%'
    },
    center: {
      position: 'fixed',
      margin: '-30px'
    }
  })

export default styles
