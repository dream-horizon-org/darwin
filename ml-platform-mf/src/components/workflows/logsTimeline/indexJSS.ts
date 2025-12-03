import {createStyles} from '@mui/material'
import {aliasTokens, globalTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    description: {
      color: aliasTokens.tertiary_text_color,
      fontSize: '16px',
      marginLeft: '5px'
    },
    eventIcon: {
      fontSize: '1.5rem'
    },
    connector: {
      backgroundColor: aliasTokens.disabled_border_color
    },
    longConnector: {
      minHeight: '45px'
    },
    timelineContent: {
      minWidth: '300px'
    },
    text: {
      fontSize: '16px'
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
    }
  })

export default styles
