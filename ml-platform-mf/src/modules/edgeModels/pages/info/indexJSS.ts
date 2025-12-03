import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    infoContainer: {
      width: '100%',
      maxWidth: '100vw'
    },
    detailsTab: {
      width: 1088,
      marginLeft: 244,
      marginTop: -24,
      borderRadius: 8
    },
    deploymentsTab: {
      width: 1088,
      marginLeft: 244,
      marginTop: 0,
      borderRadius: 8
    },
    monitoringTab: {
      width: 392,
      marginLeft: 244,
      marginTop: 0,
      height: 76
    }
  })

export default styles
