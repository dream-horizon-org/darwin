import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../theme.contants'

const styles = () =>
  createStyles({
    copyCodeContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '346px'
    },
    selectedFeaturesCount: {
      background: aliasTokens.base_text_color,
      fontWeight: 700,
      fontSize: '12px',
      lineHeight: '24px',
      textAlign: 'center',
      color: '#616161',
      borderRadius: '20px',
      marginLeft: '4px',
      height: '20px',
      minWidth: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2px'
    },
    copySpanIcon: {
      marginRight: '6px'
    },
    selectedRow: {
      height: '28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '8px',
      flex: '0 0 28px'
    },
    text: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color
    },
    blueText: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.cta_secondary_text_color,
      cursor: 'pointer'
    },
    listContainer: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '245px',
      overflowY: 'auto'
    },
    listItem: {
      display: 'flex',
      background: aliasTokens.secondary_background_color,
      borderRadius: '4px',
      margin: '0px 8px 6px 8px',
      alignItems: 'center',
      flex: '0 0 48px'
    },
    title: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      flex: 1,
      paddingLeft: '16px'
    },
    delete: {
      '& .icon:before': {
        color: `${aliasTokens.secondary_text_color} !important`
      }
    },
    copySetContainer: {
      margin: '8px',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 10px'
    },
    copytSetItem: {
      display: 'flex',
      height: '36px',
      flex: '0 0 36px',
      alignItems: 'center',
      cursor: 'pointer'
    },
    copySetText: {
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      marginLeft: '11px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      flex: 1
    }
  })

export default styles
