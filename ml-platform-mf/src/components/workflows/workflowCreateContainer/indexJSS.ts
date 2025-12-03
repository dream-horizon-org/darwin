import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      marginTop: '68px'
    },
    mainContent: {
      display: 'flex',
      width: '100%',
      height: 'calc(100vh - 128px)',
      '& .react-flow__node': {
        padding: 0
      }
    },
    sidepanel: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    },
    nodeContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: aliasTokens.surface_background_color,
      color: aliasTokens.primary_text_color,
      padding: '8px 12px',
      fontSize: '14px',
      fontWeight: 400,
      borderRadius: '8px'
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
    }
  })

export default styles
