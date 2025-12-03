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
    rowGap: '16px',
    overflowX: 'auto',
    boxSizing: 'border-box'
  },
  header: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  heading: Typography.is('body2Bold').toCSS(),
  cardsContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '16px',
    overflowX: 'auto',
    boxSizing: 'border-box'
  },
  card: {
    width: '343px',
    minWidth: '343px',
    maxWidth: '343px',
    height: '72px',
    minHeight: '72px',
    maxHeight: '72px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: aliasTokens.secondary_background_color,
    borderRadius: '8px',
    padding: '12px',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  cardHeader: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clusterName: Typography.is('heading4')
    .with({
      fontWeight: 'bold'
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
  cardFooter: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clusterCoresAndMemory: Typography.is('body3')
    .with({
      color: aliasTokens.tertiary_text_color,
      fontSize: '12px'
    })
    .toCSS(),
  clusterTime: Typography.is('caption2')
    .with({
      fontSize: '10px',
      color: aliasTokens.tertiary_text_color
    })
    .toCSS()
})

export default styles
