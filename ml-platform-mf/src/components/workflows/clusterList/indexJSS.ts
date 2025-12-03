import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {
      height: 'calc(100vh - 116px)',
      overflowY: 'auto',
      background: '#1A1A1A',
      paddingBottom: '60px',
      boxSizing: 'border-box'
    },
    headerContainer: {
      width: '100%',
      height: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      boxShadow: '0px 4px 20px 0px #0000004D',
      backdropFilter: 'blur(24px)',
      padding: '32px 16px 16px 16px',
      background: '#1A1A1ACC',
      position: 'sticky',
      top: 0,
      zIndex: 1
    },
    header: {
      width: '100%',
      height: '40px',
      display: 'flex',
      flexDirection: 'row',
      columnGap: '16px',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: '8px'
    },
    tabsWrapper: {
      display: 'flex',
      borderBottom: `1px solid ${aliasTokens.cta_disabled_secondary_background_color}`,
      justifyContent: 'flex-start',
      columnGap: '16px',
      width: '100%',
      marginBottom: '20px'
    },
    tabContainer: {
      flex: 1,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: '20px',
      padding: '12px 4px',
      borderBottom: '2px solid transparent',
      marginBottom: '-1px',
      textWrap: 'no-wrap',
      '&.selected': {
        color: aliasTokens.cta_secondary_text_color,
        borderBottom: `2px solid ${aliasTokens.cta_secondary_text_color}`
      },
      '& >span': {
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 700,
        lineHeight: '16px',
        marginLeft: '8px',
        background: aliasTokens.cta_disabled_secondary_background_color,
        '&.selected': {
          background: 'rgba(87, 171, 255, 0.20)'
        }
      }
    }
  })

export default styles
