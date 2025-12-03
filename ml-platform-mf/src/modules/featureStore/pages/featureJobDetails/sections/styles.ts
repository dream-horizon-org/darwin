import makeStyles from '@mui/styles/makeStyles'
import {aliasTokens} from '../../../../../theme.contants'

export const useStyles = makeStyles((props) => ({
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
    width: '35%',
    padding: '24px 0',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  infoBoxLarge: {
    width: '65%',
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
    marginTop: '20px',
    position: 'relative'
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
  checkIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0F9635',
    borderRadius: '12px',
    width: '24px',
    height: '24px',
    margin: 'auto'
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
  link: {
    color: aliasTokens.cta_secondary_text_color
  },
  editorHeader: {
    fontWeight: 700,
    color: aliasTokens.hover_neutral_color,
    padding: '0 0 16px 24px',
    borderBottom: `1px solid ${aliasTokens.disabled_border_color}`,
    fontSize: '18px',
    lineHeight: '24px'
  },
  viewMore: {
    zIndex: 10,
    background:
      'linear-gradient(0deg, rgba(39, 40, 34, 1) 45.21%, rgba(39, 40, 34, 0.1) 142.31%)',
    height: 70,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    textTransform: 'uppercase',
    color: aliasTokens.cta_secondary_text_color,
    cursor: 'pointer'
  },
  sqlEditor: {
    '& .cm-s-monokai.CodeMirror': {
      '&>div': {
        scroll: 'unset !important'
      }
    },
    '& .CodeMirror-scroll': {
      scroll: 'unset !important'
    }
  },
  databricksLinkContainer: {
    padding: '24px 0',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  databricksLink: {
    color: aliasTokens.cta_secondary_text_color,
    display: 'flex',
    alignItems: 'center'
  },
  launchIcon: {
    marginLeft: '0.3rem',
    color: aliasTokens.secondary_icon_color
  }
}))
