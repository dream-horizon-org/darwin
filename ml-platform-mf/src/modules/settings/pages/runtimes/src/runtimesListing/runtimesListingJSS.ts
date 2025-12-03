import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../../theme.contants'
import {COLORS, Typography} from '../../../../../../themes'

const styles = createStyles({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: '40px 148px 0px 148px',
    boxSizing: 'border-box'
  },
  header: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  titleContainer: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  pageTitle: Typography.is('heading1').toCSS(),
  actionsContainer: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '12px'
  },
  searchContainer: {
    width: '305px',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  addRuntimeButton: {
    height: '40px',
    width: 'fit-content',
    display: 'flex',
    whiteSpace: 'nowrap',
    textTransform: 'none',
    paddingLeft: '0px',
    paddingRight: '0px',
    '& p': Typography.is('button2')
      .with({
        color: COLORS.NEUTRAL[10],
        fontWeight: 700,
        padding: '0px 16px',
        boxSizing: 'border-box'
      })
      .toCSS()
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexGrow: '1'
  },
  columnContainer: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '14px 16px 14px 0px',
    boxSizing: 'border-box',

    '& p': Typography.is('body2').toCSS()
  },
  statusIndicator: {
    height: '8px',
    width: '8px',
    borderRadius: '50%',
    marginRight: '8px',
    boxSizing: 'border-box'
  },
  emptyStateContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: '1',
    border: `1px solid ${aliasTokens.disabled_border_color}`,
    borderRadius: '0px 0px 8px 8px',
    borderTop: 'none',
    '& img': {
      marginBottom: '12px'
    }
  },
  emptyStateTitle: Typography.is('heading3')
    .with({
      marginBottom: '4px'
    })
    .toCSS(),
  emptyStateSubtitle: Typography.is('body2')
    .with({
      marginBottom: '16px',
      color: COLORS.NEUTRAL[50]
    })
    .toCSS()
})

export default styles
