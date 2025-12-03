import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: '90vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      background: '#121212'
    },
    headerContainer: {
      height: '64px',
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      columnGap: '16px',
      padding: '0px 16px',
      borderBottom: '1px solid #333333',
      position: 'sticky',
      top: '0',
      right: '0',
      '& svg': {
        color: '#8F8F8F',
        cursor: 'pointer'
      },

      '& h1': {
        fontSize: '16px',
        fontWeight: '700',
        lineHeight: '20px',
        color: '#D9D9D9',
        margin: '0'
      }
    },

    footerContainer: {
      width: '100%',
      height: '56px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      columnGap: '16px',
      background: '#33333399',
      position: 'absolute',
      bottom: '0',
      right: '0',
      padding: '16.5px 24px'
    }
  })

export default styles
