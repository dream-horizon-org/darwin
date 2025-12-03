import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../theme.contants'

const styles = makeStyles((props) => ({
  listContainer: {
    display: 'flex'
  },
  mainContainer: {
    display: 'flex',
    width: '100%'
  },
  datalistContainer: {
    width: 'calc(100% - 316px)'
  },
  sidePanelContainer: {
    marginLeft: '24px',
    flex: '0 0 292px'
  },
  noResultsFoundContainer: {
    height: '500px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  noResultsTextContainer: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '& > p': {
      fontSize: '2rem',
      color: aliasTokens.error_border_color
    }
  },
  header: {
    display: 'flex',
    alignItems: 'center'
  },
  infoIcon: {
    fontSize: '1.2rem',
    marginLeft: '12px'
  },
  activePodsHeader: {
    flex: '0 1 auto'
  },
  loader: {
    display: 'flex',
    width: '100%',
    marginTop: '300px'
  }
}))

export default styles
