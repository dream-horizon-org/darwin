import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      '& .react-flow__node': {
        padding: 0
      }
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
    upstreamFailedNode: {
      border: `1px solid #ffa500`
    },
    nodeTitleContainer: {
      padding: '8px',
      backgroundColor: '#000000',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center'
    },
    nodeTitleText: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      marginLeft: '4px'
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
    info: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: 400,
      color: aliasTokens.primary_text_color,
      marginBottom: '16px',

      '& span': {
        '&:before': {
          color: '#A781E9',
          fontSize: '24px'
        }
      }
    },
    infoText: {
      marginLeft: '8px'
    },
    checkbox: {
      color: aliasTokens.default_border_color,
      padding: 0,

      '&.Mui-checked': {
        color: aliasTokens.blue_border_color_2
      },
      '&.Mui-disabled': {
        color: aliasTokens.disabled_border_color
      }
    }
  })

export default styles
