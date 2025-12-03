import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      rowGap: '20px',
      padding: '20px 16px',
      boxSizing: 'border-box'
    },
    collectionContainer: {
      width: '100%',
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      rowGap: '12px'
    },
    collectionHeader: {
      width: '100%',
      height: '28px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      '& p': {
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '20px',
        color: '#8F8F8F',
        margin: '0'
      }
    },
    clustersContainer: {
      width: '100%',
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      rowGap: '12px'
    },

    emptyStateContainer: {
      width: '100%',
      height: '90px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20',
      color: '#D9D9D9',
      border: '1px solid #333333',
      borderRadius: '8px'
    },
    moreActionContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      columnGap: '4px',
      alignSelf: 'flex-start',
      cursor: 'pointer',
      marginLeft: '16px',
      '& p': {
        fontSize: '14px',
        fontWeight: '700',
        lineHeight: '20px',
        color: '#57ABFF',
        margin: '0'
      },

      '& svg': {
        color: '#57ABFF'
      }
    },

    actionButton: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      columnGap: '4px',
      cursor: 'pointer',
      marginRight: '16px',
      '& p': {
        fontSize: '14px',
        fontWeight: '700',
        lineHeight: '20px',
        color: '#57ABFF',
        margin: '0',
        textTransform: 'uppercase'
      },

      '& svg': {
        color: '#57ABFF'
      }
    }
  })

export default styles
