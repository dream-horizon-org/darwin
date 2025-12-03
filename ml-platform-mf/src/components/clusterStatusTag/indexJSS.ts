import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    statusContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      columnGap: '6px'
    },
    statusIndicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%'
    },
    status: {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '16px',
      color: '#D9D9D9',
      textTransform: 'capitalize'
    }
  })

export default styles
