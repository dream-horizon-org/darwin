import makeStyles from '@mui/styles/makeStyles'

export const styles = makeStyles(() => ({
  container: {
    width: '100%',
    marginTop: '20px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: 700,
    fontSize: 20,
    lineHeight: '28px'
  },
  sources: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '20px'
  }
}))
