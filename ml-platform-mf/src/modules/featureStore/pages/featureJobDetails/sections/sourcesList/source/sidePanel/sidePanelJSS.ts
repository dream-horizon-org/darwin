import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../../../../../../../theme.contants'

export const useStyles = makeStyles(() => ({
  drawerHeader: {
    alignItems: 'center',
    backgroundColor: aliasTokens.disabled_border_color,
    display: 'flex',
    padding: '24px',
    fontWeight: 700,
    fontSize: 20,
    lineHeight: '28px',
    zIndex: 5,
    minWidth: '400px'
  },
  drawerContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: '0 1rem'
  },
  sqlEditor: {
    '& .CodeMirror': {
      height: '100vh'
    }
  },
  featureList: {
    marginTop: '1rem',
    width: '100%'
  }
}))
