import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../theme.contants'
import {Typography} from '../../../../../themes'

const styles = createStyles({
  container: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    '& .MuiTableRow-root': {
      cursor: 'pointer'
    },

    '& .MuiTableSortLabel-icon': {
      color: `${aliasTokens.neutral_text_color} !important`
    },

    '& .MuiTableCell-head > span': {
      display: 'flex !important',
      alignItems: 'center'
    }
  },
  clusterName: Typography.is('body2').toCSS(),
  statusIndicatorContainer: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: '10px'
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  status: Typography.is('body1').toCSS(),
  codespaces: Typography.is('body2')
    .with({
      textDecoration: 'underline'
    })
    .toCSS(),
  runtime: Typography.is('body2').toCSS(),
  statsContainer: {
    width: '100px',
    height: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statsTopContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  consumedStatsText: Typography.is('heading4').toCSS(),
  consumedStatsTagText: Typography.is('body2')
    .with({
      marginLeft: '2px'
    })
    .toCSS(),
  statsPercentageText: Typography.is('caption2').toCSS(),
  statsBottomContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tagsContainer: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    columnGap: '8px',
    flexWrap: 'nowrap'
  },
  tag: Typography.is('body1')
    .with({
      padding: '4px 8px',
      borderRadius: '2px',
      backgroundColor: aliasTokens.cta_disabled_secondary_background_color
    })
    .toCSS(),
  extraTagsText: Typography.is('body1')
    .with({
      color: aliasTokens.cta_secondary_text_color,
      cursor: 'pointer'
    })
    .toCSS(),
  createdBy: Typography.is('body2').toCSS(),
  createdOn: Typography.is('body2').toCSS(),
  noResultsFoundContainer: {
    width: '100%'
  }
})

export default styles
