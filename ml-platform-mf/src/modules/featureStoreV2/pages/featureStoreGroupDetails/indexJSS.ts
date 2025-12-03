import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      width: 'calc(100% + 32px)',
      margin: '-16px'
    },
    highlightTab: {
      textDecoration: 'underline'
    },
    dataBoxContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    tabsBox: {
      background: aliasTokens.secondary_background_color,
      marginLeft: '-32px',
      marginRight: '-24px',
      borderTop: `1px solid ${aliasTokens.disabled_border_color}`,
      borderBottom: `1px solid ${aliasTokens.disabled_border_color}`,
      padding: '0px 24px',
      '& .MuiTabs-flexContainer': {
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${aliasTokens.disabled_border_color}`
      },
      '& .MuiTab-textColorPrimary.Mui-selected': {
        color: aliasTokens.base_text_color
      },
      '& .MuiTabs-indicator': {
        borderBottom: `2px solid ${aliasTokens.base_text_color}`
      },
      '& .MuiTab-root': {
        textTransform: 'capitalize'
      }
    },
    dataBox: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      marginTop: '24px',
      width: '100%'
    },
    featureCount: {
      fontWeight: 600,
      fontSize: '12px',
      lineHeight: '16px',
      display: 'flex',
      alignItems: 'center',
      color: aliasTokens.neutral_text_color,
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color,
      padding: '2px 8px',
      borderRadius: '4px'
    }
  })

export default styles
