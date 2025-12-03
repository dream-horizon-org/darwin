import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      maxWidth: '100vw'
    },
    searchAndFilterRow: {
      display: 'flex',
      marginTop: '48px',
      marginBottom: '24px'
    },
    searchAndOwnedContainer: {
      display: 'flex',
      flex: 1
    },
    rightFilterContainer: {
      display: 'flex',
      marginLeft: 'auto',
      alignItems: 'center'
    },
    filterByText: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#4D4D4D'
    },
    rightFilter: {
      width: '160px',
      marginLeft: '8px'
    },
    leftSearchFilter: {
      width: '324px'
    }
  })

export default styles
