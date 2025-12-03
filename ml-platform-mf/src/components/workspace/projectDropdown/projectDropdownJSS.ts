import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    menuButton: {},
    menuIcon: {
      color: aliasTokens.disabled_icon_color
    },
    mainProjectName: {
      fontSize: '14px',
      color: aliasTokens.secondary_text_color,
      textTransform: 'none',
      marginLeft: '9px'
    },
    codespaceNameForProject: {
      fontSize: '14px',
      color: aliasTokens.cta_disabled_primary_background_color,
      textTransform: 'none',
      marginLeft: '9px'
    },
    dropdownIcon: {
      color: aliasTokens.secondary_text_color
    },
    menu: {
      '& .MuiMenu-list': {
        padding: 0
      }
    },
    tabs: {
      '& .MuiTabs-flexContainer': {
        color: aliasTokens.tertiary_background_color,
        backgroundColor: aliasTokens.cta_disabled_primary_text_color,
        fontSize: '12px',
        fontWeight: 700,
        borderBottom: `1px solid ${aliasTokens.cta_disabled_secondary_background_color}`
      },

      '& .Mui-selected': {
        color: aliasTokens.cta_tertiary_text_color
      }
    },
    projectCount: {
      backgroundColor: aliasTokens.surface_background_color,
      padding: '2px 8px',
      color: aliasTokens.secondary_text_color,
      fontSize: '12px',
      fontWeight: 700
    }
  })

export default styles
