import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      border: `1px solid ${aliasTokens.cta_disabled_secondary_background_color}`,
      borderRadius: '4px',
      padding: '8px',
      marginTop: '6px',
      '&:first-of-type': {
        marginTop: 0
      },
      boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.24)',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: aliasTokens.cta_hover_secondary_background_color,
        border: `1px solid ${aliasTokens.blue_border_color}`
      }
    },
    active: {
      backgroundColor: aliasTokens.cta_hover_secondary_background_color,
      border: `1px solid ${aliasTokens.blue_border_color}`
    },
    left: {
      display: 'flex',
      alignItems: 'center'
    },
    userIcon: {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: aliasTokens.secondary_text_color,
      borderRadius: '50%',
      color: aliasTokens.cta_hover_secondary_background_color,
      fontSize: '12px',
      flex: '0 0 20px'
    },
    projectDetails: {
      marginLeft: '10px',
      display: 'flex',
      flexDirection: 'column'
    },
    projectName: {
      fontSize: '12px',
      color: aliasTokens.neutral_text_color
    },
    subText: {
      display: 'flex',
      fontSize: '10px',
      color: aliasTokens.tertiary_text_color,
      marginTop: '2px'
    },
    smallSubText: {
      display: 'flex',
      fontSize: '8px',
      color: aliasTokens.tertiary_text_color,
      marginTop: '4px'
    },
    right: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    },
    rightIcon: {
      fontSize: '16px'
    },
    iconButton: {
      color: aliasTokens.secondary_text_color
    }
  })

export default styles
