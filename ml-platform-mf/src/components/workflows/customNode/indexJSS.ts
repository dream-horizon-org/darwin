import createStyles from '@mui/styles/createStyles'
import {createUseStyles} from 'react-jss'
import {aliasTokens} from '../../../theme.contants'

export const styles = createUseStyles({
  nodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: aliasTokens.surface_background_color,
    color: aliasTokens.primary_text_color,
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 400,
    borderRadius: '8px',
    maxWidth: '200px'
  },
  successNode: {
    border: `1px solid ${aliasTokens.cta_success_border_color_2}`
  },
  errorNode: {
    border: `1px solid ${aliasTokens.cta_error_border_color_2}`
  },
  selectedNode: {
    border: `1px solid ${aliasTokens.blue_border_color_2}`
  },
  skippedNode: {
    border: `1px solid ${aliasTokens.cta_skipped_border_color}`
  },
  runningNode: {
    border: `1px solid #A780E9`
  },
  nodeTitleContainer: {
    padding: '8px',
    backgroundColor: '#000000',
    borderRadius: '4px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  description: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    marginTop: '5px'
  },
  descriptionText: {
    marginLeft: '4px',
    color: aliasTokens.tertiary_text_color,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  actionIcons: {
    display: 'flex'
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: `1px solid ${aliasTokens.disabled_border_color}`,
    borderRadius: '50%',
    padding: '4px',
    marginTop: '4px',
    marginLeft: '4px',

    '&:first-of-type': {
      marginLeft: '0px'
    },

    '& svg': {
      fontSize: '16px'
    }
  },
  addIcon: {
    position: 'absolute',
    left: 'calc(100% + 6px)',
    top: '34%'
  }
})

export default styles
