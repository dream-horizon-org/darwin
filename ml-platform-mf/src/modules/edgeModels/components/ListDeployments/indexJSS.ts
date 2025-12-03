import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      maxWidth: '100vw',
      '& [class*="NoResultsFound-noResultsFoundText-"]': {
        color: '8F8F8F'
      }
    },
    searchAndFilterRow: {
      display: 'flex',
      marginTop: '48px',
      marginBottom: '24px'
    },
    searchAndOwnedContainer: {
      display: 'flex'
    },
    checkBoxAndLabel: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: 16
    },
    filterContainer: {
      display: 'flex',
      marginLeft: 'auto',
      alignItems: 'center'
    },
    filterByText: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#4D4D4D'
    },
    searchBar: {
      width: '400px'
    }
  })

export default styles
