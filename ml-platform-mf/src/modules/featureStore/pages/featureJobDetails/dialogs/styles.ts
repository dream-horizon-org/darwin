import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../../../../theme.contants'

export const useStyles = makeStyles(() => ({
  card: {
    marginRight: '54px',
    width: '100%'
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    padding: '20px 24px 0 24px',
    fontWeight: 700,
    fontSize: 20,
    lineHeight: '28px'
  },
  contentBox: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    padding: '0 24px'
  },
  infoBox: {
    width: '33%',
    padding: '24px 0',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  captionText: {
    color: aliasTokens.tertiary_text_color,
    marginBottom: 4
  },
  tags: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexWrap: 'wrap'
  },
  tag: {
    alignItems: 'center',
    textAlign: 'center',
    padding: '4px 8px',
    marginRight: '4px',
    borderRadius: 4,
    color: aliasTokens.primary_text_color,
    backgroundColor: aliasTokens.surface_background_color,
    fontSize: 12
  },
  viewBtn: {
    color: aliasTokens.cta_secondary_text_color,
    fontSize: '0.85rem',
    fontWeight: 700
  },
  section: {
    marginTop: 24
  },
  headerWrapper: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '24px',
    fontWeight: 700,
    fontSize: 20,
    lineHeight: '28px',
    width: '100%'
  },
  headerTitle: {
    alignItems: 'center',
    padding: '24px',
    fontWeight: 700,
    fontSize: 20,
    lineHeight: '28px'
  },
  checkIcon: {
    backgroundColor: aliasTokens.success_background_color,
    borderRadius: '16px',
    width: '16px',
    height: '16px',
    padding: '4px',
    fontSize: '16px'
  },
  chip: {
    height: 24,
    padding: '4px 8px',
    borderRadius: 4,
    fontWeight: 'normal',
    '& > svg': {
      color: aliasTokens.primary_text_color
    },
    '& > span': {
      fontSize: '12px',
      padding: 0
    }
  },
  drawerHeader: {
    alignItems: 'center',
    backgroundColor: aliasTokens.disabled_border_color,
    display: 'flex',
    padding: '24px',
    fontWeight: 700,
    fontSize: 20,
    lineHeight: '28px',
    zIndex: 5
  },
  drawerContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: '0 1rem'
  },
  closeIcon: {
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  sqlEditor: {
    '& .CodeMirror': {
      height: '100vh'
    }
  }
}))
