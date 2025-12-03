import {createStyles} from '@mui/styles'
import {aliasTokens} from '../../../../../theme.contants'
import {Typography} from '../../../../../themes'

const styles = createStyles({
  container: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px'
  },
  header: {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  filtersContainer: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '8px'
  },
  filterByText: Typography.is('body2')
    .with({
      color: aliasTokens.label_text_color_new,
      whiteSpace: 'nowrap'
    })
    .toCSS()
})

export default styles
