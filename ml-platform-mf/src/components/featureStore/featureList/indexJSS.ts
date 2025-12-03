import createStyles from '@mui/styles/createStyles'
import {aliasTokens} from '../../../theme.contants'

const styles = () =>
  createStyles({
    container: {},
    loader: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '200px'
    },
    noResultsFound: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      marginTop: '200px',
      color: aliasTokens.neutral_text_color,
      fontSize: '18px',
      fontWeight: 600
    },
    searchContainer: {
      display: 'flex',
      flex: '1 1 374px',
      maxWidth: '374px',
      justifyContent: 'space-between',
      marginBottom: '20px'
    },
    rightDrawerContainer: {
      width: '360px',
      display: 'flex',
      flexDirection: 'column'
    },
    drawerTitleContainer: {
      display: 'flex',
      height: '64px',
      alignItems: 'center'
    },
    drawerTitleIcon: {
      marginLeft: '20px'
    },
    drawerTitle: {
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      marginLeft: '20px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      paddingRight: '16px'
    },
    drawerDataList: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      overflowY: 'auto'
    },
    drawerDataRow: {
      flex: '0 0 48px',
      display: 'flex',
      alignItems: 'center',
      background: aliasTokens.primary_background_color,
      border: `1px solid ${aliasTokens.cta_disabled_primary_text_color}`,
      borderRadius: '4px',
      height: '48px',
      padding: '0px 16px',
      margin: '0 16px 12px 16px'
    },
    dataIcon: {
      height: '32px',
      width: '32px',
      borderRadius: '32px',
      overflow: 'hidden',
      background: 'teal'
    },
    dataTitle: {
      flex: 1,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      color: aliasTokens.neutral_text_color,
      margin: '0 12px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    dataLink: {}
  })

export default styles
