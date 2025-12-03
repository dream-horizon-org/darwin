import {createStyles} from '@mui/material'
import {aliasTokens, globalTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      marginTop: '20px',
      display: 'flex',
      borderRadius: '8px',
      border: `1px solid ${aliasTokens.tertiary_background_color}`
    },
    scrollContainer: {
      maxHeight: '80vh',
      overflowY: 'scroll',
      width: '100%',

      '& .MuiTimelineItem-root': {
        minHeight: '40px'
      },

      '& .MuiTimelineOppositeContent-root': {
        padding: '0 16px'
      },

      '& .MuiTimelineContent-positionRight': {
        padding: '0 16px'
      }
    },
    eventIcon: {
      fontSize: '1.5rem'
    },
    startingIcon: {
      '&:before': {
        color: `${aliasTokens.active_background_color} !important`
      }
    },
    stoppedIcon: {
      '&:before': {
        color: `${globalTokens.color_yellow_50} !important`
      }
    },
    eventLink: {
      color: aliasTokens.cta_tertiary_text_color,
      fontSize: '14px',
      cursor: 'pointer'
    },
    connector: {
      backgroundColor: aliasTokens.disabled_border_color
    },
    eventLinkSeprator: {
      marginLeft: '0.52rem'
    },
    text: {
      fontSize: '16px'
    },
    description: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '16px',
      marginLeft: '5px'
    },
    longConnector: {
      minHeight: '45px'
    },
    logsLink: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.cta_secondary_text_color,
      marginLeft: '4px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      '& .text-part': {
        textDecorationLine: 'underline'
      }
    },
    logsDisabledLink: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.disabled_text_color,
      marginLeft: '4px',
      cursor: 'not-allowed',
      display: 'inline-flex',
      alignItems: 'center',
      '& .text-part': {
        textDecorationLine: 'underline'
      }
    }
  })

export default styles
