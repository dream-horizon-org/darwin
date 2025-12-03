import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../theme.contants'
import {Typography} from '../../../../../themes'

const styles = createStyles({
  container: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    rowGap: '16px'
  },
  header: {
    width: '1220px',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: Typography.is('body2Bold').toCSS(),
  clustersCount: Typography.is('body1')
    .with({
      padding: '2px 8px',
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color,
      borderRadius: '4px',
      marginLeft: '8px'
    })
    .toCSS(),
  viewAll: Typography.is('body1Bold')
    .with({
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      color: aliasTokens.base_text_color,
      cursor: 'pointer'
    })
    .toCSS(),
  viewAllIcon: {
    width: '16px',
    height: '16px',
    color: aliasTokens.base_text_color,
    marginLeft: '4px'
  },
  loaderContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '16px'
  },

  cardsContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '16px',
    overflowX: 'scroll'
  },
  card: {
    height: '144px',
    width: '396px',
    boxSizing: 'border-box',
    backgroundColor: aliasTokens.secondary_background_color,
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    overflow: 'hidden'
  },

  cardHeader: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px 0px 16px',
    boxSizing: 'border-box'
  },
  clusterName: Typography.is('heading4')
    .with({
      fontWeight: 'bold',
      width: '223px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    })
    .toCSS(),
  clusterStatus: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '8px'
  },
  clusterStatusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  clusterStatusText: Typography.is('body1').toCSS(),
  cardBody: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    padding: '0px 16px',
    boxSizing: 'border-box'
  },
  clusterStatsContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '20px'
  },
  clusterStat: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    rowGap: '4px'
  },
  statMainText: Typography.is('heading3').toCSS(),
  statSubText: Typography.is('body1')
    .with({
      color: aliasTokens.tertiary_text_color
    })
    .toCSS(),
  costContainer: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: '16px'
  },
  divider: {
    width: '2px',
    height: '20px',
    backgroundColor: aliasTokens.tertiary_background_color
  },
  amount: Typography.is('body3').toCSS(),
  amountHeader: Typography.is('caption2')
    .with({
      color: aliasTokens.tertiary_text_color
    })
    .toCSS(),
  cardFooter: {
    width: '100%',
    height: '32px',
    backgroundColor: 'rgba(51, 51, 51, 0.40)',
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px 16px'
  },
  footerLeft: {
    width: '250px',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '8px'
  },
  runtimeText: Typography.is('body1')
    .with({
      color: aliasTokens.tertiary_text_color
    })
    .toCSS(),
  footerRight: {
    width: 'fit-content',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '8px'
  },
  codespacesText: Typography.is('body1')
    .with({
      color: aliasTokens.tertiary_text_color
    })
    .toCSS()
})

export default styles
