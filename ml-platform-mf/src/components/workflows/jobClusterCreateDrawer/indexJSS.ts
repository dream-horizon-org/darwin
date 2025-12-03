import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      height: 'calc(100vh - 128px)'
    },
    containerHeader: {
      display: 'flex',
      padding: '22px',
      borderBottom: '1px solid #333333',
      alignItems: 'center'
    },
    containerHeaderTitle: {
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: '20px',
      color: '#d9d9d9',
      marginLeft: '16px'
    },
    closeIcon: {
      color: '#8f8f8f',
      cursor: 'pointer'
    }
  })

export default styles
