import {createStyles} from '@mui/material'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      '& .MuiTabs-flexContainer': {
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${aliasTokens.tertiary_background_color}`
      },
      '& .MuiTab-textColorPrimary.Mui-selected': {
        color: aliasTokens.cta_tertiary_text_color
      }
    },
    dataBox: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    dataBoxContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    surface: {
      height: '180px',
      alignItems: 'center',
      justifyContent: 'center'
    },
    actionBtnContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    actionDescription: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      marginBottom: '20px'
    },
    betaTag: {
      marginLeft: '4px',
      backgroundColor: aliasTokens.cta_hover_primary_background_color,
      color: aliasTokens.secondary_text_color,
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: 700,
      borderRadius: '4px'
    },
    stickyHeader: {
      position: 'sticky',
      top: '64px',
      zIndex: 10
    }
  })

export default styles
