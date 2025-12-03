import createStyles from '@mui/styles/createStyles'
import {aliasTokens, globalTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      '& .react-flow__node': {
        padding: 0
      },
      height: 'calc(100vh - 284px)'
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
    runningNode: {
      border: `1px solid #A780E9`
    },
    skippedNode: {
      border: `1px solid ${aliasTokens.cta_skipped_border_color}`
    },
    upstreamFailedNode: {
      border: `1px solid #ffa500`
    },
    nodeTitleContainer: {
      padding: '8px',
      backgroundColor: '#000000',
      borderRadius: '4px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      display: 'flex'
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
    closeIcon: {
      width: '24px'
    },
    taskDetailsHeader: {
      display: 'flex',
      padding: '20px 16px',
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
    },
    taskDetailsTitle: {
      fontSize: '16px',
      fontWeight: 700,
      marginLeft: '16px'
    },
    taskDetailsContainer: {
      display: 'flex',
      width: '100%'
    },
    taskoutput: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    },
    taskoutputTitleContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
      padding: '16px',
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
    },
    taskoutputTitle: {
      fontSize: '16px',
      fontWeight: 700
    },
    taskoutputContent: {
      // display: 'flex'
      margin: '24px',
      padding: '24px',
      borderRadius: '8px',
      border: `1px solid ${aliasTokens.disabled_border_color}`,
      maxHeight: '50%',
      overflowY: 'auto'
    }
  })

export default styles
